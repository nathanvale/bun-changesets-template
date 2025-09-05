/* eslint-disable max-lines-per-function */
/**
 * Claude Facade - Entry point for Claude Code hook integration
 * Enhanced with structured logging and end-to-end observability
 */

import { Autopilot } from '../adapters/autopilot.js'
import { Fixer } from '../adapters/fixer.js'
import { ExitCodes } from '../core/exit-codes.js'
import { IssueReporter } from '../core/issue-reporter.js'
import { QualityChecker } from '../core/quality-checker.js'
import type { Issue, QualityCheckResult } from '../types.js'
import { createTimer, logger } from '../utils/logger.js'

// Claude Code payload format - matches actual Claude Code structure
interface ClaudeCodePayload {
  tool_name: string // "Write", "Edit", "MultiEdit"
  tool_input: {
    file_path: string
    content?: string // For Write
    old_string?: string // For Edit
    new_string?: string // For Edit
    edits?: Array<{
      // For MultiEdit
      old_string: string
      new_string: string
    }>
  }
}

export async function runClaudeHook(): Promise<void> {
  const hookTimer = createTimer('hook-execution')
  const correlationId = logger.setCorrelationId()

  // Use standard output for user visibility
  console.log('🔍 Quality check hook starting...')
  console.error(
    JSON.stringify({
      feedback: 'Quality check started',
      correlationId,
    }),
  )

  try {
    logger.debug('Hook started', { correlationId })

    // Read and parse payload from stdin
    const input = await readStdin()
    let payload: ClaudeCodePayload | undefined

    try {
      payload = JSON.parse(input) as ClaudeCodePayload
      logger.payloadReceived(payload)
      logger.payloadValidation(true)

      // Output for file being processed
      const fileName = payload.tool_input?.file_path?.split('/').pop()
      console.log(`📝 Processing: ${fileName}`)
      console.error(
        JSON.stringify({
          feedback: 'Processing file',
          file: fileName,
        }),
      )

      logger.hookStarted(payload.tool_name, payload.tool_input?.file_path || 'unknown')
    } catch (parseError) {
      logger.payloadValidation(false, [(parseError as Error).message])
      logger.warn('Malformed JSON payload, exiting gracefully')
      console.log('❌ Invalid payload format')
      console.error(
        JSON.stringify({
          feedback: 'Invalid payload format',
          error: (parseError as Error).message,
        }),
      )
      process.exit(ExitCodes.SUCCESS)
    }

    // Validate required fields (only if we have a valid payload)
    if (!payload || !payload.tool_name || !payload.tool_input?.file_path) {
      logger.warn('Invalid payload: missing required fields', {
        hasPayload: !!payload,
        hasToolName: payload ? !!payload.tool_name : false,
        hasFilePath: payload ? !!payload.tool_input?.file_path : false,
      })
      process.exit(ExitCodes.SUCCESS)
    }

    // Only process supported operations
    if (!shouldProcessOperation(payload.tool_name)) {
      logger.debug('Skipping unsupported operation', {
        operation: payload.tool_name,
        supportedOps: ['Write', 'Edit', 'MultiEdit'],
      })
      process.exit(ExitCodes.SUCCESS)
    }

    // Skip non-code files
    if (!isSupportedFileType(payload.tool_input.file_path)) {
      logger.debug('Skipping non-code file', {
        filePath: payload.tool_input.file_path,
        fileExtension: payload.tool_input.file_path.split('.').pop(),
      })
      process.exit(ExitCodes.SUCCESS)
    }

    // Initialize components
    logger.debug('Initializing quality check components')
    const checker = new QualityChecker()
    const reporter = new IssueReporter()
    const autopilot = new Autopilot()
    const fixer = new Fixer()

    // Run quality check with timing
    logger.qualityCheckStarted(payload.tool_input.file_path)
    const qualityTimer = createTimer('quality-check')
    const result = await checker.check([payload.tool_input.file_path], { fix: false })
    const qualityDuration = qualityTimer.end()

    if (result.success) {
      logger.qualityCheckCompleted(payload.tool_input.file_path, 0, qualityDuration)
      logger.hookCompleted(payload.tool_name, payload.tool_input.file_path, hookTimer.end(), true)

      // Success feedback
      console.log('✅ All quality checks passed!')
      console.error(
        JSON.stringify({
          feedback: 'All quality checks passed',
          file: payload.tool_input.file_path,
        }),
      )

      process.exit(ExitCodes.SUCCESS)
    }

    // Convert QualityCheckResult to CheckResult format
    const issues = extractIssuesFromQualityResult(result, payload.tool_input.file_path)
    logger.qualityCheckCompleted(payload.tool_input.file_path, issues.length, qualityDuration)

    const checkResult = {
      filePath: payload.tool_input.file_path,
      issues,
      hasErrors: !result.success,
      hasWarnings: issues.length > 0,
      fixable: issues.some((issue) => issue.fixable),
    }

    // Let autopilot decide what to do
    const decision = autopilot.decide(checkResult)
    const reasoning = decision.issues?.map((i) => i.rule).join(', ') || 'No specific reasoning'
    logger.autopilotDecision(
      payload.tool_input.file_path,
      decision.action,
      issues.length,
      reasoning,
    )

    // Output for autopilot decision
    console.log(`🤖 Autopilot: ${decision.action} (${issues.length} issues found)`)
    console.error(
      JSON.stringify({
        feedback: 'Autopilot decision',
        action: decision.action,
        issueCount: issues.length,
      }),
    )

    // Debug output to stderr to see which decision path is taken
    console.error(`DEBUG: Autopilot decision = ${decision.action}, issues count = ${issues.length}`)

    switch (decision.action) {
      case 'FIX_SILENTLY': {
        console.log('🔧 Auto-fixing issues...')
        console.error(
          JSON.stringify({
            feedback: 'Auto-fixing issues',
            file: payload.tool_input.file_path,
          }),
        )

        logger.autoFixStarted(payload.tool_input.file_path)
        const fixTimer = createTimer('auto-fix')
        const fixResult = await fixer.autoFix(payload.tool_input.file_path, result)
        fixTimer.end()

        if (fixResult.success) {
          logger.autoFixCompleted(payload.tool_input.file_path, issues.length, 0)
          logger.hookCompleted(
            payload.tool_name,
            payload.tool_input.file_path,
            hookTimer.end(),
            true,
          )

          console.log('✅ All issues auto-fixed successfully!')
          console.error(
            JSON.stringify({
              feedback: 'All issues auto-fixed',
              file: payload.tool_input.file_path,
            }),
          )

          process.exit(ExitCodes.SUCCESS)
        }

        // If auto-fix failed, report the issues using JSON format for Claude
        logger.error('Auto-fix failed', undefined, { filePath: payload.tool_input.file_path })

        console.log('❌ Auto-fix failed! Sending issues to Claude...')
        console.log('💡 Claude will see these errors and can fix them')
        console.error(
          JSON.stringify({
            feedback: 'Auto-fix failed',
            file: payload.tool_input.file_path,
            action: 'Claude will fix',
          }),
        )

        const output = reporter.formatForClaude(result)
        if (output) {
          outputClaudeBlocking(output, 'Auto-fix failed, quality issues need attention')
          logger.hookCompleted(
            payload.tool_name,
            payload.tool_input.file_path,
            hookTimer.end(),
            false,
          )
          process.exit(ExitCodes.QUALITY_ISSUES)
        }
        break
      }

      case 'CONTINUE':
        logger.info('Continuing despite issues', {
          filePath: payload.tool_input.file_path,
          issueCount: issues.length,
          reason: 'acceptable-issues',
        })
        logger.hookCompleted(payload.tool_name, payload.tool_input.file_path, hookTimer.end(), true)
        process.exit(ExitCodes.SUCCESS)
        break

      case 'REPORT_ONLY': {
        logger.info('Reporting unfixable issues', {
          filePath: payload.tool_input.file_path,
          unfixableCount: decision.issues?.length || 0,
        })

        if (decision.issues && decision.issues.length > 0) {
          const messages = decision.issues
            .map((issue) => issue.message || issue.rule)
            .filter(Boolean)

          logger.warn('Quality issues require manual intervention', {
            filePath: payload.tool_input.file_path,
            issueMessages: messages,
            issueCount: messages.length,
          })

          if (messages.length > 0) {
            const output = `❌ Quality issues found:\n\n${messages.join('\n')}`
            outputClaudeBlocking(output, 'Quality issues require manual intervention')
            logger.hookCompleted(
              payload.tool_name,
              payload.tool_input.file_path,
              hookTimer.end(),
              false,
            )
            process.exit(ExitCodes.QUALITY_ISSUES)
          }
        }

        logger.hookCompleted(payload.tool_name, payload.tool_input.file_path, hookTimer.end(), true)
        process.exit(ExitCodes.SUCCESS)
        break
      }

      case 'FIX_AND_REPORT': {
        logger.autoFixStarted(payload.tool_input.file_path)
        const fixTimer = createTimer('fix-and-report')
        const fixResult = await fixer.autoFix(payload.tool_input.file_path, result)
        fixTimer.end()

        const fixedCount = issues.length - (decision.issues?.length || 0)
        const remainingCount = decision.issues?.length || 0

        logger.autoFixCompleted(payload.tool_input.file_path, fixedCount, remainingCount)

        if (decision.issues && decision.issues.length > 0) {
          const messages = decision.issues
            .map((issue) => issue.message || issue.rule)
            .filter(Boolean)

          logger.warn('Some issues remain after auto-fix', {
            filePath: payload.tool_input.file_path,
            remainingIssueMessages: messages,
            remainingCount: messages.length,
          })

          if (messages.length > 0) {
            const output = `❌ Quality issues found:\n\n${messages.join('\n')}`
            outputClaudeBlocking(output, 'Some issues remain after auto-fix')
            logger.hookCompleted(
              payload.tool_name,
              payload.tool_input.file_path,
              hookTimer.end(),
              false,
            )
            process.exit(ExitCodes.QUALITY_ISSUES)
          }
        }

        if (fixResult.success) {
          logger.info('All issues successfully fixed', { filePath: payload.tool_input.file_path })
          logger.hookCompleted(
            payload.tool_name,
            payload.tool_input.file_path,
            hookTimer.end(),
            true,
          )
          process.exit(ExitCodes.SUCCESS)
        }

        logger.error('Fixes partially failed', undefined, {
          filePath: payload.tool_input.file_path,
        })
        logger.hookCompleted(
          payload.tool_name,
          payload.tool_input.file_path,
          hookTimer.end(),
          false,
        )
        process.exit(ExitCodes.QUALITY_ISSUES)
      }
    }

    // If we reach here with errors, report quality issues using formatted text
    const success = result.success
    if (!success) {
      console.error('')
      console.error('🚫 QUALITY CHECK FAILED - Issues Found')
      console.error('='.repeat(60))

      const output = reporter.formatForClaude(result)
      if (output) {
        console.error('')
        console.error(output)
        console.error('')
        console.error('Please fix these issues before proceeding.')
        console.error('='.repeat(60))
      }

      logger.hookCompleted(payload.tool_name, payload.tool_input.file_path, hookTimer.end(), false)
      process.exit(ExitCodes.QUALITY_ISSUES)
    }
    logger.hookCompleted(payload.tool_name, payload.tool_input.file_path, hookTimer.end(), success)
    process.exit(success ? ExitCodes.SUCCESS : ExitCodes.QUALITY_ISSUES)
  } catch (error) {
    logger.error('Claude hook error', error as Error, {
      phase: 'hook-error',
      correlationId: logger.getCorrelationId(),
    })

    console.log('❌ Hook error occurred')
    console.error(
      JSON.stringify({
        feedback: 'Hook error',
        error: (error as Error).message,
        correlationId: logger.getCorrelationId(),
      }),
    )

    // Exit gracefully - don't block Claude for hook issues
    logger.hookCompleted('unknown', 'unknown', hookTimer.end(), false)
    process.exit(ExitCodes.SUCCESS)
  } finally {
    // Cleanup if needed
    logger.debug('Hook execution completed', { correlationId: logger.getCorrelationId() })
  }
}

/**
 * Read JSON payload from stdin
 */
function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolve(data))

    // Timeout to prevent hanging - return empty object for graceful handling
    setTimeout(() => resolve('{}'), 5000)
  })
}

/**
 * Check if file type is supported for quality checking
 */
function isSupportedFileType(filePath: string): boolean {
  return /\.(js|jsx|ts|tsx)$/.test(filePath)
}

/**
 * Check if operation should be processed
 */
function shouldProcessOperation(operation: string): boolean {
  const supportedOperations = ['Write', 'Edit', 'MultiEdit']
  return supportedOperations.includes(operation)
}

/**
 * Output formatted text to stderr for Claude Code PostToolUse hooks with blocking behavior
 */
function outputClaudeBlocking(reason: string, additionalContext?: string): void {
  // Output formatted text to stderr for Claude to process (PostToolUse with exit code 2)
  console.error('')
  console.error('🚫 BLOCKING: You must fix these issues before proceeding:')
  console.error('')

  // Parse the reason to extract individual issues and format them with ACTION REQUIRED
  const lines = reason.split('\n').filter((line) => line.trim())
  let issueCount = 1

  for (const line of lines) {
    if (line.includes('❌ Quality issues found:')) continue
    if (line.trim() === '') continue

    console.error(`${issueCount}. QUALITY ISSUE: ${line}`)
    console.error(`   ACTION REQUIRED: Fix this issue before continuing`)
    console.error('')
    issueCount++
  }

  if (additionalContext && additionalContext !== reason) {
    console.error(`CONTEXT: ${additionalContext}`)
    console.error('')
  }

  console.error('❌ DO NOT PROCEED until all issues are resolved. Update your code now.')
  console.error('')
}

/**
 * Extract issues from QualityCheckResult and convert to Autopilot Issue format
 */
function extractIssuesFromQualityResult(result: QualityCheckResult, filePath: string): Issue[] {
  const issues: Issue[] = []

  // Extract ESLint issues
  if (result.checkers.eslint && result.checkers.eslint.errors) {
    for (const error of result.checkers.eslint.errors) {
      // Parse ESLint error format to extract rule
      const ruleMatch = error.match(/\(([^)]+)\)$/)
      const rule = ruleMatch ? ruleMatch[1] : 'eslint-error'

      issues.push({
        rule,
        fixable: true, // Most ESLint rules are fixable
        message: error,
        file: filePath,
      })
    }
  }

  // Extract TypeScript issues
  if (result.checkers.typescript && result.checkers.typescript.errors) {
    for (const error of result.checkers.typescript.errors) {
      issues.push({
        rule: 'typescript-error',
        fixable: false, // TypeScript errors usually require human intervention
        message: error,
        file: filePath,
      })
    }
  }

  // Extract Prettier issues
  if (result.checkers.prettier && result.checkers.prettier.errors) {
    for (const error of result.checkers.prettier.errors) {
      issues.push({
        rule: 'prettier/prettier',
        fixable: true, // Prettier issues are always auto-fixable
        message: error,
        file: filePath,
      })
    }
  }

  return issues
}

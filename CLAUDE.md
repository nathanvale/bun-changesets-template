## 🧠 ADHD-Engineered Development Template with VSCode Intelligence

**The world's first development template specifically engineered for ADHD brains with integrated VSCode debugging intelligence**

This template transforms development from cognitively exhausting to cognitively supportive through comprehensive cognitive load reduction systems and 26 specialized VSCode debugging features, built on a proven Node.js + pnpm foundation.

### Product Context

- **Mission & Vision:** @.agent-os/product/mission.md
- **Technical Architecture:** @.agent-os/product/tech-stack.md  
- **Development Roadmap:** @.agent-os/product/roadmap.md
- **Decision History:** @.agent-os/product/decisions.md

### Development Standards

- **Code Style:** @~/.agent-os/standards/code-style.md
- **Best Practices:** @~/.agent-os/standards/best-practices.md

## ⚡ Quick Start

### 🧠 ADHD-Optimized Commands

**Core Development (Muscle Memory)**
| Command            | Description                    | ADHD Benefit                 |
| ------------------ | ------------------------------ | ---------------------------- |
| `pnpm dx:status`   | Instant context recovery       | ≤10s to understand current state |
| `pnpm test`        | Run tests once                 | Quick validation loop        |
| `pnpm test:watch`  | Watch mode testing             | Continuous feedback during development |
| `pnpm dev`         | Start development server       | Begin coding session         |
| `pnpm build:all`   | Build everything               | Prepare for production       |

**ADHD Flow Tools (Cognitive Support)**
| Command            | Description                    | ADHD Benefit                 |
| ------------------ | ------------------------------ | ---------------------------- |
| `pnpm dx:idea`     | Capture idea without context switch | Preserve flow state     |
| `pnpm dx:snapshot` | Save complete work session     | Interruption recovery       |
| `pnpm dx:resume`   | Restore work context           | <30s back to productivity    |
| `pnpm dx:focus`    | Toggle focus mode              | Reduce sensory overload      |

**VSCode ADHD Debug Tools**
| Command/Feature    | Description                    | ADHD Benefit                 |
| ------------------ | ------------------------------ | ---------------------------- |
| Adaptive Debug     | Context-aware debugging        | Zero decision paralysis      |
| Correlation Trace  | Multi-layer request tracking   | Never lose context           |
| Breakpoint Packs   | Pre-made debugging templates   | Instant problem-specific setup |
| Focus Debug Mode   | Distraction-free debugging UI  | Maintain flow during debug   |

> 🧠 **ADHD Design**: Commands optimized for working memory limits, context switching costs, and flow state protection.

## 🧠 ADHD Engineering Principles

### Core Philosophy
**Cognitive Load as a First-Class Concern:** Every feature decision is filtered through cognitive load impact. We treat attention, energy, and context as finite resources requiring careful management.

### Design Constraints
- **Context Recovery ≤10s**: Any interruption should be recoverable in under 10 seconds
- **Decision Paralysis Prevention**: Minimize choice overload through opinionated defaults
- **Flow State Protection**: Smart noise reduction and interruption handling
- **Progressive Complexity**: Start simple, add power without overwhelming
- **Dopamine-Driven Development**: Build motivation loops that work with ADHD brain chemistry

### Current Phase: ADHD Boost Bundle + VSCode Intelligence Foundation
Priority features for immediate cognitive load reduction + debugging intelligence:

**ADHD Core Features:**
1. `dx:status` command - instant context recovery
2. Idea inbox system - capture without context switching  
3. Session snapshots - save/restore complete work context
4. Focus mode toggle - smart noise reduction
5. Micro-success pings - celebrate small wins
6. Coverage ratchet - quality without overwhelm

**VSCode Debug Intelligence:**
7. Launch & attach profiles - Next.js, API, Vitest debugging
8. Adaptive debug command - context-aware debugging
9. Correlation ID tracing - multi-layer request tracking
10. Breakpoint packs - routing, hydration, performance templates
11. VSCode workspace setup - ADHD-optimized configuration
12. Debug session management - flow-preserving workflows

### Project Management

- **Active Specs:** @.agent-os/specs/
- **Spec Planning:** Use `@~/.agent-os/instructions/create-spec.md`
- **Tasks Execution:** Use `@~/.agent-os/instructions/execute-tasks.md`

## Workflow Instructions

When asked to work on this codebase:

1. **First**, check @.agent-os/product/roadmap.md for ADHD Boost Bundle + VSCode Intelligence priorities
2. **Consider cognitive load impact** of any changes - does it reduce or increase mental overhead?
3. **Evaluate VSCode integration opportunities** - how can debugging/development workflows be optimized?
4. **Follow appropriate instruction file**:
   - For new ADHD features: @.agent-os/instructions/create-spec.md
   - For VSCode debugging enhancements: @.agent-os/instructions/create-spec.md
   - For tasks execution: @.agent-os/instructions/execute-tasks.md
5. **Always** measure success through ADHD-specific metrics (context recovery time, decision paralysis reduction, debug session success rate)

## Important Notes

- **ADHD-First Design**: Every feature must directly address a specific ADHD challenge with measurable benefit
- **VSCode Intelligence Integration**: Debugging and development workflows should preserve cognitive context and reduce working memory load
- Product-specific files in `.agent-os/product/` override any global standards
- User's specific instructions override (or amend) instructions found in `.agent-os/specs/...`
- **Cognitive Load Override**: If code style conflicts with cognitive load reduction, prioritize ADHD accessibility
- **Flow State Protection**: Avoid changes that increase context switching or decision paralysis
- **Debug Context Preservation**: VSCode debugging features should enhance, not interrupt, flow state
- Always adhere to ADHD engineering principles and measure impact on neurodivergent developers
- VSCode features are enhancement layer - core ADHD functionality works without VSCode dependency

## AI Agent Coding Rules (STRICT)

Purpose: Minimize human rework by generating code that passes ESLint, TypeScript
checks, Vitest rules, and Prettier formatting on first attempt. Follow these in
every edit unless a spec explicitly overrides.

### 1. TypeScript & Types

- No `any` (rule: `@typescript-eslint/no-explicit-any`). If unavoidable, explain
  in a trailing comment and prefer a branded or union type.
- No non‑null assertions (`!`). Refactor to explicit guards or use optional
  chaining + nullish coalescing (`?.`, `??`).
- **CRITICAL: Always add explicit return types** for ALL functions, including React components:
  - React components: `function App(): React.JSX.Element`
  - Async functions: `async function fetch(): Promise<void>`
  - Event handlers: `const handler = (): void => { ... }`
  - **Never use deprecated `JSX.Element`** - always use `React.JSX.Element`
- Use `import type { Foo } from '...'` for all type imports (rule:
  `consistent-type-imports`).
- Prefer `Array<T>` over `T[]` (house style) & meaningful generic names
  (`ResultType`, not `T`).
- Use discriminated unions instead of boolean parameter flags.
- Surface errors via `Error` subclasses – never throw string literals.
- **Strict Boolean Expressions:** Never use nullable values in conditionals directly:
  ```typescript
  // ❌ BAD - strict-boolean-expressions error
  if (value) { ... }
  if (array.length) { ... }
  
  // ✅ GOOD - explicit null/empty checks
  if (value != null && value !== '') { ... }
  if (array.length > 0) { ... }
  ```

### 2. Async & Promises

- **No floating promises** (`no-floating-promises` / `no-misused-promises`). ALWAYS handle promises:
  ```typescript
  // ❌ BAD - floating promise
  fetchData()
  setInterval(fetchData, 5000)
  
  // ✅ GOOD - explicit handling
  void fetchData() // For intentional fire-and-forget
  await fetchData() // For awaited execution
  setInterval(() => { void fetchData(); }, 5000) // In callbacks
  ```
- **Use top‑level `await`** in main entry files (unicorn/prefer-top-level-await):
  ```typescript
  // ❌ BAD - promise chain in main
  prepare().then(() => { ReactDOM.createRoot(...) })
  
  // ✅ GOOD - top-level await
  await prepare()
  ReactDOM.createRoot(...)
  ```
- For parallel awaits, use `Promise.all` with descriptive variable names; ensure
  independent operations only.
- **Promise return types:** Functions returning promises must have explicit Promise return types:
  ```typescript
  // ✅ GOOD
  async function prepare(): Promise<void> { ... }
  ```

### 3. Control Flow & Complexity

- **Keep functions short**: ≤75 LOC (≤200 in tests), complexity ≤15 (≤30 in tests), max 3
  nesting depth, max 4 parameters (else object param), per ESLint config.
- **Extract helpers when hitting limits**: If a function exceeds 75 lines, break it into smaller components:
  ```typescript
  // ❌ BAD - 77+ line function
  function LogDashboard() { /* huge implementation */ }
  
  // ✅ GOOD - extracted helpers
  function LogDashboard() {
    return (
      <div>
        <LogHeader {...headerProps} />
        <LogList {...listProps} />
      </div>
    )
  }
  ```
- Duplicate string literal appears ≥3 times → lift to `const` (sonarjs / magic
  string rule intent).
- **Nullish coalescing**: Use `??` instead of `||` for null/undefined fallbacks:
  ```typescript
  // ❌ BAD - incorrect fallback behavior
  const url = env.API_URL || 'default'
  
  // ✅ GOOD - only fallback on null/undefined
  const url = env.API_URL ?? 'default'
  ```

### 4. Imports & Module Boundaries

- Do not introduce circular deps; if adding a new cross‑package import, confirm
  direction (utils → core is forbidden; core may import utilities).
- Keep import groups ordered: builtin, external, internal workspace packages,
  relative; no blank line at file end (Prettier fixes spacing—don’t fight it).
- Never deep import another package's internal path (only public exports).

### 5. Style & Formatting

- Single quotes, no semicolons, trailing commas where valid (Prettier).
- Named function declarations for React components (not anonymous arrows).
- Avoid inline logical render patterns like `{flag && <X />}`; use ternary
  `flag ? <X /> : null` for clarity (house rule).
- Prefix intentionally unused params / vars with `_` to satisfy no‑unused‑vars.

### 6. API & Network Safety

- **Type all API responses**: Never return raw `response.json()` - always cast to expected type:
  ```typescript
  // ❌ BAD - unsafe return type
  return response.json()
  
  // ✅ GOOD - typed API response
  return response.json() as Promise<LogEntry[]>
  ```
- **Environment variables**: Use proper access patterns and fallbacks:
  ```typescript
  // ✅ GOOD - dot notation with nullish coalescing
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'
  ```
- **Deprecated methods**: Replace deprecated string methods:
  ```typescript
  // ❌ BAD - deprecated substr
  str.substr(2, 9)
  
  // ✅ GOOD - modern slice
  str.slice(2, 11)
  ```

### 7. Security & Safety

- No use of `eval`, dynamic `Function` – rules enforce but avoid generating.
- Validate external input early; narrow types before use.
- Avoid constructing file system paths from untrusted pieces without
  normalization.

### 8. Logging

- Production code: prefer `console.error`, `console.warn`, `console.info` only.
  No `console.log` unless inside tests or temporary migration scripts (will
  trigger warning).
- Provide actionable context: structured objects not concatenated strings.

### 9. Testing (Vitest)

- ALWAYS use `test()` (rule `vitest/consistent-test-it`). Do not commit `.only`
  or `.skip`—will fail CI (`no-focused-tests`, `no-disabled-tests`).
- Prefer `describe` blocks for related groups; keep each test <30 LOC where
  possible (readability guard, not enforced by rule).
- Use `await` with all async expectations; use `expect.assertions(n)` if the
  path is conditional.
- Use Testing Library queries (`screen.findBy...` for async). No direct DOM
  traversal (avoid `container.querySelector`).
- Avoid testing implementation details (no spying on internal pure helpers—test
  public surface). Snapshot tests only for stable, low‑variance output.
- Coverage source of truth comes from `vitest run --coverage`—ensure new code is
  reachable or justify with comment.

### 10. Test Data & Mocks

- Prefer real values over broad mocks; keep mocks minimal & reset with
  `vi.resetAllMocks()` in `beforeEach` if spying.
- Use inline factory helpers for repeated objects instead of global mutable
  fixtures.
- **MSW setup**: Import Vitest globals explicitly to avoid unsafe calls:
  ```typescript
  import { afterAll, afterEach, beforeAll } from 'vitest'
  ```

### 11. ESLint Error Prevention Guide

**CRITICAL: These patterns prevent the most common ESLint errors**

- **Array access safety**: Always handle potential undefined from array access:
  ```typescript
  // ❌ BAD - can be undefined
  const level = levels[Math.floor(Math.random() * levels.length)]
  
  // ✅ GOOD - explicit fallback
  const level = levels[Math.floor(Math.random() * levels.length)] ?? 'info'
  ```

- **Template literals**: Numbers are allowed, but cast complex expressions:
  ```typescript
  // ✅ GOOD - numbers allowed
  `Response time: ${ms}ms`
  
  // ❌ BAD - complex expression
  `Status: ${response.ok}`
  
  // ✅ GOOD - explicit conversion
  `Status: ${String(response.ok)}`
  ```

- **React imports**: Always import React for JSX.Element types:
  ```typescript
  // ✅ GOOD
  import React from 'react'
  function Component(): React.JSX.Element { ... }
  ```

- **Boolean comparisons**: Don't compare booleans to booleans:
  ```typescript
  // ❌ BAD - unnecessary boolean comparison
  return (matchesText === true) && (matchesLevel === true)
  
  // ✅ GOOD - direct boolean use
  return matchesText && matchesLevel
  ```

### 12. Error Handling

- Return typed `Result` objects or throw errors—do not mix patterns in same
  function. For new API surface, prefer exceptions for truly exceptional states;
  otherwise return `{ ok: false, error }` with discriminant.
- Always include original cause: `new SomeError('message', { cause: err })`.

### 13. File & Package Hygiene

- Never edit generated outputs: `dist*`, coverage, or lock files outside normal
  tooling commands.
- If adding a package: update root `workspaces`, add TS project ref, and ensure
  build task outputs to `dist` / `dist-node` / `dist-types` pattern.

### 14. Performance Considerations

- Avoid unnecessary object spread in tight loops; preallocate arrays where size
  known. Use pure functions in utilities (no side effects, no date/time I/O).
- Early return over deeply nested conditionals.

### 15. React / JSX (when present)

- **Named function components** with explicit prop interfaces and return types:
  ```typescript
  interface Props { logs: LogEntry[] }
  function LogDashboard({ logs }: Props): React.JSX.Element { ... }
  ```
- Derive minimal state; compute derived values inline.
- No side effects in render path; hooks at top level only.
- **Conditional rendering**: Use explicit null checks for optional props:
  ```typescript
  // ✅ GOOD - explicit null check
  {(log.correlationId != null) && <span>({log.correlationId})</span>}
  ```

### 16. Prompt / Spec Alignment

- If a spec contradicts a rule, add a brief `// deviation: reason` comment and
  keep deviation localized.
- Summarize multi-file changes before applying large edits.

### 17. Example (Good)

```typescript
// utilities/src/math-utils.ts
export interface SumOptions {
  clampMin?: number
  clampMax?: number
}

export function safeSum(
  a: number,
  b: number,
  options: SumOptions = {},
): number {
  const total = a + b
  const { clampMin, clampMax } = options
  if (clampMin !== undefined && total < clampMin) return clampMin
  if (clampMax !== undefined && total > clampMax) return clampMax
  return total
}

// tests/math-utils.test.ts
import { safeSum } from '@template/utilities'

test('clamps above max', () => {
  expect(safeSum(5, 10, { clampMax: 12 })).toBe(12)
})
```

### 18. Common Agent Pitfalls (DO NOT)

- Generating code with implicit `any` from missing generics.
- Adding `!` to satisfy type errors instead of refining.
- Using deep relative paths between packages.
- Leaving floating promises in fire‑and‑forget utilities.
- Writing tests with `.only` or forgetting `await` before async calls.
- Creating large multi‑purpose functions to "save files"—prefer small focused
  ones.
- **Using deprecated `JSX.Element`** - always use `React.JSX.Element`
- **Forgetting explicit return types** on functions, especially React components
- **Using `||` instead of `??`** for null/undefined fallbacks
- **Not handling array access** - always provide fallbacks for potentially undefined values
- **Floating promises in useEffect/setInterval** - wrap with `void` for fire-and-forget
- **Missing React imports** when using JSX types
- **Raw `response.json()` returns** - always cast to expected types

If unsure: produce a minimal diff and request clarification instead of guessing.

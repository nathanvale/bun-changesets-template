#!/usr/bin/env bun
/**
 * Type declaration validator.
 * Ensures each export exposes runtime + matching type artifacts and maps.
 * Lint‑friendly: shallow nesting, no implicit any, explicit return types.
 */

import { existsSync } from 'node:fs';
import { isAbsolute, relative as relativePath, resolve as resolvePath } from 'node:path';
import packageJson from '../package.json';

interface PackageJsonExportsEntry {
  readonly bun?: string;
  readonly import?: string;
  readonly types?: string;
  readonly default?: string;
}

type PackageJsonExports = Record<string, PackageJsonExportsEntry | string>;

interface ValidationResult {
  readonly errors: string[];
  readonly warnings: string[];
}

const cwd = process.cwd();

/** Basic path sanitizer to reduce security rule noise & guard traversal */
function resolveProjectPath(projectRelativePath: string): string {
  if (projectRelativePath === '') throw new Error('Empty path not allowed');
  // Reject absolute input early
  if (isAbsolute(projectRelativePath)) {
    throw new Error(`Absolute path not allowed: ${projectRelativePath}`);
  }
  const fullPath = resolvePath(cwd, projectRelativePath);
  const rel = relativePath(cwd, fullPath);
  // If the relative path starts with '..' or is absolute (defensive), it's outside
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(
      `Path traversal detected: ${projectRelativePath} resolves outside project root`,
    );
  }
  return fullPath;
}

/** Safe file existence check with path validation */
function fileExists(relativePath: string): boolean {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return existsSync(resolveProjectPath(relativePath));
}

function checkBuildDirs(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const required = [
    { path: 'dist-types', err: 'dist-types directory missing - run "bun run build:types" first' },
    { path: 'dist-node', err: 'dist-node directory missing - run "bun run build:node" first' },
  ] as const;
  for (const item of required) {
    if (!fileExists(item.path)) errors.push(item.err);
  }
  // Optional Bun target
  if (!fileExists('dist')) {
    warnings.push('dist directory missing - run "bun run build" for Bun target');
  }
  return { errors, warnings };
}

function checkMainTypes(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const mainTypes = packageJson.types;
  if (!fileExists(mainTypes)) {
    errors.push(`Main types file missing: ${mainTypes}`);
    return { errors, warnings };
  }
  if (!fileExists(`${mainTypes}.map`)) {
    warnings.push(`Type declaration map missing: ${mainTypes}.map`);
  }
  const exportsRoot = (packageJson.exports as PackageJsonExports | undefined)?.['.'];
  if (
    exportsRoot !== undefined &&
    typeof exportsRoot === 'object' &&
    exportsRoot.types !== undefined &&
    exportsRoot.types !== mainTypes
  ) {
    errors.push(
      `Mismatch: package.json "types" (${mainTypes}) != exports['.'].types (${exportsRoot.types})`,
    );
  }
  return { errors, warnings };
}

function validateExportTypes(
  key: string,
  entry: PackageJsonExportsEntry,
  errors: string[],
  warnings: string[],
): void {
  if (entry.types === undefined || entry.types === '') {
    warnings.push(`Export "${key}" missing "types" field`);
    return;
  }
  if (!fileExists(entry.types)) {
    errors.push(`Export "${key}" types missing: ${entry.types}`);
    return;
  }
  if (!fileExists(`${entry.types}.map`)) {
    warnings.push(`Export "${key}" types map missing: ${entry.types}.map`);
  }
}

function validateExportRuntime(
  key: string,
  entry: PackageJsonExportsEntry,
  errors: string[],
  warnings: string[],
): void {
  if (entry.import !== undefined && entry.import !== '') {
    if (!fileExists(entry.import)) {
      errors.push(`Export "${key}" import file missing: ${entry.import}`);
    }
  }
  if (entry.bun !== undefined && entry.bun !== '') {
    if (!fileExists(entry.bun)) {
      warnings.push(`Export "${key}" bun file missing: ${entry.bun}`);
    }
  }
}

function checkExports(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const exportsField = packageJson.exports as PackageJsonExports | undefined;
  if (exportsField === undefined) return { errors, warnings };
  for (const [key, raw] of Object.entries(exportsField)) {
    if (typeof raw === 'string') {
      warnings.push(
        `Export "${key}" uses string format - consider using object format with "types" field`,
      );
      continue;
    }
    validateExportTypes(key, raw, errors, warnings);
    validateExportRuntime(key, raw, errors, warnings);
  }
  return { errors, warnings };
}

function mergeResults(...parts: ValidationResult[]): ValidationResult {
  return parts.reduce<ValidationResult>(
    (acc, cur) => ({
      errors: acc.errors.concat(cur.errors),
      warnings: acc.warnings.concat(cur.warnings),
    }),
    { errors: [], warnings: [] },
  );
}

function report(result: ValidationResult): void {
  const { errors, warnings } = result;
  if (errors.length > 0) {
    console.error('❌ Type validation failed:');
    for (const msg of errors) console.error(`  • ${msg}`);
  }
  if (warnings.length > 0) {
    console.warn('\n⚠️  Type validation warnings:');
    for (const msg of warnings) console.warn(`  • ${msg}`);
  }
  if (errors.length > 0) {
    console.error('\n💡 Tip: Run "bun run build:all" to generate all build artifacts');
    // Avoid direct process.exit per eslint unicorn/no-process-exit
    process.exitCode = 1;
    return;
  }
  if (warnings.length > 0) {
    console.info('\n✅ Passed with warnings (see above)');
  } else {
    console.info('✅ Type validation passed – all artifacts present');
  }
}

const result = mergeResults(checkBuildDirs(), checkMainTypes(), checkExports());
report(result);

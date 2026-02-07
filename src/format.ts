import { parse } from './parser';
import { formatStatements } from './formatter';

const DEFAULT_MAX_INPUT_SIZE = 10_485_760; // 10MB

/**
 * Options for {@link formatSQL}.
 */
export interface FormatOptions {
  /**
   * Maximum allowed parser nesting depth before failing fast.
   *
   * Deeply nested sub-expressions (subqueries, CASE chains, etc.) increase
   * memory and stack usage. Set this to guard against pathological input.
   *
   * @default 100
   */
  maxDepth?: number;

  /**
   * Maximum allowed input size in bytes.
   *
   * Prevents excessive memory consumption on very large inputs.
   *
   * @default 10_485_760 (10 MB)
   */
  maxInputSize?: number;
}

/**
 * Format SQL according to the Simon Holywell SQL Style Guide with river alignment.
 *
 * Keywords are right-aligned to form a visual "river" of whitespace, making
 * queries easier to scan. Identifiers are lowercased, keywords are uppercased.
 *
 * @param input - SQL text to format. May contain multiple statements.
 * @param options - Optional formatting options.
 * @returns Formatted SQL with a trailing newline, or empty string for blank input.
 * @throws {TokenizeError} When the input contains invalid tokens (e.g., unterminated strings).
 * @throws {ParseError} When parsing fails and recovery is not possible.
 * @throws {Error} When input exceeds maximum size.
 *
 * @example
 * ```typescript
 * import { formatSQL } from '@vcoppola/sqlfmt';
 *
 * formatSQL('select id, name from users where active = true;');
 * // =>
 * // SELECT id, name
 * //   FROM users
 * //  WHERE active = TRUE;
 * ```
 */
export function formatSQL(input: string, options: FormatOptions = {}): string {
  const maxSize = options.maxInputSize ?? DEFAULT_MAX_INPUT_SIZE;
  if (input.length > maxSize) {
    throw new Error(
      `Input exceeds maximum size of ${maxSize} bytes. Use the maxInputSize option to increase the limit.`
    );
  }

  const trimmed = input.trim();
  if (!trimmed) return '';

  const statements = parse(trimmed, { recover: true, maxDepth: options.maxDepth });

  if (statements.length === 0) return '';

  const formatted = formatStatements(statements)
    .split('\n')
    .map(line => line.replace(/[ \t]+$/g, ''))
    .join('\n');

  return formatted.trimEnd() + '\n';
}

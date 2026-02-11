import { describe, expect, it } from 'bun:test';
import { resolveDialectProfile } from '../src/dialects';
import type { DialectProfile } from '../src/dialects';

describe('dialect profile resolution', () => {
  it('resolves built-in dialect names', () => {
    expect(resolveDialectProfile('ansi').name).toBe('ansi');
    expect(resolveDialectProfile('postgres').name).toBe('postgres');
    expect(resolveDialectProfile('mysql').name).toBe('mysql');
    expect(resolveDialectProfile('tsql').name).toBe('tsql');
  });

  it('defaults to postgres when omitted', () => {
    expect(resolveDialectProfile().name).toBe('postgres');
  });

  it('defaults to postgres only when dialect is undefined', () => {
    const resolveUnknown = resolveDialectProfile as (dialect?: unknown) => DialectProfile;

    expect(resolveUnknown(undefined).name).toBe('postgres');
    expect(() => resolveUnknown('')).toThrow(/Unsupported SQL dialect/);
    expect(() => resolveUnknown(null)).toThrow(/Unsupported SQL dialect object/);
  });

  it('throws for unknown dialect names', () => {
    expect(() => resolveDialectProfile('oracle' as never)).toThrow(/Unsupported SQL dialect/);
  });

  it('normalizes custom profile keyword sets and statement handlers to uppercase', () => {
    const custom: DialectProfile = {
      name: 'ansi',
      keywords: new Set(['select', 'from', 'qualify']),
      functionKeywords: new Set(['current_date']),
      clauseKeywords: new Set(['from', 'qualify']),
      statementStarters: new Set(['select']),
      statementHandlers: { go: { kind: 'single_line_unsupported' } },
    };

    const resolved = resolveDialectProfile(custom);

    expect(resolved).not.toBe(custom);
    expect(resolved.keywords.has('SELECT')).toBe(true);
    expect(resolved.keywords.has('QUALIFY')).toBe(true);
    expect(resolved.functionKeywords.has('CURRENT_DATE')).toBe(true);
    expect(resolved.clauseKeywords.has('QUALIFY')).toBe(true);
    expect(resolved.statementStarters.has('SELECT')).toBe(true);
    expect(resolved.statementHandlers?.GO?.kind).toBe('single_line_unsupported');
    expect(resolved.statementHandlers?.go).toBeUndefined();

    // Resolver must not mutate caller-owned profile objects.
    expect(custom.keywords.has('select')).toBe(true);
    expect(custom.keywords.has('SELECT')).toBe(false);
    expect(custom.statementHandlers?.go?.kind).toBe('single_line_unsupported');
  });

  it('returns already-normalized custom profiles without cloning', () => {
    const custom: DialectProfile = {
      name: 'ansi',
      keywords: new Set(['SELECT', 'FROM']),
      functionKeywords: new Set(['CURRENT_DATE']),
      clauseKeywords: new Set(['FROM']),
      statementStarters: new Set(['SELECT']),
      statementHandlers: { GO: { kind: 'single_line_unsupported' } },
    };

    expect(resolveDialectProfile(custom)).toBe(custom);
  });
});

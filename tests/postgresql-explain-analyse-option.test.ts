import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL EXPLAIN ANALYSE option', () => {
  it('parses ANALYSE spelling in EXPLAIN options', () => {
    const sql = 'EXPLAIN (ANALYSE, VERBOSE) SELECT 1;';

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('normalizes ANALYSE to ANALYZE when formatting', () => {
    const sql = 'EXPLAIN (ANALYSE FALSE, VERBOSE TRUE) SELECT 1;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('EXPLAIN (VERBOSE)');
    expect(out).not.toContain('ANALYSE');
  });
});

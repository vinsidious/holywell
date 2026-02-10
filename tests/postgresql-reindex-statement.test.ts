import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL REINDEX statement parsing', () => {
  it('accepts REINDEX statements in strict mode', () => {
    const sql = 'REINDEX INDEX unlogged1_pkey;';

    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.trim()).toBe('REINDEX INDEX unlogged1_pkey;');
  });
});

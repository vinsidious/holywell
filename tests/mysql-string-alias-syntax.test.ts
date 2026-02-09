import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('MySQL select-list string alias syntax', () => {
  it('normalizes string literal aliases without AS into explicit AS aliases', () => {
    const sql = "SELECT col 'alias_name' FROM t;";
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out).toContain("SELECT col AS 'alias_name'");
  });
});

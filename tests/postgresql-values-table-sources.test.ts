import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL VALUES table sources', () => {
  it('parses VALUES-derived tables with alias column names', () => {
    const sql = "SELECT i FROM (VALUES(3)) AS foo (i);";
    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('FROM (VALUES');
    expect(out).toContain('AS foo(i)');
  });

  it('parses parenthesized VALUES sources in multi-source FROM clauses', () => {
    const sql = 'SELECT * FROM (SELECT * FROM int4_tbl), (VALUES (123456)) WHERE f1 = column1;';
    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('FROM (SELECT *');
    expect(out).toContain('(VALUES');
    expect(out).toContain('WHERE f1 = column1;');
  });
});

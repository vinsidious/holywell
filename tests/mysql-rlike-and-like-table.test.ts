import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('MySQL RLIKE checks and CREATE TABLE LIKE', () => {
  it('parses INSERT IGNORE INTO statements in strict mode', () => {
    const sql = 'INSERT IGNORE INTO t1 (a, b) VALUES (1, 2);';
    expect(() => parse(sql, { dialect: 'mysql', recover: false })).not.toThrow();
    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain('INSERT IGNORE INTO t1 (a, b)');
  });

  it('parses CHECK constraints with RLIKE operators', () => {
    const sql = "CREATE TABLE t (val VARCHAR(10) CHECK (val RLIKE 'abc'));";
    expect(() => parse(sql, { dialect: 'mysql', recover: false })).not.toThrow();
    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain("CHECK(val RLIKE 'abc')");
  });

  it('formats CREATE TABLE LIKE statements', () => {
    const out = formatSQL('create table ch1 like ctable;', { dialect: 'mysql' });
    expect(out.trim()).toBe('CREATE TABLE ch1 LIKE ctable;');
  });
});

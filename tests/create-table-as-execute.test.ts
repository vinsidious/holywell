import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('CREATE TABLE AS EXECUTE statements', () => {
  it('parses and formats CREATE TABLE AS EXECUTE', () => {
    const sql = 'CREATE TABLE as_select1 AS EXECUTE select1;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('CREATE TABLE as_select1 AS EXECUTE select1;');
  });

  it('parses and formats CREATE TABLE IF NOT EXISTS AS EXECUTE', () => {
    const sql = 'CREATE TABLE IF NOT EXISTS as_select1 AS EXECUTE select1;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('CREATE TABLE IF NOT EXISTS as_select1 AS EXECUTE select1;');
  });
});

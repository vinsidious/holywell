import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL array and xml function expressions', () => {
  it('parses ARRAY(subquery) constructor syntax', () => {
    const sql = 'SELECT ARRAY(SELECT 1);';
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.toUpperCase()).toContain('ARRAY(SELECT 1)');
  });

  it('parses xmlelement(name ...) syntax', () => {
    const sql = "SELECT xmlelement(name foo, 'bar');";
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.toUpperCase()).toContain("XMLELEMENT(NAME FOO, 'BAR')");
  });
});

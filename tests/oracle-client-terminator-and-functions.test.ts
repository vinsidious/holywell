import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('Oracle slash terminator and function clauses', () => {
  it('accepts SQL*Plus slash terminator lines in strict mode', () => {
    const sql = 'select 1 from dual where 1=1\n/';
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.toUpperCase()).toContain('SELECT 1');
    expect(out.toUpperCase()).toContain('FROM DUAL');
  });

  it('parses TRANSLATE ... USING NCHAR_CS function syntax', () => {
    const sql = 'SELECT TRANSLATE(product_name USING NCHAR_CS) FROM products;';
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.toUpperCase()).toContain('TRANSLATE(PRODUCT_NAME USING NCHAR_CS)');
  });
});

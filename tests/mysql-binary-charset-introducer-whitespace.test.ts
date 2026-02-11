import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('MySQL binary charset introducer whitespace', () => {
  it('parses _binary introducers with optional whitespace before string literals', () => {
    const withSingleSpace = "INSERT INTO test VALUES (_binary '\\0');";
    const withDoubleSpace = "INSERT INTO test VALUES (_binary  'abc');";

    expect(() => parse(withSingleSpace, { dialect: 'mysql', recover: false })).not.toThrow();
    expect(() => parse(withDoubleSpace, { dialect: 'mysql', recover: false })).not.toThrow();
  });

  it('formats _binary introducers with whitespace as valid statements', () => {
    const sql = "INSERT INTO test VALUES (_binary '\\0');";
    const out = formatSQL(sql, { dialect: 'mysql' });

    expect(out.toUpperCase()).toContain('INSERT INTO test'.toUpperCase());
    expect(out).toMatch(/_binary\s*'\\0'/);
  });
});

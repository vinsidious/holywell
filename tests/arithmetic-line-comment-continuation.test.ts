import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('Arithmetic line-comment continuation parsing', () => {
  it('parses arithmetic expressions when a line comment sits between operands', () => {
    const sql = `SELECT 1
-- this is a comment
+ 2 AS result;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('-- this is a comment');
    expect(out).toMatch(/SELECT 1 \+ -- this is a comment\s*\n2 AS result;/);
    expect(() => parse(out, { recover: false })).not.toThrow();
  });
});

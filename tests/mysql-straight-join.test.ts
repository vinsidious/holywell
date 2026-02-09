import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('MySQL STRAIGHT_JOIN parsing and formatting', () => {
  it('parses STRAIGHT_JOIN in strict mode and formats it as a JOIN clause', () => {
    const sql = 'SELECT * FROM a STRAIGHT_JOIN b ON a.id = b.id;';
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out).toContain('STRAIGHT_JOIN b');
    expect(out).toContain('ON a.id = b.id');
  });
});

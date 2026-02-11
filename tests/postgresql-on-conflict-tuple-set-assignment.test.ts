import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL ON CONFLICT tuple SET assignment', () => {
  it('parses and formats tuple assignments in DO UPDATE SET clauses', () => {
    const sql = `INSERT INTO foo (bar, baz) VALUES (1, 'var')
ON CONFLICT (bar) DO UPDATE
SET (baz) = (SELECT baz FROM foobar WHERE bar = 1);`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const recoveries: string[] = [];
    const out = formatSQL(sql, {
      onRecover: err => recoveries.push(err.message),
    });

    expect(recoveries).toEqual([]);
    expect(out).toContain('SET (baz) = (');
    expect(out).toContain('SELECT baz');
    expect(() => parse(out, { recover: false })).not.toThrow();
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL ON CONFLICT target predicate', () => {
  it('parses and formats ON CONFLICT targets that include WHERE predicates', () => {
    const sql = "INSERT INTO foo (bar, baz) VALUES (1, 'var') ON CONFLICT (bar) WHERE is_active DO NOTHING;";

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const recoveries: string[] = [];
    const out = formatSQL(sql, {
      onRecover: err => recoveries.push(err.message),
    });

    expect(recoveries).toEqual([]);
    expect(out).toContain('ON CONFLICT (bar) WHERE is_active');
    expect(out).toContain('DO NOTHING;');
  });
});

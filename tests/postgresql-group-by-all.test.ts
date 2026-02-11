import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL GROUP BY ALL', () => {
  it('parses and formats GROUP BY ALL with explicit grouping expressions', () => {
    const sql = 'SELECT a, count(*) FROM t1 GROUP BY ALL a;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('GROUP BY ALL a;');
  });

  it('parses and formats GROUP BY ALL with an empty select list', () => {
    const sql = 'SELECT FROM t1 GROUP BY ALL;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('SELECT');
    expect(out).toContain('FROM t1');
    expect(out).toContain('GROUP BY ALL;');
  });
});

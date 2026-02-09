import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('CREATE MATERIALIZED VIEW formatting', () => {
  it('parses and formats CREATE MATERIALIZED VIEW statements', () => {
    const sql = 'CREATE MATERIALIZED VIEW mv AS SELECT * FROM t;';
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out).toContain('CREATE MATERIALIZED VIEW mv AS');
    expect(out).toContain('SELECT *');
  });
});

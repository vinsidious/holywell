import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL ORDER BY USING custom operators', () => {
  it('parses and formats multi-symbol operators in ORDER BY USING', () => {
    const sql = 'SELECT a, b, c FROM t1 ORDER BY c USING ~<~, a;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('ORDER BY c USING ~<~, a;');
  });
});

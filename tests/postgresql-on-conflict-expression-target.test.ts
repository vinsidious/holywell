import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL ON CONFLICT expression target', () => {
  it('parses and formats ON CONFLICT target expressions including function calls', () => {
    const sql = `INSERT INTO tbl_a (val1, val2)
SELECT val1, val2
FROM tbl_2
ON CONFLICT (val1, COALESCE(val2, ''))
DO NOTHING;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const recoveries: string[] = [];
    const out = formatSQL(sql, {
      onRecover: err => recoveries.push(err.message),
    });

    expect(recoveries).toEqual([]);
    expect(out).toContain("ON CONFLICT (val1, COALESCE(val2, ''))");
    expect(out).toContain('DO NOTHING;');
  });
});

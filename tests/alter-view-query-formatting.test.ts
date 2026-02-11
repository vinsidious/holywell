import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('Alter view query formatting', () => {
  it('formats SELECT bodies in ALTER VIEW ... AS statements', () => {
    const sql = `ALTER VIEW demo_db1.view_t AS
    SELECT quantity FROM t;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain(`ALTER VIEW demo_db1.view_t AS
SELECT quantity
  FROM t;`);
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('NATURAL join variants', () => {
  it('parses NATURAL LEFT and NATURAL RIGHT joins in strict mode', () => {
    const sql = `SELECT *
FROM t1
NATURAL LEFT JOIN t2
NATURAL RIGHT JOIN t3;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('formats NATURAL FULL OUTER JOIN clauses', () => {
    const sql = `SELECT *
FROM t1 NATURAL FULL OUTER JOIN t2;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('NATURAL FULL OUTER JOIN');
  });
});

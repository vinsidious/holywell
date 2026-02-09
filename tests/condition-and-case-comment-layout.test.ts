import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Condition and CASE comment layout', () => {
  it('keeps inline condition comments attached without breaking AND indentation', () => {
    const sql = `SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id
AND t2.date >= '2024-01-01' -- start date
AND t2.date <= '2024-12-31' WHERE t1.active = 1`;

    const out = formatSQL(sql);

    expect(out).toContain("AND t2.date >= '2024-01-01' -- start date");
    expect(out).toContain("\n          AND t2.date <= '2024-12-31'");
    expect(out).not.toContain("\nAND t2.date <= '2024-12-31'");
  });

  it('preserves CASE branch trailing comments after THEN results', () => {
    const sql = `SELECT CASE
    WHEN a = 1 THEN 'one' -- check one
    WHEN a = 2 THEN 'two' -- check two
    ELSE 'other'
END AS result FROM t`;

    const out = formatSQL(sql);

    expect(out).toContain("WHEN a = 1 THEN 'one' -- check one");
    expect(out).toContain("WHEN a = 2 THEN 'two' -- check two");
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('GROUP BY CUBE parenthesis layout', () => {
  it('keeps grouping items attached to opening and closing parens', () => {
    const sql = `SELECT DATE_TRUNC('month', o.placed_at) AS month,
       o.currency,
       o.status,
       COUNT(*) AS cnt,
       SUM(o.total) AS revenue
  FROM orders AS o
 WHERE o.placed_at >= '2024-01-01'
 GROUP BY CUBE (
              DATE_TRUNC('month', o.placed_at),
              o.currency,
              o.status
          )
HAVING COUNT(*) > 0
 ORDER BY month, o.currency, o.status;`;

    const expected = `SELECT DATE_TRUNC('month', o.placed_at) AS month,
       o.currency,
       o.status,
       COUNT(*) AS cnt,
       SUM(o.total) AS revenue
  FROM orders AS o
 WHERE o.placed_at >= '2024-01-01'
 GROUP BY CUBE (DATE_TRUNC('month', o.placed_at),
               o.currency,
               o.status)
HAVING COUNT(*) > 0
 ORDER BY month, o.currency, o.status;`;

    const out = formatSQL(sql).trimEnd();
    expect(out).toBe(expected);
    expect(out).not.toContain('GROUP BY CUBE (\n');
    expect(out).not.toContain('\n          )');
  });
});

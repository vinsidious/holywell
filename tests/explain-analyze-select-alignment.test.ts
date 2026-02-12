import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('EXPLAIN ANALYZE SELECT alignment', () => {
  it('aligns wrapped select clauses under EXPLAIN river width', () => {
    const sql = `EXPLAIN (ANALYZE)
SELECT p.category,
       COUNT(*) AS product_count,
       AVG(p.price) AS avg_price
  FROM products AS p
 WHERE p.is_active = TRUE
   AND p.tags && ARRAY['premium']
 GROUP BY p.category
HAVING COUNT(*) > 5
 ORDER BY avg_price DESC;`;

    const expected = `EXPLAIN (ANALYZE)
 SELECT p.category,
        COUNT(*) AS product_count,
        AVG(p.price) AS avg_price
   FROM products AS p
  WHERE p.is_active = TRUE
    AND p.tags && ARRAY['premium']
  GROUP BY p.category
 HAVING COUNT(*) > 5
  ORDER BY avg_price DESC;`;

    expect(formatSQL(sql).trimEnd()).toBe(expected);
  });
});

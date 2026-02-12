import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('PostgreSQL INSERT ON CONFLICT RETURNING alignment', () => {
  it('keeps INSERT aligned when RETURNING widens the river', () => {
    const sql = `INSERT INTO products (sku, name, category, price)
   VALUES ('TEMP-999', 'Temporary Product', 'misc', 9.99)
       ON CONFLICT (sku)
       DO UPDATE
             SET name = excluded.name,
                 price = excluded.price
           WHERE products.price <> excluded.price
RETURNING *;`;

    const expected = `   INSERT INTO products (sku, name, category, price)
   VALUES ('TEMP-999', 'Temporary Product', 'misc', 9.99)
       ON CONFLICT (sku)
       DO UPDATE
             SET name = excluded.name,
                 price = excluded.price
           WHERE products.price <> excluded.price
RETURNING *;`;

    expect(formatSQL(sql).trimEnd()).toBe(expected);
  });
});

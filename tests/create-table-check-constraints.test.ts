import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('CREATE TABLE CHECK constraint layout', () => {
  it('formats table-level CHECK constraints as standalone constraints', () => {
    const sql = `CREATE TABLE t (
  id INT PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  CHECK (role IN ('a', 'b', 'c'))
);`;
    const out = formatSQL(sql);
    expect(out).toContain("CHECK(role IN ('a', 'b', 'c'))");
    expect(out).not.toContain(') );');
    expect(out).toContain('\n);');
  });
});

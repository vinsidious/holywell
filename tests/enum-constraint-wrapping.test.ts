import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('ENUM definition and constraint wrapping', () => {
  it('does not push DEFAULT clauses to extreme columns after long ENUM definitions', () => {
    const sql = `CREATE TABLE orders (
  status ENUM('Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled') DEFAULT 'Pending',
  note VARCHAR(20) NOT NULL
);`;
    const out = formatSQL(sql);
    expect(out).toContain("DEFAULT 'Pending'");
    expect(out).not.toMatch(/\n\s{35,}DEFAULT 'Pending'/);
  });
});

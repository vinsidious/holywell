import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('ALTER action keyword preservation', () => {
  it('keeps ALTER COLUMN keywords in ALTER INDEX actions', () => {
    const sql = 'ALTER INDEX attmp_idx ALTER COLUMN 0 SET STATISTICS 1000;';
    const once = formatSQL(sql);
    const twice = formatSQL(once);

    expect(once).toMatch(/ALTER COLUMN 0\s+SET STATISTICS 1000;/);
    expect(twice).toBe(once);
  });

  it('keeps RENAME CONSTRAINT keywords in ALTER TABLE actions', () => {
    const sql = 'ALTER TABLE distributors RENAME CONSTRAINT zipchk TO zip_check;';
    const once = formatSQL(sql);
    const twice = formatSQL(once);

    expect(once).toMatch(/RENAME CONSTRAINT zipchk TO zip_check;/);
    expect(twice).toBe(once);
  });
});

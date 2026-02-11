import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('PostgreSQL REVERSE function casing', () => {
  it('uppercases REVERSE in nested function expressions', () => {
    const sql = "SELECT POSITION('/' IN REVERSE(TRIM(TRAILING '/' FROM location))) AS p;";

    const out = formatSQL(sql);

    expect(out).toContain("POSITION('/' IN REVERSE(TRIM(TRAILING '/' FROM location)))");
  });
});

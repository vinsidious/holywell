import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('Grant and revoke recipient clauses', () => {
  it('parses and formats GRANT without an explicit TO target', () => {
    const sql = 'GRANT SELECT, INSERT, UPDATE ON employees;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('GRANT SELECT, INSERT, UPDATE');
    expect(out).toContain('ON employees;');
  });

  it('parses and formats REVOKE without an explicit FROM target', () => {
    const sql = 'REVOKE INSERT, UPDATE ON employees;';

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('REVOKE INSERT, UPDATE');
    expect(out).toContain('ON employees;');
  });
});

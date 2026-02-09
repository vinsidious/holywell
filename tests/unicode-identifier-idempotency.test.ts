import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Unicode identifier idempotency', () => {
  it('formats identifiers with dotted Turkish I idempotently', () => {
    const sql = 'SELECT 1 AS İsim;';
    const once = formatSQL(sql);
    const twice = formatSQL(once);
    expect(twice).toBe(once);
    expect(once).toContain('AS İsim;');
  });
});

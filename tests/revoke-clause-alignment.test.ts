import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('REVOKE clause alignment', () => {
  it('aligns ON and FROM clauses to REVOKE river width', () => {
    const sql = `REVOKE DELETE
  ON audit_log
FROM app_readwrite;`;

    const expected = `REVOKE DELETE
    ON audit_log
  FROM app_readwrite;`;

    expect(formatSQL(sql).trimEnd()).toBe(expected);
  });
});

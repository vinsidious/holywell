import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('ALTER statement layout regressions', () => {
  it('keeps OWNER TO as a top-level ALTER action', () => {
    const sql = `ALTER TABLE organizations
        OWNER TO app_admin;`;

    const expected = `ALTER TABLE organizations
OWNER TO app_admin;`;

    expect(formatSQL(sql).trimEnd()).toBe(expected);
  });

  it('splits ALTER COLUMN operation clauses onto stable continuation lines', () => {
    const sql = `ALTER TABLE orders
        ALTER COLUMN status SET DEFAULT 'pending';`;

    const expected = `ALTER TABLE orders
ALTER COLUMN status
  SET DEFAULT 'pending';`;

    expect(formatSQL(sql).trimEnd()).toBe(expected);
  });

  it('formats ADD CONSTRAINT CHECK bodies on continuation lines', () => {
    const sql = `ALTER TABLE users
        ADD CONSTRAINT chk_email_format CHECK(email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');`;

    const expected = `ALTER TABLE users
  ADD CONSTRAINT chk_email_format
      CHECK(email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');`;

    expect(formatSQL(sql).trimEnd()).toBe(expected);
  });
});

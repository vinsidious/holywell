import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('transaction control statements', () => {
  it('formats BEGIN/COMMIT/ROLLBACK without splitting', () => {
    const out = formatSQL('BEGIN; COMMIT; ROLLBACK;');
    const parts = out.trim().split('\n\n');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('BEGIN;');
    expect(parts[1]).toBe('COMMIT;');
    expect(parts[2]).toBe('ROLLBACK;');
  });

  it('keeps savepoint flows intact', () => {
    const sql = 'BEGIN; SAVEPOINT sp1; ROLLBACK TO SAVEPOINT sp1; RELEASE SAVEPOINT sp1; COMMIT;';
    const out = formatSQL(sql);
    expect(out).toContain('SAVEPOINT sp1;');
    expect(out).toContain('ROLLBACK TO SAVEPOINT sp1;');
    expect(out).toContain('RELEASE SAVEPOINT sp1;');
  });

  it('uppercases lowercase begin and commit statements', () => {
    const out = formatSQL('begin; insert into t values (1); commit;');

    expect(out).toContain('BEGIN;');
    expect(out).toContain('COMMIT;');
    expect(out).not.toContain('begin;');
    expect(out).not.toContain('commit;');
  });
});

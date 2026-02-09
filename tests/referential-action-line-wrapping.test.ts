import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Referential action and timestamp clause wrapping', () => {
  it('keeps ON DELETE CASCADE and ON UPDATE CURRENT_TIMESTAMP together when wrapped', () => {
    const sql = `CREATE TABLE t (
  user_id UUID NOT NULL REFERENCES public.users_with_long_name(id) ON DELETE CASCADE,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
    const out = formatSQL(sql, { maxLineLength: 72 });
    expect(out).toContain('ON DELETE CASCADE');
    expect(out).toContain('ON UPDATE CURRENT_TIMESTAMP');
    expect(out).not.toContain('ON DELETE\n');
    expect(out).not.toContain('ON UPDATE\n');
  });
});

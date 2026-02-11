import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Function call argument comments', () => {
  it('formats COALESCE arguments when a comment appears before the first argument', () => {
    const sql = `UPDATE t
SET x = COALESCE(
  -- comment here
  (SELECT 1),
  false
  )
WHERE y = true;`;

    const recoveries: string[] = [];
    const out = formatSQL(sql, {
      onRecover: err => recoveries.push(err.message),
    });

    expect(recoveries).toHaveLength(0);
    expect(out).toContain('SET x = COALESCE(');
    expect(out).toContain('-- comment here');
    expect(out).toContain('(SELECT 1),');
  });
});

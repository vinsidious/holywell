import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('PostgreSQL ONLY table source handling', () => {
  it('keeps ONLY attached to the table source instead of treating it as an alias target', () => {
    const sql = 'SELECT AVG(gpa) AS avg_3_4 FROM ONLY student;';
    const out = formatSQL(sql);

    expect(out).toContain('FROM ONLY student;');
    expect(out).not.toContain('FROM only AS student;');
  });

  it('remains stable across repeated formatting', () => {
    const sql = 'SELECT AVG(gpa) AS avg_3_4 FROM ONLY student;';
    const once = formatSQL(sql);
    const twice = formatSQL(once);

    expect(twice).toBe(once);
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL quoted identifier case preservation', () => {
  it('keeps case for backtick-quoted identifiers in WHERE predicates', () => {
    const sql = 'DELETE FROM `weenie` WHERE `class_Id` = 14096;';
    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain('`class_Id`');
    expect(out).not.toContain('`class_id`');
  });
});

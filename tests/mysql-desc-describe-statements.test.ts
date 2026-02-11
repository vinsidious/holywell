import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('MySQL describe statements', () => {
  it('parses DESC and keeps it as a recognized top-level statement', () => {
    const sql = 'DESC stu_glass; SHOW CREATE VIEW stu_glass;';

    expect(() => parse(sql, { dialect: 'mysql', recover: false })).not.toThrow();

    const out = formatSQL(sql, { dialect: 'mysql', recover: false });
    expect(out).toContain('DESC stu_glass;');
    expect(out).toContain('SHOW CREATE VIEW stu_glass;');
  });
});

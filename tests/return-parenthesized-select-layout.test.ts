import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('RETURN Parenthesized SELECT Layout', () => {
  it('indents SELECT inside RETURN parentheses in BEGIN...END blocks', () => {
    const sql = `BEGIN
RETURN (
SELECT COUNT(V_ID) * 100.0 / COUNT(CIT_ID) FROM CITIZEN)
END`;

    const out = formatSQL(sql);
    expect(out.trim()).toBe(`BEGIN
RETURN (
    SELECT COUNT(v_id) * 100.0 / COUNT(cit_id)
      FROM citizen
)
END`);
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('Oracle START WITH and CONNECT BY clauses', () => {
  it('parses and formats hierarchical query clauses as part of SELECT', () => {
    const sql = `SELECT co, COUNT(*) AS od_ilu
FROM zalezy
START WITH co IS NOT NULL
CONNECT BY PRIOR co = od
GROUP BY co;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('START WITH co IS NOT NULL');
    expect(out).toContain('CONNECT BY PRIOR co = od');
    expect(out).not.toMatch(/FROM zalezy\s*\n\s*\n\s*START WITH/);
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('CASE expression alias layout', () => {
  it('parses case aliases after transaction begin statements in strict mode', () => {
    const sql = `BEGIN;
SELECT
       case when g.id is null then 'inactive' else '' end as inactive,
       g.id
  FROM g;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('keeps end and alias together without blank separator lines', () => {
    const sql = `BEGIN;
SELECT
       case when g.id is null then 'inactive' else '' end as inactive,
       g.id
  FROM g;`;
    const out = formatSQL(sql);

    expect(out).toContain('END AS inactive');
    expect(out).not.toMatch(/END\s*\n\s*\n\s*AS inactive/i);
  });
});

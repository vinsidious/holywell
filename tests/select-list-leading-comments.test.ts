import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('SELECT List Leading Comments', () => {
  it('keeps heading comments on their own lines ahead of select items', () => {
    const sql = `select
    ----------  ids
    id as customer_id,
    ---------- text
    name as customer_name
from source`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toMatch(/SELECT\s*\n\s*-{10}\s+ids/);
    expect(out).toContain('\n       ---------- text\n');
    expect(out).toContain('\n       id AS customer_id,');
    expect(out).not.toMatch(/SELECT[^\n]*-{10}/);
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL window null treatment', () => {
  it('parses RESPECT NULLS and IGNORE NULLS modifiers on window functions', () => {
    const sql = `SELECT name,
       orbit,
       lag(orbit) OVER w AS lag,
       lag(orbit) RESPECT NULLS OVER w AS lag_respect,
       lag(orbit) IGNORE NULLS OVER w AS lag_ignore
  FROM planets
WINDOW w AS (ORDER BY name);`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('LAG(orbit) RESPECT NULLS OVER w');
    expect(out).toContain('LAG(orbit) IGNORE NULLS OVER w');
  });
});

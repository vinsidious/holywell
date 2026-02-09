import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('SQL comment preservation in predicates and VALUES tuples', () => {
  it('keeps inline line comments attached to boolean conditions', () => {
    const sql = `SELECT * FROM t WHERE a = 1 AND b = 2 -- important note
AND c = 3;`;
    const out = formatSQL(sql);
    expect(out).toContain('-- important note');
    expect(out).toContain('AND c = 3');
  });

  it('keeps inline block comments between VALUES arguments', () => {
    const sql = 'INSERT INTO t (a, b) VALUES (1 /* first */, 2 /* second */);';
    const out = formatSQL(sql);
    expect(out).toContain('/* first */');
    expect(out).toContain('/* second */');
  });
});

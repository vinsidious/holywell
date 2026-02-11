import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

function formatWithoutRecoveries(sql: string): string {
  const recoveries: string[] = [];
  const out = formatSQL(sql, {
    onRecover: err => recoveries.push(err.message),
  });
  expect(recoveries).toEqual([]);
  return out;
}

function maxLineLength(sql: string): number {
  return Math.max(...sql.split('\n').map(line => line.length));
}

describe('line wrapping and statement boundary behaviors', () => {
  it('wraps long generated column definitions in CREATE TABLE', () => {
    const sql = "CREATE TABLE docs (\n  id int,\n  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, COALESCE(title, ''::text) || ' ' || COALESCE(body, ''::text) || ' ' || COALESCE(tags, ''::text))) STORED\n);";
    const out = formatWithoutRecoveries(sql);
    expect(maxLineLength(out)).toBeLessThanOrEqual(100);
    expect(out.toUpperCase()).toContain('GENERATED ALWAYS AS');
  });

  it('wraps subqueries in FROM clauses when they are long', () => {
    const sql = "SELECT x.a FROM (SELECT id, name, created_at, status, owner_id, category_id FROM big_table WHERE status = 'active' AND created_at >= CURRENT_DATE - INTERVAL '30 days') x;";
    const out = formatWithoutRecoveries(sql);
    expect(maxLineLength(out)).toBeLessThanOrEqual(100);
    expect(out).toContain('\n  FROM (SELECT');
  });

  it('wraps GRANT ON FUNCTION parameter lists with many arguments', () => {
    const sql = 'GRANT EXECUTE ON FUNCTION f(a int, b text, c bigint, d boolean, e timestamptz, f numeric, g jsonb, h uuid, i bytea, j varchar, k interval, l date) TO app_role;';
    const out = formatWithoutRecoveries(sql);
    expect(maxLineLength(out)).toBeLessThanOrEqual(100);
    expect(out.toUpperCase()).toContain('GRANT EXECUTE');
    expect(out.toUpperCase()).toContain('ON FUNCTION');
  });

  it('wraps long CASE concatenation expressions', () => {
    const sql = "SELECT 'prefix ' + CASE WHEN a = 1 THEN 'one' WHEN a = 2 THEN 'two' ELSE 'other' END + CASE WHEN b = 1 THEN 'yes' WHEN b = 2 THEN 'no' ELSE 'maybe' END + CASE WHEN c = 1 THEN 'alpha' WHEN c = 2 THEN 'beta' ELSE 'gamma' END FROM t;";
    const out = formatWithoutRecoveries(sql);
    expect(maxLineLength(out)).toBeLessThanOrEqual(100);
    expect(out).toContain('\n');
    expect(out).toContain('+ CASE');
  });

  it('separates CREATE TABLE and following SELECT when semicolons are omitted', () => {
    const sql = "CREATE TABLE x (\n\t\tid int,\n\t\tname text\n\t)\n\tSELECT * FROM x";
    const out = formatWithoutRecoveries(sql);
    expect(out).toContain('CREATE TABLE x');
    expect(out).toContain(');\n\nSELECT *');
  });
});

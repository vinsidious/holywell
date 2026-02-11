import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('dialect parsing and formatting behaviors', () => {
  it('keeps schema-qualified type names and casts contiguous', () => {
    const sql = `CREATE TABLE public.category_update_queue (
  guild_id BIGINT NOT NULL,
  new_status public.ticket_status NOT NULL,
  previous_status public.ticket_status DEFAULT 'OPEN'::public.ticket_status
);`;

    const out = formatSQL(sql);

    expect(out).toContain('public.ticket_status');
    expect(out).toContain('::public.ticket_status');
    expect(out).not.toContain('public .ticket_status');
    expect(out).not.toContain(': :public.ticket_status');
  });

  it('keeps MySQL GRANT user@host together', () => {
    const sql = "GRANT all ON goip.* TO goip@localhost IDENTIFIED BY 'goip';";
    const out = formatSQL(sql);

    expect(out).toContain('TO goip@localhost');
    expect(out).not.toContain('goip @localhost');
  });

  it('preserves Oracle slash terminator when used alone', () => {
    const sql = 'SELECT 1 FROM dual\n/';
    const out = formatSQL(sql);

    expect(out.trimEnd().endsWith('/')).toBe(true);
    expect(out).not.toContain('FROM dual;');
  });

  it('parses SAFE_CAST and TRY_CAST expressions in strict mode', () => {
    expect(() => parse('SELECT SAFE_CAST(x AS INT64) FROM t;', { recover: false })).not.toThrow();
    expect(() => parse('SELECT TRY_CAST(x AS INT) FROM t;', { recover: false })).not.toThrow();

    // SAFE_CAST is not in any built-in dialect's function keywords; test with ANSI/default
    // TRY_CAST is a T-SQL function keyword
    expect(formatSQL('SELECT TRY_CAST(x AS INT) FROM t;', { dialect: 'tsql' })).toContain('TRY_CAST(x AS INT)');
    // SAFE_CAST is BigQuery-specific, not in current dialects — parse should still work
    expect(formatSQL('SELECT SAFE_CAST(x AS INT64) FROM t;')).toBeTruthy();
  });

  it('indents subquery clauses inside CASE THEN blocks', () => {
    const sql = 'SELECT CASE WHEN 1 THEN (SELECT name FROM sys.objects WHERE object_id = dp.major_id) END;';
    const out = formatSQL(sql);

    expect(out).toMatch(/WHEN 1 THEN \(SELECT name\n\s{8,}FROM sys\.objects\n\s{8,}WHERE object_id = dp\.major_id\)/);
  });

  it('indents parenthesized EXISTS branches at subquery nesting depth', () => {
    const sql = 'SELECT * FROM t WHERE EXISTS (SELECT * FROM a WHERE a.id = t.id) AND (EXISTS (SELECT * FROM b WHERE b.id = t.id) OR EXISTS (SELECT * FROM c WHERE c.id = t.id));';
    const out = formatSQL(sql);

    expect(out).toMatch(/\(EXISTS \(SELECT \*\n\s{8,}FROM b\n\s{8,}WHERE b\.id = t\.id\)/);
    expect(out).toMatch(/OR EXISTS \(SELECT \*\n\s{8,}FROM c\n\s{8,}WHERE c\.id = t\.id\)/);
  });

  it('formats ;WITH CTE blocks after comments as a single statement', () => {
    const sql = '-- lists database permissions\n;WITH cte AS (SELECT 1) SELECT * FROM cte;';
    const out = formatSQL(sql);

    expect(out).not.toMatch(/^;\s*$/m);
    expect(out).toContain('WITH cte AS');
    expect(out).toContain('SELECT *');
  });

  it('keeps hash comments as standalone lines after semicolonless statements', () => {
    const sql = 'SELECT a FROM t\nORDER BY a DESC, b ASC\n\n# This is a comment\nSELECT c FROM t2';
    const out = formatSQL(sql);

    expect(out).toMatch(/\n\s*# This is a comment\n\s*SELECT c/);
    expect(out).not.toMatch(/b ASC\s+# This is a comment/);
  });

  it('keeps trailing inline comments on comma-separated definitions', () => {
    const sql = `CREATE TABLE test (
  id INTEGER NOT NULL,  -- primary ID
  name TEXT NOT NULL,    -- user name
  email TEXT DEFAULT NULL -- email address
);`;
    const out = formatSQL(sql);

    expect(out).toMatch(/id\s+INTEGER\s+NOT NULL,\s+-- primary ID/);
    expect(out).toMatch(/name\s+TEXT\s+NOT NULL,\s+-- user name/);
    expect(out).toContain('email');
    expect(out).toContain('-- email address');
  });

  it('formats COPY INTO with normalized clause keywords', () => {
    const out = formatSQL('copy into mytable from @stage/file.csv;');

    expect(out).toContain('COPY INTO mytable');
    expect(out).toContain('FROM @stage/file.csv;');
  });

  it('keeps STDDEV and CORR function names uppercased', () => {
    const out = formatSQL('SELECT STDDEV(x), CORR(x, y), SUM(z) FROM t;');

    expect(out).toContain('STDDEV(x)');
    expect(out).toContain('CORR(x, y)');
  });

  it('preserves user-defined function and alias casing', () => {
    const sql = 'SELECT dbo.CalculateAge(s.birth_date) AS EnrollmentStats FROM (SELECT birth_date FROM Student) AS EnrollmentStats;';
    const out = formatSQL(sql);

    expect(out).toContain('dbo.CalculateAge');
    expect(out).toContain('AS EnrollmentStats');
    expect(out).not.toContain('dbo.calculateage');
    expect(out).not.toContain('AS enrollmentstats');
  });

  it('keeps comparison operators attached to numeric operands in CHECK constraints', () => {
    const sql = 'CREATE TABLE discounts (discount_percent DECIMAL CHECK(discount_percent >= 0 AND discount_percent <= 100));';
    const out = formatSQL(sql);

    expect(out).toContain('>= 0');
    expect(out).toContain('<= 100');
  });

  it('formats Snowflake CREATE STAGE and CREATE FILE FORMAT statements', () => {
    const stageOut = formatSQL("create or replace stage mystage url='s3://bucket/path';");
    const fileFormatOut = formatSQL("create or replace file format myfmt type = csv field_delimiter = ','; ");

    expect(stageOut).toContain('CREATE OR REPLACE STAGE mystage');
    expect(stageOut).toContain("URL='s3://bucket/path'");
    expect(fileFormatOut).toContain('CREATE OR REPLACE FILE FORMAT myfmt');
    expect(fileFormatOut).toContain('TYPE = csv');
    expect(fileFormatOut).toContain("field_delimiter = ','");
  });

  it('parses and formats MySQL && boolean operator', () => {
    const sql = 'SELECT 1 FROM t WHERE a = 1 && b = 2;';

    expect(() => parse(sql, { recover: false, dialect: 'mysql' })).not.toThrow();
    expect(formatSQL(sql, { dialect: 'mysql' })).toContain('&&');
  });
});

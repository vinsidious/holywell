import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Dialect keyword and identifier casing', () => {
  it('uppercases AUTO_INCREMENT in MySQL column definitions', () => {
    const out = formatSQL('CREATE TABLE t (id INT NOT NULL auto_increment PRIMARY KEY);');
    expect(out).toContain('AUTO_INCREMENT');
    expect(out).not.toContain('auto_increment');
  });

  it('uppercases data types in ALTER TABLE MODIFY and CHANGE actions', () => {
    const outModify = formatSQL('ALTER TABLE t MODIFY col int NOT NULL;');
    const outChange = formatSQL('ALTER TABLE t CHANGE col new_col varchar(20) NOT NULL;');

    expect(outModify).toContain('MODIFY col INT NOT NULL');
    expect(outChange).toContain('CHANGE col new_col VARCHAR(20) NOT NULL');
  });

  it('uppercases IF and IFNULL function names', () => {
    const out = formatSQL('SELECT if(a > 0, 1, 0), ifnull(a, 0), coalesce(x, y), nullif(a, b) FROM t;');

    expect(out).toContain('IF(a > 0, 1, 0)');
    expect(out).toContain('IFNULL(a, 0)');
    expect(out).toContain('COALESCE(x, y)');
    expect(out).toContain('NULLIF(a, b)');
  });

  it('keeps routine parameter and identifier names when they match function-like words', () => {
    const out = formatSQL('CREATE PROCEDURE p (IN age INT) BEGIN SELECT age; END');

    expect(out).toContain('IN age INT');
    expect(out).toContain('SELECT age');
    expect(out).not.toContain('IN AGE INT');
  });

  it('uppercases trigger timing and row-iteration keywords', () => {
    const out = formatSQL('create trigger t1 before insert on tbl for each row begin end;');

    expect(out).toContain('BEFORE INSERT ON');
    expect(out).toContain('FOR EACH ROW');
  });

  it('uppercases OFF in SET statements', () => {
    const out = formatSQL('SET row_security = off;');

    expect(out).toContain('SET row_security = OFF;');
  });

  it('uppercases ALTER DEFAULT PRIVILEGES clauses', () => {
    const out = formatSQL('alter default privileges in schema public grant all on tables to other;');

    expect(out).toContain('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO other;');
  });

  it('uppercases SET after ALTER SESSION', () => {
    const out = formatSQL("ALTER SESSION set query_tag = 'tpch_q2';");

    expect(out).toContain("ALTER SESSION SET query_tag = 'tpch_q2';");
  });

  it('uppercases CREATE USER and CREATE ROLE option keywords', () => {
    const outUser = formatSQL("create user mark with encrypted password 'mark';");
    const outRole = formatSQL("create role app with login encrypted password 'secret';");

    expect(outUser).toContain("CREATE USER mark WITH ENCRYPTED PASSWORD 'mark';");
    expect(outRole).toContain("CREATE ROLE app WITH LOGIN ENCRYPTED PASSWORD 'secret';");
  });

  it('uppercases COMMENT ON TABLE and COMMENT ON COLUMN keywords', () => {
    const sql = `comment on table public.user is 'Stores user information.';
comment on column public.user.email is 'Email address of the user.';`;
    const out = formatSQL(sql);

    expect(out).toContain("COMMENT ON TABLE public.user IS 'Stores user information.';");
    expect(out).toContain("COMMENT ON COLUMN public.user.email IS 'Email address of the user.';");
  });

  it('uppercases NVARCHAR data types', () => {
    const out = formatSQL('CREATE TABLE dstruong (tentruong nvarchar(50), diachi nvarchar(50));');

    expect(out).toContain('tentruong NVARCHAR(50)');
    expect(out).toContain('diachi    NVARCHAR(50)');
  });

  it('uppercases SQL Server CONVERT DATEADD DATETIME and NOLOCK tokens', () => {
    const sql = `SELECT CONVERT(DATETIME, es.start_time) AS start_time,
       CONVERT(VARCHAR, DATEADD(ms, es.execution_duration, 0), 108) AS duration_hms
  FROM catalog.executions ex (NOLOCK);`;
    const out = formatSQL(sql);

    expect(out).toContain('CONVERT(DATETIME, es.start_time)');
    expect(out).toContain('CONVERT(VARCHAR, DATEADD(ms, es.execution_duration, 0), 108)');
    expect(out).toContain('FROM catalog.executions AS ex(NOLOCK)');
  });

  it('keeps CREATE FUNCTION names and parameter names as identifiers when they match keyword text', () => {
    const sql = `CREATE OR REPLACE FUNCTION jwt.url_encode(data bytea)
RETURNS text
LANGUAGE sql
AS $$ SELECT 1; $$;

CREATE OR REPLACE FUNCTION jwt.sign(payload json, secret text, algorithm text DEFAULT 'HS256')
RETURNS text
LANGUAGE sql
AS $$ SELECT 1; $$;`;
    const out = formatSQL(sql);

    expect(out).toContain('FUNCTION jwt.url_encode(data BYTEA)');
    expect(out).toContain('FUNCTION jwt.sign(payload JSON, secret TEXT, algorithm TEXT DEFAULT');
    expect(out).not.toContain('FUNCTION jwt.url_encode(DATA BYTEA)');
    expect(out).not.toContain('FUNCTION jwt.SIGN');
  });

  it('keeps CREATE ROLE WITH clauses contiguous without blank lines', () => {
    const out = formatSQL("CREATE ROLE ci_user\n  WITH LOGIN\n       PASSWORD 'Password2!';");

    expect(out).toContain("CREATE ROLE ci_user\n  WITH LOGIN\n       PASSWORD 'Password2!';");
    expect(out).not.toContain('ci_user\n\nWITH LOGIN');
  });

  it('preserves mixed-case unquoted identifiers', () => {
    const out = formatSQL('SELECT Col1 FROM MyTable WHERE UserId = 1;');

    expect(out).toContain('SELECT Col1');
    expect(out).toContain('FROM MyTable');
    expect(out).toContain('WHERE UserId = 1;');
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('CREATE TABLE options and engine clauses', () => {
  it('parses PostgreSQL WITH storage parameters on CREATE TABLE in strict mode', () => {
    const sql = `CREATE TABLE t (
  id integer NOT NULL
)
WITH (
  OIDS=FALSE
);`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql, { recover: false });
    expect(out).toContain(') WITH (');
    expect(out).not.toContain(');\n\nWITH (');
  });

  it('formats ClickHouse post-table clauses across multiple lines', () => {
    const sql = `CREATE TABLE t (id INT)
ENGINE = MergeTree
PARTITION BY toDate(ts)
ORDER BY (id, ts)
SETTINGS index_granularity = 8192;`;

    const out = formatSQL(sql);
    expect(out).toContain('\n) ENGINE = MergeTree\n');
    expect(out).toContain('\n  PARTITION BY toDate(ts)\n');
    expect(out).toContain('\n  ORDER BY (id, ts)\n');
    expect(out).toContain('\n  SETTINGS index_granularity = 8192;');
  });
});


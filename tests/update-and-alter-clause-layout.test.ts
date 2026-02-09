import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('UPDATE and ALTER clause layout', () => {
  it('formats CASE expressions in UPDATE SET across multiple lines', () => {
    const sql = `UPDATE t SET col = CASE WHEN x = 1 THEN 'a' WHEN x = 2 THEN 'b' ELSE 'c' END;`;
    const out = formatSQL(sql);

    expect(out).toContain('SET col = CASE');
    expect(out).toContain('\n             WHEN x = 1 THEN \'a\'');
    expect(out).toContain('\n             WHEN x = 2 THEN \'b\'');
    expect(out).toContain('\n             ELSE \'c\'');
    expect(out).toContain('\n             END;');
  });

  it('formats ALTER TABLE ADD CONSTRAINT foreign key actions on separate lines', () => {
    const sql = `ALTER TABLE t1
    ADD CONSTRAINT fk_name
    FOREIGN KEY (col1)
    REFERENCES t2(id)
    ON DELETE CASCADE;`;

    const out = formatSQL(sql);
    expect(out).toContain('ADD CONSTRAINT fk_name');
    expect(out).toContain('\n        FOREIGN KEY (col1)');
    expect(out).toContain('\n        REFERENCES t2 (id)');
    expect(out).toContain('\n        ON DELETE CASCADE;');
  });

  it('keeps CHARACTER SET as a compound clause in ALTER DATABASE', () => {
    const out = formatSQL('ALTER DATABASE mydb CHARACTER SET utf8mb4;');
    expect(out).toContain('CHARACTER SET utf8mb4');
    expect(out).not.toContain('CHARACTER\n');
  });

  it('parses MySQL UPDATE JOIN SET statements in strict mode', () => {
    const sql = 'UPDATE t1 JOIN t2 ON t1.id = t2.id SET t1.name = t2.name WHERE t1.name IS NULL;';
    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('UPDATE t1');
    expect(out).toContain('JOIN t2');
    expect(out).toContain('SET t1.name = t2.name');
    expect(out).toContain('WHERE t1.name IS NULL;');
  });

  it('keeps spacing before parenthesis in ALTER TABLE PRIMARY KEY actions', () => {
    const out = formatSQL('ALTER TABLE t ADD PRIMARY KEY (id);');
    expect(out).toContain('ADD PRIMARY KEY (id);');
    expect(out).not.toContain('PRIMARY KEY(id)');
  });
});

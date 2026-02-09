import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('MySQL ALTER TABLE key and charset actions', () => {
  it('keeps ADD KEY actions without inserting COLUMN', () => {
    const out = formatSQL('ALTER TABLE t ADD KEY idx (col);');
    expect(out).toContain('ADD KEY idx (col)');
    expect(out).not.toContain('ADD COLUMN KEY');
  });

  it('keeps ADD INDEX actions without inserting COLUMN', () => {
    const out = formatSQL('ALTER TABLE t ADD INDEX idx (col);');
    expect(out).toContain('ADD INDEX idx (col)');
    expect(out).not.toContain('ADD COLUMN INDEX');
  });

  it('keeps ADD FULLTEXT KEY actions without inserting COLUMN', () => {
    const out = formatSQL('ALTER TABLE t ADD FULLTEXT KEY idx (col);');
    expect(out).toContain('ADD FULLTEXT KEY idx (col)');
    expect(out).not.toContain('ADD COLUMN FULLTEXT KEY');
  });

  it('keeps MATCH SIMPLE with foreign-key actions in one table constraint', () => {
    const sql = 'CREATE TABLE t1 (col INT, CONSTRAINT fk FOREIGN KEY (col) REFERENCES t2 (col) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION);';
    const out = formatSQL(sql);
    expect(out).toContain('REFERENCES t2 (col) MATCH SIMPLE');
    expect(out).toContain('ON UPDATE NO ACTION');
    expect(out).toContain('ON DELETE NO ACTION');
    expect(out).not.toContain('REFERENCES t2 (col),');
  });

  it('keeps CHARACTER SET as a compound clause in MODIFY actions', () => {
    const sql = 'ALTER TABLE t1 MODIFY col1 VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;';
    const out = formatSQL(sql);
    expect(out).toContain('MODIFY col1 VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    expect(out).not.toContain('CHARACTER\n');
  });

  it('formats CHANGE COLUMN actions as ALTER actions', () => {
    const sql = 'ALTER TABLE t1 CHANGE COLUMN a a INT NOT NULL, CHANGE COLUMN b b VARCHAR(100);';
    const out = formatSQL(sql);
    expect(out).toContain('ALTER TABLE t1\n');
    expect(out).toContain('CHANGE COLUMN a a INT NOT NULL,');
    expect(out).toContain('CHANGE COLUMN b b VARCHAR(100);');
  });

  it('formats MODIFY actions as ALTER actions', () => {
    const sql = 'ALTER TABLE t1 MODIFY col1 INT NOT NULL;';
    const out = formatSQL(sql);
    expect(out).toContain('ALTER TABLE t1\n');
    expect(out).toContain('MODIFY col1 INT NOT NULL;');
  });

  it('parses key and charset ALTER statements in strict mode', () => {
    expect(() => parse('ALTER TABLE t ADD KEY idx (col);', { recover: false })).not.toThrow();
    expect(() => parse('ALTER TABLE t1 MODIFY col1 VARCHAR(100) CHARACTER SET utf8mb4;', { recover: false })).not.toThrow();
  });
});

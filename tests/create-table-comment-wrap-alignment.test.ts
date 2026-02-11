import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('CREATE TABLE wrapped comment alignment', () => {
  it('keeps type-column alignment when COMMENT wrapping occurs', () => {
    const sql = `CREATE TABLE t (
  id bigint(20) NOT NULL COMMENT 'short',
  create_at datetime NOT NULL DEFAULT '1971-01-01 00:00:00' COMMENT 'long default value here',
  is_delete tinyint(4) NOT NULL DEFAULT '0' COMMENT 'another'
) ENGINE=InnoDB;`;

    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain('id        BIGINT(20) NOT NULL COMMENT \'short\'');
    expect(out).toContain('create_at DATETIME   NOT NULL DEFAULT');
    expect(out).toContain('is_delete TINYINT(4) NOT NULL DEFAULT \'0\' COMMENT \'another\'');
  });
});


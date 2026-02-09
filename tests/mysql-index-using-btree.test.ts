import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL index USING BTREE clauses', () => {
  it('keeps USING BTREE attached to UNIQUE INDEX table elements', () => {
    const sql = `CREATE TABLE \`employee\` (
    \`eId\` INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (\`eId\`),
    UNIQUE INDEX \`eCard\` (\`eCard\`) USING BTREE
) ENGINE = InnoDB;`;

    const out = formatSQL(sql);
    expect(out).toContain('UNIQUE INDEX `eCard` (`eCard`) USING BTREE');
    expect(out).not.toMatch(/\n\s*USING\s+BTREE\s*(,|\n|\))/);
  });
});

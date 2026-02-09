import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('T-SQL SUBSTRING comma argument style', () => {
  it('preserves comma-based SUBSTRING arguments', () => {
    const sql = 'SELECT SUBSTRING([message], 1, 10) AS msg_part FROM log_table;';
    const out = formatSQL(sql);
    expect(out).toContain('SUBSTRING([message], 1, 10)');
    expect(out).not.toContain('SUBSTRING([message] FROM 1 FOR 10)');
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('DB2 slash delimiter statement termination', () => {
  it('keeps statements slash-terminated as semicolon-terminated output statements', () => {
    const sql = `REORG TABLE test.table1
/
SELECT 1
/`;
    const out = formatSQL(sql);
    expect(out).toContain('REORG TABLE test.table1;');
    expect(out).toContain('SELECT 1;');
  });
});

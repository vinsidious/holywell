import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Identifier, alias, and variable case stability', () => {
  it('keeps session variable case stable across statements', () => {
    const sql = `SET @customerName = 'test';
SELECT * FROM t WHERE name = @customerName;`;
    const out = formatSQL(sql, { dialect: 'tsql' });
    expect(out).toContain('@customerName');
    expect(out).not.toContain('@customername');
  });

  it('keeps explicit projection alias case', () => {
    const sql = 'SELECT id, MD5(password) AS MD5 FROM account;';
    const out = formatSQL(sql);
    expect(out).toContain('AS MD5');
  });

  it('formats UPDATE targets and references consistently', () => {
    const sql = 'UPDATE DST SET DST.InvoiceID = upd.InvoiceID FROM UPD upd WHERE DST.InvoiceID = upd.InvoiceID;';
    const out = formatSQL(sql);
    expect(out).toContain('UPDATE dst');
    expect(out).toContain('SET dst.InvoiceID = upd.InvoiceID');
    expect(out).toContain('WHERE dst.InvoiceID = upd.InvoiceID');
  });
});

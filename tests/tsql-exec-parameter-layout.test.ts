import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('T-SQL EXEC parameter layout', () => {
  it('parses multiline exec parameter assignments as one statement', () => {
    const sql = `EXEC dbo.InsertContactNotes
@ContactId = 23,
@Notes = @TempNotes;`;

    const ast = parse(sql, { recover: false, dialect: 'tsql' });
    expect(ast).toHaveLength(1);
  });

  it('formats exec parameter assignments without blank lines between parameters', () => {
    const sql = `EXEC dbo.InsertContactNotes
@ContactId = 23,
@Notes = @TempNotes;`;

    const out = formatSQL(sql, { dialect: 'tsql' });
    expect(out).toContain('EXEC dbo.InsertContactNotes\n@ContactId = 23,\n@Notes = @TempNotes;');
    expect(out).not.toMatch(/InsertContactNotes\n\s*\n\s*@ContactId/);
    expect(out).not.toMatch(/@ContactId = 23,\n\s*\n\s*@Notes/);
  });
});

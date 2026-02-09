import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('T-SQL GO batch separators', () => {
  it('keeps GO as a standalone separator after ADD DEFAULT ... FOR clauses', () => {
    const sql = `ALTER TABLE [dbo].[tbl] ADD CONSTRAINT [DF_col] DEFAULT (0) FOR [enterID]
GO
ALTER TABLE [dbo].[tbl] ADD CONSTRAINT [DF_col2] DEFAULT (0) FOR [reviewID]
GO`;

    const out = formatSQL(sql);
    expect(out).toMatch(/\bFOR \[enterID\];?\s*\n\s*GO\s*\n\s*ALTER TABLE \[dbo\]\.\[tbl\]/);
    expect(out).not.toContain('FOR [enterID] GO ALTER TABLE');
  });

  it('keeps GO as a standalone separator after SET READ_WRITE', () => {
    const sql = `ALTER DATABASE [RSM] SET READ_WRITE
GO`;

    const out = formatSQL(sql);
    expect(out).toMatch(/\bSET READ_WRITE;?\s*\n\s*GO\b/);
    expect(out).not.toContain('SET READ_WRITE GO');
  });
});

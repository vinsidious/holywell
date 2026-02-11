import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('T-SQL PRIMARY KEY CLUSTERED option clauses', () => {
  it('keeps WITH index options attached to PRIMARY KEY CLUSTERED constraints', () => {
    const sql = `CREATE TABLE [dbo].[example](
    [id] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_example] PRIMARY KEY CLUSTERED
(
    [id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO`;

    const out = formatSQL(sql, { dialect: 'tsql' });
    expect(out).toContain('PRIMARY KEY CLUSTERED ([id] ASC)');
    expect(out).toContain('WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF) ON [PRIMARY]');
    expect(out).not.toMatch(/\n\s*WITH\s+\(/);
  });
});

import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('T-SQL procedure parameter layout', () => {
  it('keeps parameter declarations on separate lines for ALTER PROCEDURE', () => {
    const sql = `ALTER PROCEDURE spWidget
    @TotalEmployees INT,
    @TotalDays INT,
    @LateOrEarly INT,
    @Efficiency DECIMAL(5,2) = 98.5
AS
BEGIN
    SELECT @TotalEmployees AS Total;
END
GO`;

    const out = formatSQL(sql);
    expect(out).toContain('\n    @TotalEmployees INT,');
    expect(out).toContain('\n    @TotalDays INT,');
    expect(out).toContain('\n    @LateOrEarly INT,');
    expect(out).toContain('\n    @Efficiency DECIMAL(5,2) = 98.5');
    expect(out).not.toContain('ALTER PROCEDURE spWidget @TotalEmployees INT');
  });
});

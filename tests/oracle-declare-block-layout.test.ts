import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Oracle DECLARE block layout', () => {
  it('keeps consecutive declarations contiguous and indented', () => {
    const sql = `DECLARE
    v_max_id       departments.department_id%TYPE;
    v_dept_name    departments.department_name%TYPE := 'EDUCATION';
    v_new_id       departments.department_id%TYPE;
BEGIN
    NULL;
END;
/`;

    const out = formatSQL(sql);
    expect(out).toMatch(/DECLARE\s*\n\s*v_max_id[\s\S]*\n\s*v_dept_name[\s\S]*\n\s*v_new_id[\s\S]*\nBEGIN/);
    expect(out).not.toMatch(/v_max_id[\s\S]*\n\s*\n\s*v_dept_name/);
  });
});

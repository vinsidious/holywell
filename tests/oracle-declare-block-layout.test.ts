import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

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

describe('Oracle anonymous cursor block formatting', () => {
  it('parses and formats cursor open fetch loop blocks in strict mode', () => {
    const sql = `DECLARE
    u_id Users.userId%type;
    u_first_name Users.user_data.first_name%type;
    u_last_name Users.user_data.last_name%type;
    u_date Users.user_data.birth_date%type;
    u_email Users.email%type;
    u_phone VARCHAR2(20);

    CURSOR user_type IS
    SELECT
        ur.userId AS ID,
        ur.user_data.first_name AS FirstName,
        ur.user_data.last_name AS LastName,
        ur.user_data.birth_date AS Date_of_Birth,
        ur.email AS Email,
        t1.COLUMN_VALUE AS PhoneNumber
    FROM Users ur
    LEFT OUTER JOIN TABLE(ur.userNumber) t1 ON 1=1;

BEGIN
    OPEN user_type;
    LOOP
        FETCH user_type INTO u_id, u_first_name, u_last_name, u_date, u_email, u_phone;
        EXIT WHEN user_type%notfound;
            DBMS_OUTPUT.PUT_LINE('User ID: ' || u_id);
            DBMS_OUTPUT.PUT_LINE('First Name:  ' || u_first_name);
            DBMS_OUTPUT.PUT_LINE('Last Name: ' || u_last_name);
            DBMS_OUTPUT.PUT_LINE('Date of Birth: ' || u_date);
            DBMS_OUTPUT.PUT_LINE('Email: ' || u_email);
            DBMS_OUTPUT.PUT_LINE('Phone Number: ' || u_phone);
            DBMS_OUTPUT.PUT_LINE('');
        END LOOP;
    CLOSE user_type;
END;
/`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('CURSOR user_type IS');
    expect(out).toContain('OPEN user_type;');
    expect(out).toContain('FETCH user_type INTO u_id, u_first_name, u_last_name, u_date, u_email, u_phone;');
    expect(out).toContain('EXIT WHEN user_type%notfound;');
    expect(out).toContain("DBMS_OUTPUT.PUT_LINE('User ID: ' || u_id);");
    expect(formatSQL(out)).toBe(out);
  });
});

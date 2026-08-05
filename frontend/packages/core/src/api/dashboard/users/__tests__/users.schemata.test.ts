import {describe, expect, it} from 'vitest';

import {UserSettingsResponseSchema} from '../users.schemata';

const COMMON_WIRE = {
  given_name: 'Ada',
  family_name: 'Lovelace',
  display_name: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  has_password: true,
  can_edit_email: true,
  can_edit_password: true,
  should_see_add_password_form: false,
  should_see_edit_email_link: true,
  authentication_options: [
    {credential_type: 'email', email: 'ada@example.com'},
  ],
  can_change_user_type: true,
  can_delete_own_account: true,
  age: '21+',
  us_state: null,
  gender: null,
  is_usa: true,
  parent_email: null,
  dependent_students_count: 0,
  age_options: [{value: '4', text: '4'}],
  us_state_options: [{value: 'WA', text: 'Washington'}],
};

const TEACHER_WIRE = {
  ...COMMON_WIRE,
  user_type: 'teacher',
  educator_role: 'classroom_teacher',
  educator_role_options: [
    {
      value: 'classroom_teacher',
      text: 'Classroom teacher',
      category: 'educator',
    },
    {
      value: 'district_admin',
      text: 'District administrator',
      category: 'admin',
    },
    {value: 'other', text: 'Other', category: 'other'},
  ],
  school_info: {
    school_name: 'Cavendish High',
    school_type: 'public',
    school_id: '12345678',
    school_zip: '98101',
    country: 'US',
  },
};

const STUDENT_WIRE = {...COMMON_WIRE, user_type: 'student'};

describe('UserSettingsResponseSchema educator profile keys', () => {
  it('camelCases a teacher payload with a school', () => {
    const settings = UserSettingsResponseSchema.parse(TEACHER_WIRE);

    expect(settings.educatorRole).toBe('classroom_teacher');
    expect(settings.educatorRoleOptions).toEqual([
      {
        value: 'classroom_teacher',
        text: 'Classroom teacher',
        category: 'educator',
      },
      {
        value: 'district_admin',
        text: 'District administrator',
        category: 'admin',
      },
      {value: 'other', text: 'Other', category: 'other'},
    ]);
    expect(settings.schoolInfo).toEqual({
      schoolName: 'Cavendish High',
      schoolType: 'public',
      schoolId: '12345678',
      schoolZip: '98101',
      country: 'US',
    });
  });

  it('accepts a teacher with no school and no role yet', () => {
    const settings = UserSettingsResponseSchema.parse({
      ...TEACHER_WIRE,
      educator_role: null,
      school_info: null,
    });

    expect(settings.educatorRole).toBeNull();
    expect(settings.schoolInfo).toBeNull();
  });

  it('accepts a teacher whose school fields are all blank', () => {
    const settings = UserSettingsResponseSchema.parse({
      ...TEACHER_WIRE,
      school_info: {
        school_name: null,
        school_type: null,
        school_id: null,
        school_zip: null,
        country: null,
      },
    });

    expect(settings.schoolInfo).toEqual({
      schoolName: null,
      schoolType: null,
      schoolId: null,
      schoolZip: null,
      country: null,
    });
  });

  it('accepts a student payload, which omits the teacher-only keys', () => {
    const settings = UserSettingsResponseSchema.parse(STUDENT_WIRE);

    expect(settings.userType).toBe('student');
    expect(settings.educatorRole).toBeUndefined();
    expect(settings.educatorRoleOptions).toBeUndefined();
    expect(settings.schoolInfo).toBeUndefined();
  });

  it('accepts an unknown educator role category (open set, must not fail the read)', () => {
    const settings = UserSettingsResponseSchema.parse({
      ...TEACHER_WIRE,
      educator_role_options: [{value: 'x', text: 'X', category: 'principal'}],
    });
    expect(settings.educatorRoleOptions?.[0].category).toBe('principal');
  });

  it('rejects an educator role option missing its category', () => {
    expect(() =>
      UserSettingsResponseSchema.parse({
        ...TEACHER_WIRE,
        educator_role_options: [{value: 'x', text: 'X'}],
      }),
    ).toThrow();
  });

  it('rejects a school_info missing a field', () => {
    expect(() =>
      UserSettingsResponseSchema.parse({
        ...TEACHER_WIRE,
        school_info: {school_name: 'Cavendish High'},
      }),
    ).toThrow();
  });

  it('rejects a non-string educator_role', () => {
    expect(() =>
      UserSettingsResponseSchema.parse({...TEACHER_WIRE, educator_role: 7}),
    ).toThrow();
  });
});

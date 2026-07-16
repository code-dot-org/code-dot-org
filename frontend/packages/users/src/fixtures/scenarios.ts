import type {z} from 'zod';

import type {
  CurrentUserResponseSignedIn,
  UserSettingsResponseSchema,
} from '@code-dot-org/core/api';

// Wire (snake_case) settings body, typed as the schema's input so fixture
// drift fails tsc here.
export type UserSettingsWire = z.input<typeof UserSettingsResponseSchema>;

// What a scenario seeds: the per-user fields, minus the static age/us_state
// option lists (the mock server injects those on read, like Rails does).
export type UsersSettingsSeed = Omit<
  UserSettingsWire,
  'age_options' | 'us_state_options'
>;

export const USERS_SCENARIO_TAGS = [
  'teacher',
  'student',
  'sso-teacher',
  'sso-student',
  'minimal',
  'student-no-parent',
  'one-dependent',
  'teacher-locked-type',
  'age-state-unset',
  'long-strings',
  'student-can-switch',
] as const;

export type UsersScenarioTag = (typeof USERS_SCENARIO_TAGS)[number];

export interface UsersScenario {
  currentUser: CurrentUserResponseSignedIn;
  settings: UsersSettingsSeed;
  /** Cleartext password the mock auth checks accept; absent for SSO-only. */
  password?: string;
  /** What this scenario is for; shown in the standalone scenario switcher. */
  description: string;
}

const baseCurrentUser: CurrentUserResponseSignedIn = {
  is_signed_in: true,
  id: 1,
  username: 'ada_lovelace',
  display_name: 'Ada Lovelace',
  short_name: 'Ada',
  user_type: 'teacher',
  is_verified_instructor: true,
  is_levelbuilder: false,
  educator_role: 'classroom_teacher',
  grades_teaching: ['9', '10'],
  under_13: false,
  over_21: true,
  age: '21+',
  country_code: 'US',
  us_state_code: 'WA',
  child_account_compliance_state: null,
  sharing_disabled: false,
  mute_music: false,
  sort_by_family_name: false,
  has_seen_homepage_welcome: true,
  has_dismissed_personalization_alert: false,
  ai_chat_access_level: 0,
  ai_rubrics_disabled: false,
  ai_differentiation_enabled: true,
  has_seen_ai_assessments_announcement: true,
  has_completed_ai_differentiation_welcome: true,
  is_lti: false,
  in_section: null,
  created_at: '2020-01-01T00:00:00Z',
};

const teacher: UsersScenario = {
  currentUser: {...baseCurrentUser},
  settings: {
    user_type: 'teacher',
    given_name: 'Ada',
    family_name: 'Lovelace',
    display_name: 'Ada Lovelace',
    username: 'ada_lovelace',
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
    us_state: 'WA',
    gender: null,
    is_usa: true,
    parent_email: null,
    dependent_students_count: 2,
  },
  password: 'currentpass',
  description: 'Educator with a password + email; can change type and delete.',
};

const student: UsersScenario = {
  currentUser: {
    ...baseCurrentUser,
    id: 2,
    user_type: 'student',
    username: 'curious_otter_42',
    display_name: 'Sam Rivers',
    short_name: 'Sam',
    is_verified_instructor: false,
    educator_role: null,
    grades_teaching: [],
    over_21: false,
    age: 14,
  },
  // Masked email: a word/picture-style student has no stored cleartext address.
  settings: {
    user_type: 'student',
    given_name: 'Sam',
    family_name: null,
    display_name: 'Sam Rivers',
    username: 'curious_otter_42',
    email: null,
    has_password: true,
    can_edit_email: true,
    can_edit_password: true,
    should_see_add_password_form: false,
    should_see_edit_email_link: true,
    authentication_options: [],
    can_change_user_type: false,
    can_delete_own_account: true,
    age: 14,
    us_state: 'WA',
    gender: 'Example gender',
    is_usa: true,
    parent_email: 'parent@example.com',
    dependent_students_count: 0,
  },
  password: 'currentpass',
  description:
    'Student: display name only, masked email, existing parent email.',
};

const ssoTeacher: UsersScenario = {
  currentUser: {
    ...baseCurrentUser,
    id: 3,
    username: 'grace_hopper',
    display_name: 'Grace Hopper',
    short_name: 'Grace',
  },
  // No password; only a Google authentication option.
  settings: {
    user_type: 'teacher',
    given_name: 'Grace',
    family_name: 'Hopper',
    display_name: 'Grace Hopper',
    username: 'grace_hopper',
    email: 'grace@example.com',
    has_password: false,
    can_edit_email: true,
    can_edit_password: true,
    should_see_add_password_form: true,
    should_see_edit_email_link: true,
    authentication_options: [
      {credential_type: 'google_oauth2', email: 'grace@example.com'},
    ],
    can_change_user_type: true,
    can_delete_own_account: true,
    age: '21+',
    us_state: null,
    gender: null,
    is_usa: true,
    parent_email: null,
    dependent_students_count: 0,
  },
  description: 'Google-only educator: no password, shows Create password.',
};

// Oauth-only student: legacy routes them to "Create personal login", not
// add-password, so the entitlement is false.
const ssoStudent: UsersScenario = {
  currentUser: {
    ...baseCurrentUser,
    id: 4,
    user_type: 'student',
    username: 'brave_fox_88',
    display_name: 'Max Rivera',
    short_name: 'Max',
    is_verified_instructor: false,
    educator_role: null,
    grades_teaching: [],
    over_21: false,
    age: 13,
  },
  settings: {
    user_type: 'student',
    given_name: 'Max',
    family_name: null,
    display_name: 'Max Rivera',
    username: 'brave_fox_88',
    email: null,
    has_password: false,
    can_edit_email: true,
    can_edit_password: true,
    should_see_add_password_form: false,
    // Oauth-only students don't see edit-email (no stored cleartext address).
    should_see_edit_email_link: false,
    authentication_options: [{credential_type: 'google_oauth2', email: null}],
    can_change_user_type: false,
    can_delete_own_account: true,
    age: 13,
    us_state: 'WA',
    gender: null,
    is_usa: true,
    parent_email: null,
    dependent_students_count: 0,
  },
  description: 'Google-only student: no add-password, no edit-email link.',
};

// A word/picture student with optional fields null and edits locked; exercises
// the all-null / empty-affordance paths.
const minimal: UsersScenario = {
  currentUser: {
    ...baseCurrentUser,
    id: 5,
    user_type: 'student',
    username: 'coder',
    display_name: 'coder',
    short_name: 'coder',
    is_verified_instructor: false,
    educator_role: null,
    grades_teaching: [],
    over_21: false,
    age: 9,
    us_state_code: null,
  },
  settings: {
    user_type: 'student',
    given_name: null,
    family_name: null,
    display_name: 'coder',
    username: 'coder',
    email: null,
    has_password: false,
    can_edit_email: false,
    can_edit_password: false,
    should_see_add_password_form: false,
    should_see_edit_email_link: false,
    authentication_options: [],
    can_change_user_type: false,
    can_delete_own_account: false,
    age: null,
    us_state: null,
    gender: null,
    is_usa: false,
    parent_email: null,
    dependent_students_count: 0,
  },
  description: 'Word/picture student, everything locked (no edit, no delete).',
};

// QA-only scenarios filling gaps the base five can't reach. Not shipped.

// Student with no parent email yet: exercises the pure parent-email ADD path
// (base `student` already has one, so only tests update/remove).
const studentNoParent: UsersScenario = {
  ...student,
  currentUser: {...student.currentUser, id: 6},
  settings: {...student.settings, parent_email: null},
  description: 'Student with no parent email — the add-parent flow.',
};

// Deletable teacher with exactly one dependent: verifies the SINGULAR delete
// copy ("1 dependent student account", no trailing "s"); base teacher has 2.
const oneDependent: UsersScenario = {
  ...teacher,
  currentUser: {...teacher.currentUser, id: 7},
  settings: {...teacher.settings, dependent_students_count: 1},
  description: 'Deletable account with 1 dependent — singular delete copy.',
};

// Teacher who can't change account type: the type switcher should be absent.
const teacherLockedType: UsersScenario = {
  ...teacher,
  currentUser: {...teacher.currentUser, id: 8},
  settings: {...teacher.settings, can_change_user_type: false},
  description: "Educator who can't change type — switcher hidden.",
};

// Student with age + state unset but editable: verifies the disabled "Select …"
// placeholder shows, and that once a value is picked it can't be re-blanked.
const ageStateUnset: UsersScenario = {
  ...student,
  currentUser: {...student.currentUser, id: 9, us_state_code: null},
  settings: {
    ...student.settings,
    age: null,
    us_state: null,
    parent_email: null,
  },
  description: 'Student with age/state unset — placeholders + reblank guard.',
};

// Overflow / truncation / unicode probe: very long names + an emoji display
// name, at narrow viewports.
const longStrings: UsersScenario = {
  currentUser: {
    ...baseCurrentUser,
    id: 10,
    display_name:
      'Maximiliana Wolfeschlegelsteinhausenbergerdorff 🦄✨ the Magnificent',
  },
  settings: {
    user_type: 'teacher',
    given_name:
      'Maximilianaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    family_name:
      'Wolfeschlegelsteinhausenbergerdorffwelchevoralternwarengewissenhaft',
    display_name:
      'Maximiliana Wolfeschlegelsteinhausenbergerdorff 🦄✨ the Magnificent',
    username: 'maximiliana_wolfeschlegelsteinhausenbergerdorff_the_magnificent',
    email:
      'maximiliana.wolfeschlegelsteinhausenbergerdorff.the.magnificent@an-extremely-long-subdomain.example.org',
    has_password: true,
    can_edit_email: true,
    can_edit_password: true,
    should_see_add_password_form: false,
    should_see_edit_email_link: true,
    authentication_options: [
      {
        credential_type: 'email',
        email:
          'maximiliana.wolfeschlegelsteinhausenbergerdorff.the.magnificent@an-extremely-long-subdomain.example.org',
      },
    ],
    can_change_user_type: true,
    can_delete_own_account: true,
    age: '21+',
    us_state: 'WA',
    gender: null,
    is_usa: true,
    parent_email: null,
    dependent_students_count: 0,
  },
  password: 'currentpass',
  description: 'Very long + emoji names — overflow / truncation probe.',
};

// Student who CAN change type: exercises the student->teacher upgrade path,
// where the confirm modal additionally prompts for a (required) email address.
const studentCanSwitch: UsersScenario = {
  ...student,
  currentUser: {...student.currentUser, id: 11},
  settings: {...student.settings, can_change_user_type: true},
  description: 'Student who can upgrade — type change prompts for email.',
};

export const ACCOUNT_SCENARIOS: Record<UsersScenarioTag, UsersScenario> = {
  teacher,
  student,
  'sso-teacher': ssoTeacher,
  'sso-student': ssoStudent,
  minimal,
  'student-no-parent': studentNoParent,
  'one-dependent': oneDependent,
  'teacher-locked-type': teacherLockedType,
  'age-state-unset': ageStateUnset,
  'long-strings': longStrings,
  'student-can-switch': studentCanSwitch,
};

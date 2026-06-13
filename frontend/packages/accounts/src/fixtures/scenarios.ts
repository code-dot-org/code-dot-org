import type {z} from 'zod';

import type {CurrentUserResponseSignedIn} from '@code-dot-org/core/api';

import type {AccountSettingsResponseSchema} from '../api/accounts.schemata';

// The settings read body in WIRE (snake_case) format. Typed as the schema's
// input so fixture drift fails `tsc` at the fixture (D12).
export type AccountSettingsWire = z.input<typeof AccountSettingsResponseSchema>;

export const ACCOUNTS_SCENARIO_TAGS = [
  'teacher',
  'student',
  'sso-teacher',
  'sso-student',
  'minimal',
] as const;

export type AccountsScenarioTag = (typeof ACCOUNTS_SCENARIO_TAGS)[number];

export interface AccountScenario {
  currentUser: CurrentUserResponseSignedIn;
  settings: AccountSettingsWire;
  /** Cleartext password the mock auth checks accept; absent for SSO-only. */
  password?: string;
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
  ai_tutor_access_denied: false,
  ai_rubrics_disabled: false,
  ai_differentiation_enabled: true,
  has_seen_ai_assessments_announcement: true,
  has_completed_ai_differentiation_welcome: true,
  is_lti: false,
  in_section: null,
  created_at: '2020-01-01T00:00:00Z',
};

const teacher: AccountScenario = {
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
    dependent_students_count: 2,
  },
  password: 'currentpass',
};

const student: AccountScenario = {
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
    dependent_students_count: 0,
  },
  password: 'currentpass',
};

const ssoTeacher: AccountScenario = {
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
    dependent_students_count: 0,
  },
};

// Oauth-only student: signed in with Google, no password. Legacy routes them to
// the "Create personal login" flow, not add-password, so the entitlement is
// false — the page must offer neither password button.
const ssoStudent: AccountScenario = {
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
    dependent_students_count: 0,
  },
};

// The least-populated account we can render: a word/picture student with no
// name parts, email, password, age, state, or auth providers and the most
// restrictive permissions. Exercises the all-null / empty-affordance paths —
// age/state placeholders, masked email with no edit, no password action, and a
// disabled delete in an otherwise-empty Account Actions.
const minimal: AccountScenario = {
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
    dependent_students_count: 0,
  },
};

export const ACCOUNT_SCENARIOS: Record<AccountsScenarioTag, AccountScenario> = {
  teacher,
  student,
  'sso-teacher': ssoTeacher,
  'sso-student': ssoStudent,
  minimal,
};

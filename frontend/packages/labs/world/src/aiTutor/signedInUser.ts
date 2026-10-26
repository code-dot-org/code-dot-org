// A signed-in student, for the standalone harness.
//
// `@code-dot-org/core`'s default `/api/v1/users/current` handler answers
// SIGNED OUT, which is the right default: it lets any route render in mock
// mode without pretending somebody is logged in. Its own comment names the way
// past it — "a scenario can override this by registering a wildcard
// `users/current` route through `registerMockFixture`" — and this is that.
//
// World Lab needs one because the AI Tutor's access rules read the current user,
// and they read silence as no permission (`areAiChatToolsEnabled`). Signed out,
// the harness renders a tutor tab that says a teacher has switched it off:
// true to production, and useless to develop against.
//
// Every field `CurrentUserResponseSchema` requires, because it VALIDATES the
// response and a partial one fails to parse. That failure is silent in the
// worst way — react-query keeps the error, `data` stays undefined, nothing
// reaches the console, and everything gated on knowing who is signed in
// behaves as though nobody is. It shipped once missing `in_section` and
// `created_at`, and the symptom was an AI Tutor insisting a teacher had
// disabled it.

import type {CurrentUserResponse} from '@code-dot-org/core/api';

export const SIGNED_IN_STUDENT = {
  is_signed_in: true,
  id: 1,
  username: 'demo_student',
  display_name: 'Demo Student',
  short_name: 'Demo',
  user_type: 'student',
  is_verified_instructor: false,
  is_levelbuilder: false,
  educator_role: null,
  grades_teaching: [],
  under_13: false,
  over_21: true,
  age: 21,
  country_code: 'US',
  us_state_code: null,
  child_account_compliance_state: null,
  sharing_disabled: false,
  mute_music: false,
  sort_by_family_name: false,
  has_seen_homepage_welcome: true,
  has_dismissed_personalization_alert: true,
  // The tutor's whole reason for being here: signed out or unset, every AI
  // feature renders as a notice saying a teacher switched it off.
  ai_chat_access_level: 'enabled',
  us_only_aichat_models_disabled: false,
  ai_rubrics_disabled: false,
  ai_differentiation_enabled: false,
  has_seen_ai_assessments_announcement: true,
  has_completed_ai_differentiation_welcome: true,
  is_lti: false,
  in_section: true,
  created_at: '2024-01-01T00:00:00.000Z',
} satisfies CurrentUserResponse;

import {http, HttpResponse} from 'msw';

/**
 * A signed-in student, for harnesses that have no Rails behind them.
 *
 * Every field `CurrentUserResponseSchema` requires, because it validates the
 * response and a partial one fails to parse — which is worse than useless in a
 * demo, since the error is a zod complaint about a field nobody was thinking
 * about. Anything a lab wants to vary it can override with its own handler.
 *
 * `ai_chat_access_level` is `enabled` on purpose: a harness that stood in for a
 * student with no AI access would render every AI feature as a notice saying a
 * teacher had switched it off. That is true to production and useless to
 * develop against.
 */
export const MOCK_CURRENT_USER = {
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
  ai_chat_access_level: 'enabled',
  ai_rubrics_disabled: false,
  ai_differentiation_enabled: false,
  has_seen_ai_assessments_announcement: true,
  has_completed_ai_differentiation_welcome: true,
  is_lti: false,
  in_section: true,
  created_at: '2024-01-01T00:00:00.000Z',
};

export const usersHandlers = [
  // GET /api/v1/users/current — who is looking at this page.
  http.get('*/api/v1/users/current', () =>
    HttpResponse.json(MOCK_CURRENT_USER),
  ),
];

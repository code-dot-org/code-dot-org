/**
 * Wire shape returned by GET /api/v1/users/current.
 * Discriminated on is_signed_in; signed-out responses carry only the flag.
 * Raw email is intentionally absent and must remain absent.
 */
export type CurrentUserResponse =
  | CurrentUserResponseSignedOut
  | CurrentUserResponseSignedIn;

export interface CurrentUserResponseSignedOut {
  is_signed_in: false;
}

export interface CurrentUserResponseSignedIn {
  is_signed_in: true;

  // Identity
  id: number;
  username: string;
  display_name: string;
  short_name: string;
  user_type: 'student' | 'teacher' | 'admin';

  // Personalization / role signals
  is_verified_instructor: boolean;
  is_levelbuilder: boolean;
  educator_role: string | null;
  grades_teaching: string[];

  // Privacy / compliance signals
  under_13: boolean;
  over_21: boolean;
  age: string | number | null;
  country_code: string | null;
  us_state_code: string | null;
  child_account_compliance_state: string | null;
  sharing_disabled: boolean | null;

  // Preferences
  mute_music: boolean;
  sort_by_family_name: boolean;
  has_seen_homepage_welcome: boolean;
  has_dismissed_personalization_alert: boolean;

  // AI gating
  ai_chat_access_level: string | number;
  ai_tutor_access_denied: boolean;
  ai_rubrics_disabled: boolean | null;
  ai_differentiation_enabled: boolean;
  has_seen_ai_assessments_announcement: boolean;
  has_completed_ai_differentiation_welcome: boolean;

  // Session context
  is_lti: boolean;
  in_section: number | null;
  created_at: string; // ISO-8601 timestamp
}

/**
 * Identity/roles constants the ported fat-lab closure expects from
 * `@code-dot-org/users` on its origin branch. Staging's real `users` package
 * is unrelated (the account-settings page) — see package.json for why this
 * shim exists.
 */

export const CourseRoles = {
  Learner: 'learner',
  Instructor: 'instructor',
  Facilitator: 'facilitator',
} as const;
export type CourseRole = (typeof CourseRoles)[keyof typeof CourseRoles];

export const OAuthSectionTypes = {
  GoogleClassroom: 'google_classroom',
  Clever: 'clever',
} as const;
export type OAuthSectionType =
  (typeof OAuthSectionTypes)[keyof typeof OAuthSectionTypes];

// A stable per-tab id for the lifetime of the page — real usage elsewhere in
// this closure is multi-tab save-conflict detection, which the local
// authoring session's single-tab demo use never exercises.
let tabId: string | undefined;
export function getTabId(): string {
  tabId ??= crypto.randomUUID();
  return tabId;
}

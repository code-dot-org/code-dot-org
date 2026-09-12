// Public API. The default export is the page component Studio lazy-loads.
export {default, default as UsersSettingsPage} from './UsersSettingsPage';
export type {UsersSettingsPageProps} from './UsersSettingsPage';

// The account data layer (schemas, API, query hooks) lives in
// @code-dot-org/core/api; the package owns only the page and its error policy.
export {UsersApiValidationError} from './api/UsersApiValidationError';
export type {SaveState} from '@code-dot-org/component-library/form';
export type {FieldErrors} from './api/users.types';
export type {
  UserSettings,
  AuthenticationOptionSummary,
} from '@code-dot-org/core/api';
// NOT re-exported: core/api's `UserType` is 'student' | 'teacher' | 'admin'
// (the server's user_type enum), while the redux layer below exports a
// same-named but different union, 'unknown' | 'student' | 'teacher', where
// "unknown" means not-yet-loaded. They are not interchangeable, and the redux
// one is what existing consumers (teacher-dashboard) mean. Import the server
// type from '@code-dot-org/core/api' directly.

// The current-user/session redux layer, consumed by labs, progress, and the
// teacher dashboard. Same package, separate concern from the settings page.
export * from './constants';
export * from './redux';
export * from './sessionId';
export * from './types';

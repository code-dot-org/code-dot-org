// Public API. The default export is the page component Studio lazy-loads.
export {default, default as UsersSettingsPage} from './UsersSettingsPage';
export type {UsersSettingsPageProps} from './UsersSettingsPage';

// The account data layer (schemas, API, query hooks) lives in
// @code-dot-org/core/api; the package owns only the page and its error policy.
export {UsersApiValidationError} from './api/UsersApiValidationError';
export type {SaveState} from './state/saveState';
export type {FieldErrors} from './api/users.types';
export type {
  UserSettings,
  AuthenticationOptionSummary,
  UserType,
} from '@code-dot-org/core/api';

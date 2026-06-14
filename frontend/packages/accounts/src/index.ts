// Public API. The default export is the page component Studio lazy-loads.
export {default, default as AccountSettingsPage} from './AccountSettingsPage';
export type {AccountSettingsPageProps} from './AccountSettingsPage';

// The account data layer (schemas, API, query hooks) lives in
// @code-dot-org/core/api; the package owns only the page and its error policy.
export {AccountsApiValidationError} from './api/AccountsApiValidationError';
export type {SaveState} from './state/saveState';
export type {FieldErrors} from './api/accounts.types';
export type {
  AccountSettings,
  AuthenticationOptionSummary,
  UserType,
} from '@code-dot-org/core/api';

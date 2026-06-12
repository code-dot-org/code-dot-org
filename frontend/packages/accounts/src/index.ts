// Public API for @code-dot-org/accounts.
//
// The default export is the page component, consumed by Studio via React.lazy.
// `AccountSettingsPage` is the same component under a named export.
export {default, default as AccountSettingsPage} from './AccountSettingsPage';
export type {AccountSettingsPageProps} from './AccountSettingsPage';

// Error class and save-state type are public (D12); zod schemas and the API
// functions stay internal to the package.
export {AccountsApiValidationError} from './api/AccountsApiValidationError';
export type {SaveState} from './state/saveState';
export type {
  AccountSettings,
  AuthenticationOptionSummary,
  FieldErrors,
  UserType,
} from './api/accounts.types';

// Public API. The default export is the page component Studio lazy-loads.
export {default, default as AccountSettingsPage} from './AccountSettingsPage';
export type {AccountSettingsPageProps} from './AccountSettingsPage';

// The zod schemas and API functions stay internal to the package.
export {AccountsApiValidationError} from './api/AccountsApiValidationError';
export type {SaveState} from './state/saveState';
export type {
  AccountSettings,
  AuthenticationOptionSummary,
  FieldErrors,
  UserType,
} from './api/accounts.types';

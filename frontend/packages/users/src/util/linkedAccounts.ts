// Linked-account rules ported from legacy apps/src/accounts/ManageLinkedAccounts.jsx.
import type {
  AuthenticationOptionSummary,
  IntegrationsSettings,
  UserSettings,
} from '@code-dot-org/core/api';

export const LTI_PROVIDER = 'lti_v1';

// Legacy order (apps/src/accounts/constants.js SingleSignOnProviders).
export const LINKABLE_PROVIDERS = [
  'google_oauth2',
  'microsoft_v2_auth',
  'clever',
  'classlink',
  'facebook',
] as const;

const DISPLAYED_PROVIDERS: readonly string[] = [
  ...LINKABLE_PROVIDERS,
  LTI_PROVIDER,
];

// Child Account Policy: a student needs parental permission to link these.
const PERSONAL_LOGIN_PROVIDERS = new Set([
  'google_oauth2',
  'microsoft_v2_auth',
  'facebook',
]);

export function connectedAccounts(
  options: AuthenticationOptionSummary[],
): AuthenticationOptionSummary[] {
  return DISPLAYED_PROVIDERS.flatMap(provider =>
    options.filter(option => option.credentialType === provider),
  );
}

export function unconnectedProviders(options: AuthenticationOptionSummary[]) {
  return LINKABLE_PROVIDERS.filter(
    provider => !options.some(option => option.credentialType === provider),
  );
}

export function isConnectLocked(
  provider: string,
  integrations: IntegrationsSettings,
): boolean {
  return (
    PERSONAL_LOGIN_PROVIDERS.has(provider) &&
    !integrations.personalAccountLinkingEnabled
  );
}

export function lockedConnectMessage(settings: UserSettings): string {
  return settings.usState && settings.age
    ? 'Uh oh! You must obtain parental permission before creating a linked account.'
    : 'Uh oh! Please provide your age and state before adding a linked account.';
}

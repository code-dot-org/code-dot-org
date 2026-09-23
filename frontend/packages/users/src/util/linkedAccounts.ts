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

const NO_OTHER_LOGIN_MESSAGE =
  'To make sure you can still sign in to your account, please add a password or another linked account first.';
const ROSTERED_SECTION_MESSAGE =
  'You cannot disconnect from this linked account because it is tied to one of your sections.';

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

function isRosteredLogin(
  option: AuthenticationOptionSummary,
  integrations: IntegrationsSettings,
): boolean {
  switch (option.credentialType) {
    case 'google_oauth2':
      return integrations.isGoogleClassroomStudent;
    case 'clever':
      return integrations.isCleverStudent;
    default:
      return false;
  }
}

function canSignInWithout(
  option: AuthenticationOptionSummary,
  settings: UserSettings,
): boolean {
  const onlyLtiLogins = settings.authenticationOptions.every(
    other => other.credentialType === LTI_PROVIDER,
  );
  if (option.credentialType === LTI_PROVIDER && onlyLtiLogins) return false;

  const remaining = settings.authenticationOptions.filter(
    other => other.id !== option.id,
  );
  return (
    settings.hasPassword ||
    remaining.some(other => other.credentialType !== 'email')
  );
}

export function disconnectBlockedMessage(
  option: AuthenticationOptionSummary,
  settings: UserSettings,
  integrations: IntegrationsSettings,
): string | undefined {
  if (isRosteredLogin(option, integrations)) return ROSTERED_SECTION_MESSAGE;
  if (!canSignInWithout(option, settings)) return NO_OTHER_LOGIN_MESSAGE;
  return undefined;
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

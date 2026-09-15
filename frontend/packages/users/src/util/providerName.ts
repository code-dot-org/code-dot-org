// Human-readable provider name for the SSO row's text identity; logos are
// aria-hidden, so the name carries the meaning for screen readers.
const PROVIDER_NAMES: Record<string, string> = {
  google_oauth2: 'Google',
  clever: 'Clever',
  microsoft_v2_auth: 'Microsoft',
  facebook: 'Facebook',
  classlink: 'ClassLink',
  twitter: 'Twitter',
};

export function providerName(credentialType: string): string {
  return PROVIDER_NAMES[credentialType] ?? credentialType;
}

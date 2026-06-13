// Maps an AuthenticationOption credential_type to a human-readable provider
// name for the SSO row's text identity (logos are aria-hidden; the name lives
// in adjacent text per the a11y spec).
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

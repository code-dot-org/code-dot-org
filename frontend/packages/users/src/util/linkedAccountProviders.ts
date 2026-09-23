import type {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {providerName} from './providerName';

const SSO = 'SSO';
const LMS_INTEGRATION = 'LMS Integration';

interface LinkedAccountProvider {
  icon: Pick<FontAwesomeV6IconProps, 'iconName' | 'iconFamily'>;
  badges: readonly string[];
}

// Icons match the sign-up page's (apps/src/signUpFlow/LoginTypeSelection.tsx).
const PROVIDERS: Record<string, LinkedAccountProvider> = {
  google_oauth2: {
    icon: {iconName: 'google', iconFamily: 'brands'},
    badges: [SSO, LMS_INTEGRATION],
  },
  microsoft_v2_auth: {
    icon: {iconName: 'microsoft', iconFamily: 'brands'},
    badges: [SSO],
  },
  clever: {
    icon: {iconName: 'clever', iconFamily: 'kit'},
    badges: [SSO, LMS_INTEGRATION],
  },
  classlink: {
    icon: {iconName: 'classlink', iconFamily: 'kit'},
    badges: [SSO, LMS_INTEGRATION],
  },
  facebook: {
    icon: {iconName: 'facebook-f', iconFamily: 'brands'},
    badges: [SSO],
  },
  lti_v1: {
    icon: {iconName: 'graduation-cap'},
    badges: [SSO, LMS_INTEGRATION],
  },
};

// Keyed by LtiIntegration#platform_name; names from legacy LmsLoginTypeNames.
const LMS_PLATFORMS: Record<string, {name: string}> = {
  canvas_cloud: {name: 'Canvas'},
  canvas_beta_cloud: {name: 'Canvas Beta'},
  canvas_test_cloud: {name: 'Canvas Test'},
  schoology: {name: 'Schoology'},
};

export function linkedAccountProvider(
  credentialType: string,
): LinkedAccountProvider | undefined {
  return PROVIDERS[credentialType];
}

export function lmsPlatform(
  lmsName: string | null,
): {name: string} | undefined {
  return lmsName ? LMS_PLATFORMS[lmsName] : undefined;
}

export function linkedAccountName(
  credentialType: string,
  lmsName: string | null,
): string {
  if (credentialType === 'lti_v1') return lmsPlatform(lmsName)?.name ?? 'LMS';
  return providerName(credentialType);
}

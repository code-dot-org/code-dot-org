import type {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {providerName} from './providerName';

const SSO = 'SSO';
const LMS_INTEGRATION = 'LMS Integration';

interface LinkedAccountProvider {
  icon: Pick<FontAwesomeV6IconProps, 'iconName' | 'iconFamily'>;
  badges: readonly string[];
  learnMoreUrl?: string;
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
    learnMoreUrl:
      'https://support.code.org/hc/en-us/articles/115002716111-Setting-Up-Sections-with-Clever-Sync',
  },
  classlink: {
    icon: {iconName: 'classlink', iconFamily: 'kit'},
    badges: [SSO, LMS_INTEGRATION],
    learnMoreUrl:
      'https://support.code.org/hc/en-us/articles/43950200633869-Adding-CodeAI-to-the-ClassLink-Dashboard',
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

const CANVAS_URL =
  'https://support.code.org/hc/en-us/articles/24825250283021-Single-Sign-On-with-Canvas';

// Keyed by LtiIntegration#platform_name; names from legacy LmsLoginTypeNames.
const LMS_PLATFORMS: Record<string, {name: string; learnMoreUrl: string}> = {
  canvas_cloud: {name: 'Canvas', learnMoreUrl: CANVAS_URL},
  canvas_beta_cloud: {name: 'Canvas Beta', learnMoreUrl: CANVAS_URL},
  canvas_test_cloud: {name: 'Canvas Test', learnMoreUrl: CANVAS_URL},
  schoology: {
    name: 'Schoology',
    learnMoreUrl:
      'https://support.code.org/hc/en-us/articles/26677769411085-Single-Sign-On-with-Schoology',
  },
};

export function linkedAccountProvider(
  credentialType: string,
): LinkedAccountProvider | undefined {
  return PROVIDERS[credentialType];
}

export function lmsPlatform(
  lmsName: string | null,
): {name: string; learnMoreUrl: string} | undefined {
  return lmsName ? LMS_PLATFORMS[lmsName] : undefined;
}

export function linkedAccountName(
  credentialType: string,
  lmsName: string | null,
): string {
  if (credentialType === 'lti_v1') return lmsPlatform(lmsName)?.name ?? 'LMS';
  return providerName(credentialType);
}

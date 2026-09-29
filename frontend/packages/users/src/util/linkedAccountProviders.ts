import type {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import canvasLogo from '../assets/providers/canvas.webp';
import classlinkLogo from '../assets/providers/classlink.webp';
import cleverLogo from '../assets/providers/clever.svg';
import facebookLogo from '../assets/providers/facebook.svg';
import googleLogo from '../assets/providers/google.webp';
import microsoftLogo from '../assets/providers/microsoft.svg';
import powerSchoolLogo from '../assets/providers/powerschool.svg';

import {LTI_PROVIDER} from './linkedAccounts';
import {providerName} from './providerName';

type LinkedAccountIcon =
  | string
  | Pick<FontAwesomeV6IconProps, 'iconName' | 'iconFamily'>;

interface LinkedAccountProvider {
  icon: LinkedAccountIcon;
  learnMoreUrl?: string;
}

// Logos come from each provider's own brand kit; an LMS login takes its
// platform's logo below, else this generic mark.
const PROVIDERS: Record<string, LinkedAccountProvider> = {
  google_oauth2: {icon: googleLogo},
  microsoft_v2_auth: {icon: microsoftLogo},
  clever: {
    icon: cleverLogo,
    learnMoreUrl:
      'https://support.code.org/hc/en-us/articles/115002716111-Setting-Up-Sections-with-Clever-Sync',
  },
  classlink: {
    icon: classlinkLogo,
    learnMoreUrl:
      'https://support.code.org/hc/en-us/articles/43950200633869-Adding-CodeAI-to-the-ClassLink-Dashboard',
  },
  facebook: {icon: facebookLogo},
  [LTI_PROVIDER]: {icon: {iconName: 'graduation-cap'}},
};

const CANVAS_URL =
  'https://support.code.org/hc/en-us/articles/24825250283021-Single-Sign-On-with-Canvas';

// Keyed by LtiIntegration#platform_name; Canvas names from legacy
// LmsLoginTypeNames and its logo from the sign-up page (apps/src/signUpFlow/images).
// PowerSchool acquired Schoology and brands it with the PowerSchool mark.
const LMS_PLATFORMS: Record<
  string,
  {name: string; icon: string; learnMoreUrl: string}
> = {
  canvas_cloud: {name: 'Canvas', icon: canvasLogo, learnMoreUrl: CANVAS_URL},
  canvas_beta_cloud: {
    name: 'Canvas Beta',
    icon: canvasLogo,
    learnMoreUrl: CANVAS_URL,
  },
  canvas_test_cloud: {
    name: 'Canvas Test',
    icon: canvasLogo,
    learnMoreUrl: CANVAS_URL,
  },
  schoology: {
    name: 'PowerSchool (Schoology)',
    icon: powerSchoolLogo,
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
): {name: string; icon: string; learnMoreUrl: string} | undefined {
  return lmsName ? LMS_PLATFORMS[lmsName] : undefined;
}

export function linkedAccountName(
  credentialType: string,
  lmsName: string | null,
): string {
  if (credentialType === LTI_PROVIDER)
    return lmsPlatform(lmsName)?.name ?? 'LMS';
  return providerName(credentialType);
}

export function linkedAccountIcon(
  credentialType: string,
  lmsName: string | null,
): LinkedAccountIcon | undefined {
  const icon = linkedAccountProvider(credentialType)?.icon;
  if (credentialType === LTI_PROVIDER)
    return lmsPlatform(lmsName)?.icon ?? icon;
  return icon;
}

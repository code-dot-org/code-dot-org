import type {CorePlugin} from '@/config';

import {connectOneTrust} from './providers/onetrust';
import {markConsentSettled} from './settled';
import {consent, pushConsentState} from './store';

export type {ConsentCategory, ConsentState, ConsentSource} from './types';
export {consent};
export {isConsentSettled, whenConsentSettled} from './settled';
export {useConsent} from './useConsent';

/**
 * CorePlugin implementation for browser cookie consent.
 * Register at bootstrap via initializeCore({plugins: [consentPlugin]}).
 * Register it before any plugin that gates on consent settlement.
 */
export const consentPlugin: CorePlugin = {
  /** Adopt the host page's OneTrust, if any. */
  onCoreReady() {
    connectOneTrust(pushConsentState, markConsentSettled);
  },
};

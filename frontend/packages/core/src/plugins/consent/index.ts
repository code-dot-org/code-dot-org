import type {CorePlugin} from '@/config';

import {connectOneTrust} from './providers/onetrust';
import {consent, pushConsentState} from './store';

export type {ConsentCategory, ConsentState, ConsentSource} from './types';
export {consent};
export {useConsent} from './useConsent';

/**
 * CorePlugin implementation for browser cookie consent.
 * Register at bootstrap via initializeCore({plugins: [consentPlugin]}).
 */
export const consentPlugin: CorePlugin = {
  /** Adopt the host page's OneTrust, if any. */
  onCoreReady() {
    connectOneTrust(pushConsentState);
  },
};

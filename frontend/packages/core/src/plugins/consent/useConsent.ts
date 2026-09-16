import {useSyncExternalStore} from 'react';

import {consent} from './store';
import type {ConsentState} from './types';

/** Current `ConsentState`, re-rendering the component on every change. */
export function useConsent(): ConsentState {
  return useSyncExternalStore(consent.subscribe, consent.current);
}

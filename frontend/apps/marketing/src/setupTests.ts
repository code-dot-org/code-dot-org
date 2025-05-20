import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';
import {TextEncoder} from 'node:util';

import {PUBLIC_ENV_KEY} from '@/providers/environment/constants';

if (typeof window !== 'undefined') {
  window[PUBLIC_ENV_KEY] = {
    NEXT_PUBLIC_STAGE: 'development',
  };
}

global.TextEncoder = TextEncoder;

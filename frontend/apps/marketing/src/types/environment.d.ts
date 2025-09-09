import {PUBLIC_ENV_KEY} from '@/providers/environment/constants';

declare global {
  interface Window {
    [PUBLIC_ENV_KEY]: {
      NEXT_PUBLIC_STAGE: string;
      [key: string]: string;
    };
  }
}

export {};

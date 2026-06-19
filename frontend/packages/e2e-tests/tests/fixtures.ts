import {test as base} from '@playwright/test';

import {
  createUser,
  resetSession,
  type CreateUserOptions,
  type UserCredentials,
} from './shared/auth';
import {clearDcdoCookie, mockDcdo} from './shared/dcdo';

type SignInAsNewUser = (options: CreateUserOptions) => Promise<UserCredentials>;

/**
 * Mock the DCDO feature-flag system for the current test. `mock` writes (or
 * updates) the DCDO cookie; `clear` removes it. Call after the page is on the
 * target host so the cookie domain can be derived.
 */
interface Dcdo {
  mock(key: string, value: unknown): Promise<void>;
  clear(): Promise<void>;
}

interface Fixtures {
  signInAsNewUser: SignInAsNewUser;
  dcdo: Dcdo;
}

export const test = base.extend<Fixtures>({
  signInAsNewUser: async ({page}, use) => {
    await use(async options => {
      await resetSession(page);
      await page.goto('/');
      return createUser(page, options);
    });
  },

  dcdo: async ({page}, use) => {
    await use({
      mock: (key, value) => mockDcdo(page, key, value),
      clear: () => clearDcdoCookie(page),
    });
  },
});

export {expect} from '@playwright/test';

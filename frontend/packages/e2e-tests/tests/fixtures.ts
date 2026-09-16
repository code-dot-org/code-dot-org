import {createVisualTest} from '@code-dot-org/playwright-support/visual';

import {
  createUser,
  resetSession,
  type CreateUserOptions,
  type UserCredentials,
} from './shared/auth';
import {clearDcdoCookie, mockDcdo, type DcdoJsonValue} from './shared/dcdo';

type SignInAsNewUser = (options: CreateUserOptions) => Promise<UserCredentials>;

/**
 * Mock the DCDO feature-flag system for the current test. `mock` writes (or
 * updates) the DCDO cookie; `clear` removes it. Call after the page is on the
 * target host so the cookie domain can be derived.
 */
interface Dcdo {
  mock(key: string, value: DcdoJsonValue): Promise<void>;
  clear(): Promise<void>;
}

interface Fixtures {
  signInAsNewUser: SignInAsNewUser;
  dcdo: Dcdo;
}

const visual = createVisualTest({appName: 'Code.org E2E Playwright'});

export const test = visual.test.extend<Fixtures>({
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

export const {expect} = visual;
export type {
  VisualCheck,
  VisualCheckOptions,
} from '@code-dot-org/playwright-support/visual';

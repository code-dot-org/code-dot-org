import {test as base} from '@playwright/test';

import {
  createUser,
  resetSession,
  type CreateUserOptions,
  type UserCredentials,
} from './shared/auth';

type SignInAsNewUser = (options: CreateUserOptions) => Promise<UserCredentials>;

interface Fixtures {
  signInAsNewUser: SignInAsNewUser;
}

export const test = base.extend<Fixtures>({
  signInAsNewUser: async ({page}, use) => {
    await use(async options => {
      await resetSession(page);
      await page.goto('/');
      return createUser(page, options);
    });
  },
});

export {expect} from '@playwright/test';

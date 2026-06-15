import {type Page} from '@playwright/test';

export type UserType = 'teacher' | 'student';

/** Credentials for a created test user. */
export interface UserCredentials {
  email: string;
  password: string;
  name: string;
}

export interface CreateUserOptions {
  type: UserType;
  name: string;
}

/** Clear the session (cookies) so the next createUser/signIn starts clean. */
export async function resetSession(page: Page): Promise<void> {
  await page.context().clearCookies();
}

/**
 * Create a user via /api/test/create_user and sign them in. Mirrors
 * account_steps.rb create_user + sign_in. The page must already be on the
 * target host so the CSRF token and session cookie are available.
 */
export async function createUser(
  page: Page,
  {type, name}: CreateUserOptions,
): Promise<UserCredentials> {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 1_000_000);
  const email = `user${timestamp}_${rand}@test.xx`;
  const password = `${name}password`;

  await page.evaluate(
    async ({type, email, password, name}) => {
      const csrfToken =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') ?? '';

      const resp = await fetch('/api/test/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          user: {
            user_type: type,
            email,
            password,
            password_confirmation: password,
            name,
            age: '21+',
            terms_of_service_version: '1',
            sign_in_count: 2,
            email_preference_opt_in: 'yes',
            email_preference_form_kind: email,
            email_preference_request_ip: '127.0.0.1',
            email_preference_source: 'ACCOUNT_SIGN_UP',
          },
        }),
      });
      if (!resp.ok) {
        throw new Error(`create_user failed: ${resp.status}`);
      }
    },
    {type, email, password, name},
  );

  await signIn(page, {email, password});

  return {email, password, name};
}

/**
 * Sign in via POST /users/sign_in. Mirrors account_steps.rb sign_in. The page
 * must already be on the target host for the CSRF token fetch.
 */
export async function signIn(
  page: Page,
  {email, password}: {email: string; password: string},
): Promise<void> {
  await page.evaluate(
    async ({email, password}) => {
      const csrfToken =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') ?? '';

      const resp = await fetch('/users/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({user: {login: email, password}}),
      });
      if (!resp.ok) {
        throw new Error(`sign_in failed: ${resp.status}`);
      }
    },
    {email, password},
  );
}

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
  /** Defaults to 2. Pass 0 for a "never signed in" account (new_account=true in Cucumber). */
  signInCount?: number;
  /** Extra fields merged into the `user` body sent to /api/test/create_user. */
  extraFields?: Record<string, string | number | boolean>;
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
  {type, name, signInCount = 2, extraFields}: CreateUserOptions,
): Promise<UserCredentials> {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 1_000_000);
  const email = `user${timestamp}_${rand}@test.xx`;
  const password = `${name}password`;
  const age = type === 'teacher' ? '21+' : '16';

  await page.evaluate(
    async ({type, email, password, name, signInCount, age, extraFields}) => {
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
            age,
            terms_of_service_version: '1',
            sign_in_count: signInCount,
            email_preference_opt_in: 'yes',
            email_preference_form_kind: email,
            email_preference_request_ip: '127.0.0.1',
            email_preference_source: 'ACCOUNT_SIGN_UP',
            ...extraFields,
          },
        }),
      });
      if (!resp.ok) {
        throw new Error(`create_user failed: ${resp.status}`);
      }
    },
    {type, email, password, name, signInCount, age, extraFields},
  );

  await signIn(page, {email, password});

  return {email, password, name};
}

/** Create an EU student with data_transfer_agreement pre-accepted. Mirrors "I create a student in the eu named X" in account_steps.rb. */
export async function createEuStudent(
  page: Page,
  {name}: {name: string},
): Promise<UserCredentials> {
  return createUser(page, {
    type: 'student',
    name,
    extraFields: {
      data_transfer_agreement_accepted: true,
      data_transfer_agreement_request_ip: '127.0.0.1',
      data_transfer_agreement_kind: '0',
      data_transfer_agreement_source: 'ACCOUNT_SIGN_UP',
      data_transfer_agreement_at: new Date().toISOString(),
    },
  });
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

/**
 * Sign out via GET /users/sign_out.json then clear client storage. Mirrors
 * "When I sign out" in account_steps.rb. DELETE returns 404 on test-studio;
 * GET returns 204.
 */
export async function signOut(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const csrfToken =
      document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

    const resp = await fetch('/users/sign_out.json', {
      method: 'GET',
      headers: {'X-CSRF-Token': csrfToken},
    });
    if (resp.status !== 204) {
      throw new Error(`sign_out failed: ${resp.status}`);
    }
    sessionStorage.clear();
    localStorage.clear();
  });
}

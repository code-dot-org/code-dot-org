import {expect, type Page} from '@playwright/test';

import {requestWithCsrf} from './api';

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
  /** Defaults to 2. Pass 0 for a "never signed in" account. */
  signInCount?: number;
  /** Extra fields merged into the `user` body sent to /api/test/create_user. */
  extraFields?: Record<string, string | number | boolean>;
}

/** Clear the session (cookies) so the next createUser/signIn starts clean. */
export async function resetSession(page: Page): Promise<void> {
  await page.context().clearCookies();
}

/**
 * Create a user via /api/test/create_user and sign them in. The page must
 * already be on the target host so the CSRF token and session cookie are
 * available.
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

  const {ok, status} = await requestWithCsrf(
    page,
    'POST',
    '/api/test/create_user',
    {
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
    },
  );
  if (!ok) {
    throw new Error(`create_user failed: ${status}`);
  }

  await signIn(page, {email, password});

  return {email, password, name};
}

/** Create an EU student with data_transfer_agreement pre-accepted. */
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
 * Sign in via POST /users/sign_in. The page must already be on the target host
 * for the CSRF token fetch.
 */
export async function signIn(
  page: Page,
  {email, password}: {email: string; password: string},
): Promise<void> {
  const {ok, status} = await requestWithCsrf(page, 'POST', '/users/sign_in', {
    user: {login: email, password},
  });
  if (!ok) {
    throw new Error(`sign_in failed: ${status}`);
  }
}

/**
 * Create a teacher, open an email-login section, create a student, and enroll
 * the student in that section. The student's session is active on return.
 */
export async function createTeacherAssociatedStudent(
  page: Page,
  {studentName}: {studentName: string},
): Promise<{sectionCode: string}> {
  // createUser signs the teacher in; the /dashboardapi/sections POST needs that
  // session, so reload to pick up the teacher's CSRF token before posting.
  await createUser(page, {type: 'teacher', name: `Teacher_${studentName}`});
  await page.goto('/');

  const section = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {
      login_type: 'email',
      participant_type: 'student',
    },
  );
  if (!section.ok) {
    throw new Error(`sections POST failed: ${section.status}`);
  }
  const {code: sectionCode} = JSON.parse(section.body) as {code: string};

  // createUser signs the student in, replacing the teacher session; reload to
  // pick up the student's CSRF token before enrolling via /join.
  await createUser(page, {type: 'student', name: studentName});
  await page.goto('/');

  const join = await requestWithCsrf(page, 'POST', `/join/${sectionCode}`);
  if (!join.ok) {
    throw new Error(`join POST failed: ${join.status}`);
  }

  return {sectionCode};
}

/**
 * Wait for the post-sign-in landing URL. Students land at /home; teachers land
 * at /teacher_dashboard/home. Match the pathname exactly, not by suffix —
 * '/home' is a suffix of '/teacher_dashboard/home', so a suffix test would
 * accept the teacher landing for a student.
 */
export async function waitForHomeUrl(
  page: Page,
  type: UserType,
): Promise<void> {
  const path = type === 'teacher' ? '/teacher_dashboard/home' : '/home';
  await expect(page).toHaveURL(url => url.pathname === path);
}

/**
 * Sign out via GET /users/sign_out.json then clear client storage. DELETE
 * returns 404 on test-studio; GET returns 204.
 */
export async function signOut(page: Page): Promise<void> {
  const {status} = await requestWithCsrf(page, 'GET', '/users/sign_out.json');
  if (status !== 204) {
    throw new Error(`sign_out failed: ${status}`);
  }
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
}

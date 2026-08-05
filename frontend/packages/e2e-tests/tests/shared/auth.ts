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
  /** Use this email instead of a generated one (lets a caller reference it). */
  email?: string;
  /**
   * POST /users/sign_in after creating. Defaults to true. create_user already
   * establishes a Devise session, so pass false to skip the redundant Warden
   * sign-in, which would increment sign_in_count and re-authenticate the
   * account.
   */
  signInAfterCreate?: boolean;
  /**
   * Provision via OmniAuth instead of a password. When set, create_user drops
   * password/password_confirmation and forwards this as the OmniAuth provider
   * (TestController#create_user's `OmniAuth::AuthHash.new({provider: sso, ...})`).
   */
  sso?: 'clever' | 'google_oauth2';
  /**
   * Omit email/password/password_confirmation from the create_user body, for
   * teacher-managed accounts that have no personal credentials (provider is set
   * via extraFields). Also skips the post-create sign-in.
   */
  omitCredentials?: boolean;
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
  {
    type,
    name,
    signInCount = 2,
    email: emailOverride,
    signInAfterCreate = true,
    sso,
    omitCredentials = false,
    extraFields,
  }: CreateUserOptions,
): Promise<UserCredentials> {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 1_000_000);
  const email = emailOverride ?? `user${timestamp}_${rand}@test.xx`;
  const password = sso ? undefined : `${name}password`;
  const age = type === 'teacher' ? '21+' : '16';

  const {ok, status} = await requestWithCsrf(
    page,
    'POST',
    '/api/test/create_user',
    {
      user: {
        user_type: type,
        ...(omitCredentials ? {} : {email}),
        ...(password && !omitCredentials
          ? {password, password_confirmation: password}
          : {}),
        name,
        age,
        terms_of_service_version: '1',
        sign_in_count: signInCount,
        email_preference_opt_in: 'yes',
        email_preference_form_kind: email,
        email_preference_request_ip: '127.0.0.1',
        email_preference_source: 'ACCOUNT_SIGN_UP',
        ...(sso ? {sso, uid: `${timestamp}_${rand}`} : {}),
        ...extraFields,
      },
    },
  );
  if (!ok) {
    throw new Error(`create_user failed: ${status}`);
  }

  if (signInAfterCreate && password && !omitCredentials) {
    await signIn(page, {email, password});
  }

  return {email, password: password ?? '', name};
}

/** Create an EU student (createStudent variant) with data_transfer_agreement pre-accepted. */
export async function createEuStudent(
  page: Page,
  {name}: {name: string},
): Promise<UserCredentials> {
  return createStudent(page, {
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

export interface CreateStudentOptions {
  /** Display name; defaults to "Test Student". */
  name?: string;
  /** Age; defaults to '16'. Pass '10' for an under-13 account. */
  age?: string;
  /** Sign-in count; defaults to 2. Pass 0 for a "never signed in" account. */
  signInCount?: number;
  /** US state code (e.g. 'CO'); sets country_code='US' and marks it user-provided. */
  usState?: string;
  /** ISO created_at, e.g. to place the account relative to a policy date. */
  createdAt?: string;
  /**
   * Mark the account as parent-created by pre-populating the student's own
   * email as the parent-permission email, which lets the student re-enter it
   * on the CAP lockout page.
   */
  parentCreated?: boolean;
  /** POST /users/sign_in after creating; defaults to true. See createUser. */
  signInAfterCreate?: boolean;
  /**
   * Provision via SSO instead of a password. 'google' maps to the
   * 'google_oauth2' OmniAuth provider (matching account_steps.rb's
   * create_user); 'clever' is passed through unchanged.
   */
  sso?: 'clever' | 'google';
  /**
   * Provision as a teacher-managed "sponsored" account: no personal
   * email/password, provider='sponsored'. Mirrors section_management_steps.rb's
   * "sponsored student" clause. Implies signInAfterCreate:false — a sponsored
   * account has no password to sign in with.
   */
  sponsored?: boolean;
  /** Extra fields merged into the create_user body after the derived ones. */
  extraFields?: Record<string, string | number | boolean>;
}

/**
 * Create a student via createUser with student-shaped sugar: age, US state,
 * created_at, and the parent-created variant (which needs the generated email,
 * so it is generated here). The base student creator other student helpers
 * build on. Pass signInAfterCreate:false to keep a "never signed in" account at
 * sign_in_count 0 and avoid re-authenticating a locked-out account.
 */
export async function createStudent(
  page: Page,
  {
    name = 'Test Student',
    age = '16',
    signInCount = 2,
    usState,
    createdAt,
    parentCreated = false,
    signInAfterCreate = true,
    sso,
    sponsored = false,
    extraFields,
  }: CreateStudentOptions = {},
): Promise<UserCredentials> {
  const email = `student${Date.now()}_${Math.floor(Math.random() * 1_000_000)}@test.xx`;

  return createUser(page, {
    type: 'student',
    name,
    email,
    signInCount,
    signInAfterCreate,
    // Sponsored accounts carry no personal email/password; omitting them also
    // skips the post-create sign-in.
    omitCredentials: sponsored,
    sso: sso === 'google' ? 'google_oauth2' : sso,
    extraFields: {
      age,
      ...(createdAt ? {created_at: createdAt} : {}),
      ...(usState
        ? {
            country_code: 'US',
            us_state: usState,
            user_provided_us_state: 'true',
          }
        : {}),
      ...(parentCreated
        ? {
            parent_email_preference_opt_in_required: '1',
            parent_email_preference_opt_in: 'no',
            parent_email_preference_email: email,
            parent_email_preference_request_ip: '127.0.0.1',
            parent_email_preference_source: 'ACCOUNT_SIGN_UP',
          }
        : {}),
      ...(sponsored ? {provider: 'sponsored'} : {}),
      ...extraFields,
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

export type CreateTeacherAssociatedStudentOptions = {
  studentName: string;
  /**
   * Enroll the teacher in a PLC course before the section is created, granting
   * them "authorized teacher" status. Mirrors section_management_steps.rb's
   * "an authorized teacher-associated ... student" clause.
   */
  authorized?: boolean;
} & Omit<CreateStudentOptions, 'name' | 'signInAfterCreate' | 'extraFields'>;

/**
 * Create a teacher, open an email-login section, create a student, and enroll
 * the student in that section. The student's session is active on return; use
 * the returned teacher credentials with signIn to switch back to the teacher.
 */
export async function createTeacherAssociatedStudent(
  page: Page,
  {
    studentName,
    authorized = false,
    ...studentOpts
  }: CreateTeacherAssociatedStudentOptions,
): Promise<{sectionCode: string} & UserCredentials> {
  // createUser signs the teacher in; the /dashboardapi/sections POST needs that
  // session, so reload to pick up the teacher's CSRF token before posting.
  const teacher = await createUser(page, {
    type: 'teacher',
    name: `Teacher_${studentName}`,
  });
  await page.goto('/');

  if (authorized) {
    const enroll = await requestWithCsrf(
      page,
      'POST',
      '/api/test/enroll_in_plc_course',
    );
    if (!enroll.ok) {
      throw new Error(`enroll_in_plc_course failed: ${enroll.status}`);
    }
  }

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
  await createStudent(page, {name: studentName, ...studentOpts});
  await page.goto('/');

  const join = await requestWithCsrf(page, 'POST', `/join/${sectionCode}`);
  if (!join.ok) {
    throw new Error(`join POST failed: ${join.status}`);
  }

  return {sectionCode, ...teacher};
}

/**
 * Simulate the parent's approval of a pending permission request via the
 * test-only /api/test/accept_parental_request endpoint, using the currently
 * signed-in (student) session.
 */
export async function acceptParentalRequest(page: Page): Promise<void> {
  const {ok, status} = await requestWithCsrf(
    page,
    'POST',
    '/api/test/accept_parental_request',
  );
  if (!ok) {
    throw new Error(`accept_parental_request failed: ${status}`);
  }
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

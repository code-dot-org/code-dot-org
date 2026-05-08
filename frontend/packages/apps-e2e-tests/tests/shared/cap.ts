import {type Page} from '@playwright/test';

import {createTestUser, type CreateUserPayload} from './auth';
import {mockDcdo} from './cookies';

// CPA lockout enforcement date: 2024-07-01T00:00:00 MDT (UTC−6) → UTC.
const CAP_LOCKOUT_ISO = '2024-07-01T06:00:00.000Z';
// cap_CO_start_date = 1 year before lockout date.
const CAP_START_ISO = '2023-07-01T06:00:00.000Z';
// One second before cap_CO_start_date — "before CAP start".
const BEFORE_CAP_ISO = '2023-07-01T05:59:59.000Z';

/**
 * Mocks the CPA lockout phase by setting DCDO cookies for
 * cap_CO_start_date_override and cap_CO_lockout_date_override.
 * Mirrors the `CPA all user lockout phase` Cucumber step.
 *
 * @param page - Playwright page; navigates to /reset_session to establish domain
 */
export async function mockCapLockoutPhase(page: Page): Promise<void> {
  await page.goto('/reset_session');
  await mockDcdo(page, 'cap_CO_start_date_override', CAP_START_ISO);
  await mockDcdo(page, 'cap_CO_lockout_date_override', CAP_LOCKOUT_ISO);
}

/** Options for {@link createCapStudent}. */
export interface CapStudentOptions {
  /** age 10 (under-13); default false → age 16 */
  young?: boolean;
  /** us_state: 'CO', country_code: 'US'; default false */
  colorado?: boolean;
  /** sign_in_count: 0; default false → 2 */
  neverSignedIn?: boolean;
  /** 'after' → created_at = lockout date; 'before' → created_at = before start date */
  timing?: 'after' | 'before';
  /** SSO provider; 'google' is mapped to 'google_oauth2' */
  sso?: 'clever' | 'google';
  /**
   * If true, sets parent_email_preference_email to the student's own email
   * (mirrors the "as a parent" variant from account_steps.rb).
   */
  parentCreated?: boolean;
}

/** Credentials returned by {@link createCapStudent}. */
export interface CapStudentCredentials {
  /** Login email address. */
  email: string;
  /** Plaintext password; undefined for SSO accounts. */
  password: string | undefined;
  /** Display name. */
  displayName: string;
}

/**
 * Creates a student account with CAP-specific attributes (age, state,
 * created_at backdating, optional SSO) and signs in.
 * Mirrors the `I create a (young)? student ... named "..." (after|before CAP start)?`
 * Cucumber step from account_steps.rb.
 *
 * @param page - Playwright page whose browser context receives the session
 * @param options - CAP student configuration
 * @returns email, optional password, and display name
 */
export async function createCapStudent(
  page: Page,
  {
    young = false,
    colorado = false,
    neverSignedIn = false,
    timing,
    sso,
    parentCreated = false,
  }: CapStudentOptions = {},
): Promise<CapStudentCredentials> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `cap_student_${ts}_${rand}@test.xx`;
  const password = sso ? undefined : `CapPass${ts}`;
  const displayName = `CapStudent${ts}`;

  const payload: CreateUserPayload = {
    user_type: 'student',
    email,
    ...(password ? {password, password_confirmation: password} : {}),
    name: displayName,
    age: young ? '10' : '16',
    sign_in_count: neverSignedIn ? 0 : 2,
  };

  if (colorado) {
    payload.country_code = 'US';
    payload.us_state = 'CO';
    payload.user_provided_us_state = true;
  }

  if (timing === 'after') {
    payload.created_at = CAP_LOCKOUT_ISO;
  } else if (timing === 'before') {
    payload.created_at = BEFORE_CAP_ISO;
  }

  if (sso) {
    payload.sso = sso === 'google' ? 'google_oauth2' : sso;
    payload.uid = `${ts}_${rand}`;
  }

  if (parentCreated) {
    payload.parent_email_preference_opt_in_required = '1';
    payload.parent_email_preference_opt_in = 'no';
    payload.parent_email_preference_email = email;
    payload.parent_email_preference_request_ip = '127.0.0.1';
    payload.parent_email_preference_source = 'ACCOUNT_SIGN_UP';
  }

  await createTestUser(page, payload);
  return {email, password, displayName};
}

/** Options for {@link createCapTeacher}. */
export interface CapTeacherOptions {
  /** sign_in_count: 0; default false → 2 */
  neverSignedIn?: boolean;
  /** 'after' → created_at = lockout date; 'before' → created_at = before start date */
  timing?: 'after' | 'before';
}

/**
 * Creates a teacher account with optional CAP-specific created_at backdating.
 * Mirrors the `I create a teacher (who has never signed in)? named "..."
 * (after|before CAP start)?` Cucumber step.
 *
 * @param page - Playwright page whose browser context receives the session
 * @param options - CAP teacher configuration
 * @returns email, password, and display name
 */
export async function createCapTeacher(
  page: Page,
  {neverSignedIn = false, timing}: CapTeacherOptions = {},
): Promise<{email: string; password: string; displayName: string}> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `cap_teacher_${ts}_${rand}@test.xx`;
  const password = `CapTeacherPass${ts}`;
  const displayName = `CapTeacher${ts}`;

  const payload: CreateUserPayload = {
    user_type: 'teacher',
    email,
    password,
    password_confirmation: password,
    name: displayName,
    age: '21+',
    sign_in_count: neverSignedIn ? 0 : 2,
    terms_of_service_version: '1',
    email_preference_opt_in: 'yes',
    email_preference_form_kind: email,
    email_preference_request_ip: '127.0.0.1',
    email_preference_source: 'ACCOUNT_SIGN_UP',
  };

  if (timing === 'after') {
    payload.created_at = CAP_LOCKOUT_ISO;
  } else if (timing === 'before') {
    payload.created_at = BEFORE_CAP_ISO;
  }

  await createTestUser(page, payload);
  return {email, password, displayName};
}

/** Options for {@link createCapSponsoredStudent}. */
export interface CapSponsoredStudentOptions {
  /**
   * Enroll the teacher in a PLC course (POST /api/test/enroll_in_plc_course)
   * before creating the section.  Mirrors "authorized" in section_management_steps.rb.
   */
  authorized?: boolean;
  /** age 10 (under-13); default true */
  under13?: boolean;
  /** us_state: 'CO'; default false */
  colorado?: boolean;
  /** 'after' → created_at = lockout date; 'before' → created_at = before start date */
  timing?: 'after' | 'before';
}

/**
 * Creates an authorized teacher + section + sponsored student enrolled in that
 * section, and signs in as the student.  Mirrors the
 * `I create a(n authorized)? teacher-associated (under-13)? sponsored student
 * (in Colorado)? named "..." (after|before CAP start)?` Cucumber step.
 *
 * @param page - Playwright page whose browser context ends up as the student's session
 * @param options - see {@link CapSponsoredStudentOptions}
 * @returns display name of the created student
 */
export async function createCapSponsoredStudent(
  page: Page,
  {
    authorized = false,
    under13 = true,
    colorado = false,
    timing,
  }: CapSponsoredStudentOptions = {},
): Promise<{displayName: string}> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const teacherEmail = `cap_teacher_${ts}_${rand}@test.xx`;
  const teacherPassword = `CapTeacherPass${ts}`;

  // Create teacher and sign in.
  await createTestUser(page, {
    user_type: 'teacher',
    email: teacherEmail,
    password: teacherPassword,
    password_confirmation: teacherPassword,
    name: `CapTeacher${ts}`,
    age: '21+',
    sign_in_count: 2,
    terms_of_service_version: '1',
    email_preference_opt_in: 'yes',
    email_preference_form_kind: teacherEmail,
    email_preference_request_ip: '127.0.0.1',
    email_preference_source: 'ACCOUNT_SIGN_UP',
  });

  // Optionally enroll teacher in PLC course (makes them "authorized").
  if (authorized) {
    const csrf = await page
      .locator('meta[name="csrf-token"]')
      .getAttribute('content');
    const plcResp = await page.request.post('/api/test/enroll_in_plc_course', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
    });
    if (!plcResp.ok()) {
      throw new Error(
        `enroll_in_plc_course failed: ${plcResp.status()} — ${await plcResp.text()}`,
      );
    }
  }

  // Create a student section under the teacher.
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const sectionResp = await page.request.post('/dashboardapi/sections', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {login_type: 'email', participant_type: 'student'},
  });
  if (!sectionResp.ok()) {
    throw new Error(
      `create section failed: ${sectionResp.status()} — ${await sectionResp.text()}`,
    );
  }
  const sectionCode = ((await sectionResp.json()) as {code: string}).code;

  // Build sponsored student payload (no email/password).
  const studentTs = Date.now();
  const studentRand = Math.random().toString(36).slice(2, 8);
  const displayName = `CapSponsored${studentTs}`;

  const studentPayload: CreateUserPayload = {
    user_type: 'student',
    name: displayName,
    age: under13 ? '10' : '16',
    sign_in_count: 2,
    provider: 'sponsored',
  };

  if (colorado) {
    studentPayload.country_code = 'US';
    studentPayload.us_state = 'CO';
    studentPayload.user_provided_us_state = true;
  }

  if (timing === 'after') {
    studentPayload.created_at = CAP_LOCKOUT_ISO;
  } else if (timing === 'before') {
    studentPayload.created_at = BEFORE_CAP_ISO;
  }

  // Create sponsored student and sign in as student.
  await createTestUser(page, studentPayload);

  // Enroll student in the section.
  const joinCsrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const joinResp = await page.request.post(`/join/${sectionCode}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': joinCsrf ?? '',
    },
  });
  if (!joinResp.ok()) {
    throw new Error(
      `join section failed: ${joinResp.status()} — ${await joinResp.text()}`,
    );
  }

  void studentRand; // suppress unused-var lint
  return {displayName};
}

/**
 * Dismisses the floating `ParentalPermissionModal` if it is visible.
 * On first visit to /users/edit for CAP-subject students the modal fires
 * automatically (no localStorage timestamp yet).  It covers page content and
 * blocks clicks, so call this before interacting with anything on /users/edit.
 *
 * @param page - Playwright page
 */
export async function dismissParentalPermissionModal(
  page: Page,
): Promise<void> {
  const modal = page.locator('#parental-permission-modal');
  if (await modal.isVisible({timeout: 3_000}).catch(() => false)) {
    await modal.getByRole('button', {name: 'Close'}).click();
    await modal.waitFor({state: 'detached', timeout: 5_000});
  }
}

/**
 * Accepts the parental permission request for the currently signed-in student.
 * Mirrors the `My parent permits my parental request` Cucumber step.
 * Requires the student to be signed in (uses current session).
 *
 * @param page - Playwright page whose context holds the student session
 */
export async function acceptParentalRequest(page: Page): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post('/api/test/accept_parental_request', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
  });
  if (!resp.ok()) {
    throw new Error(
      `accept_parental_request failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
}

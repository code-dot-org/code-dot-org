import {type Page} from '@playwright/test';

/**
 * Shared payload fields for {@link createTestUser}.
 * All keys map directly to the /api/test/create_user `user:` JSON body.
 */
export interface CreateUserPayload {
  user_type: 'teacher' | 'student';
  /** Omitted for sponsored and SSO-only accounts. */
  email?: string;
  /** Omitted for SSO and sponsored accounts. */
  password?: string;
  /** Omitted for SSO and sponsored accounts. */
  password_confirmation?: string;
  name: string;
  age: string;
  sign_in_count?: number;
  terms_of_service_version?: string;
  email_preference_opt_in?: string;
  email_preference_form_kind?: string;
  email_preference_request_ip?: string;
  email_preference_source?: string;
  /** US state code (e.g. 'CO').  Suppresses the school-info interstitial. */
  us_state?: string;
  user_provided_us_state?: boolean;
  country_code?: string;
  /** ISO-8601 string; backdates the account for CAP policy testing. */
  created_at?: string;
  /** 'sponsored' for teacher-section accounts with no local credentials. */
  provider?: string;
  /**
   * SSO provider name ('clever', 'google_oauth2').  When set, the controller
   * routes through initialize_new_oauth_user instead of User.create!.
   */
  sso?: string;
  /** OAuth UID companion to {@link sso}. */
  uid?: string;
  parent_email_preference_email?: string;
  parent_email_preference_opt_in_required?: string;
  parent_email_preference_opt_in?: string;
  parent_email_preference_request_ip?: string;
  parent_email_preference_source?: string;
}

/**
 * Create an account via the test-only /api/test/create_user endpoint and
 * sign the browser context in.  Navigates to /reset_session first to obtain
 * a fresh CSRF token; the resulting session cookie is stored in-place.
 *
 * @param page - Playwright page whose browser context will receive the session
 * @param payload - /api/test/create_user `user:` fields
 */
export async function createTestUser(
  page: Page,
  payload: CreateUserPayload,
): Promise<void> {
  await page.goto('/reset_session');
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  const response = await page.request.post('/api/test/create_user', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {user: payload},
  });

  if (!response.ok()) {
    throw new Error(
      `create_user failed: ${response.status()} — ${await response.text()}`,
    );
  }
}

/**
 * Credentials returned by {@link createTeacher} and {@link createStudent}.
 * Useful for tests that later sign in via the UI form or need to display-name
 * assert after account creation.
 */
export interface UserCredentials {
  /** Login email address. */
  email: string;
  /** Plaintext password used to create the account. */
  password: string;
  /** Display name shown in the dashboard header. */
  displayName: string;
}

/**
 * Options for {@link createTeacher}.
 *
 * @property name - display name; defaults to an auto-generated unique string.
 */
interface CreateTeacherOptions {
  name?: string;
}

/**
 * Creates a teacher account and signs in via the test-only
 * /api/test/create_user endpoint (available in rack_env :test only).
 *
 * Navigates to /reset_session first to get a fresh CSRF token, then POSTs
 * from the same browser context so the resulting session cookie is stored
 * in-place. After this call the page is authenticated as the new teacher.
 *
 * @returns email, password, and display name for the new teacher account
 */
export async function createTeacher(
  page: Page,
  {name}: CreateTeacherOptions = {},
): Promise<UserCredentials> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `teacher_${ts}_${rand}@test.xx`;
  const password = `TeacherPass${ts}`;
  const displayName = name ?? `TestTeacher${ts}`;

  await createTestUser(page, {
    user_type: 'teacher',
    email,
    password,
    password_confirmation: password,
    name: displayName,
    age: '21+',
    sign_in_count: 2,
    terms_of_service_version: '1',
    email_preference_opt_in: 'yes',
    email_preference_form_kind: email,
    email_preference_request_ip: '127.0.0.1',
    email_preference_source: 'ACCOUNT_SIGN_UP',
  });
  return {email, password, displayName};
}

/**
 * Options for {@link createStudent}.
 *
 * @property age - student age; defaults to 16. Pass a value < 13 for
 *   under-13 behaviour (age-restriction redirects, song-filter enforcement).
 * @property name - display name; defaults to an auto-generated unique string.
 */
interface CreateStudentOptions {
  age?: number;
  name?: string;
}

/**
 * Creates a student account and signs in.
 * Mirrors `I create a student named "..."` / `I create a young student named "..."`
 * from account_steps.rb: create_user(name, user_type: 'student', age:, sign_in_count: 2)
 *
 * @returns email, password, and display name for the new student account
 */
export async function createStudent(
  page: Page,
  {age = 16, name}: CreateStudentOptions = {},
): Promise<UserCredentials> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `student_${ts}_${rand}@test.xx`;
  const password = `StudentPass${ts}`;
  const displayName = name ?? `TestStudent${ts}`;

  await createTestUser(page, {
    user_type: 'student',
    email,
    password,
    password_confirmation: password,
    name: displayName,
    age: String(age),
    sign_in_count: 2,
  });
  return {email, password, displayName};
}

/**
 * Signs the browser context out by navigating to the session-clearing endpoint.
 * Mirrors `I sign out` from account_steps.rb.
 *
 * @param page - Playwright page whose browser context will be signed out
 */
export async function signOut(page: Page): Promise<void> {
  await page.goto('/users/sign_out');
}

/** Credentials returned by {@link createTeacherAssociatedStudent}. */
export interface TeacherStudentPair {
  /** Teacher's email address, used with {@link signIn} to switch sessions. */
  teacherEmail: string;
  /** Teacher's password. */
  teacherPassword: string;
  /** Section join code. */
  sectionCode: string;
}

/**
 * Signs in an existing user by POSTing to /users/sign_in.
 * Navigates to /reset_session first to clear any existing session and obtain a
 * fresh CSRF token.
 *
 * @param page - Playwright page
 * @param email - user's login email
 * @param password - user's password
 */
export async function signIn(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/reset_session');
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  const response = await page.request.post('/users/sign_in', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {user: {login: email, password}},
  });

  if (!response.ok()) {
    throw new Error(
      `sign_in failed: ${response.status()} — ${await response.text()}`,
    );
  }
}

/**
 * Options for {@link createTeacherAssociatedStudent}.
 *
 * @property studentAge - student age; defaults to 16
 * @property studentName - display name; auto-generated if omitted
 * @property authorized - grant /api/test/authorized_teacher_access to the teacher
 */
interface CreateTeacherAssociatedStudentOptions {
  studentAge?: number;
  studentName?: string;
  authorized?: boolean;
}

/**
 * Creates a teacher, creates a student section under that teacher, creates a
 * student, and enrolls the student in the section.  After the call the browser
 * context is signed in as the student.
 *
 * Mirrors `I create a(n authorized)? teacher-associated student named "..."` from
 * section_management_steps.rb.
 *
 * @param page - Playwright page whose browser context receives the session
 * @param options - optional overrides for student age, name, and authorization
 * @returns teacher credentials and section code, for tests that later sign in
 *   as the teacher via {@link signIn}
 */
export async function createTeacherAssociatedStudent(
  page: Page,
  {
    studentAge = 16,
    studentName,
    authorized = false,
  }: CreateTeacherAssociatedStudentOptions = {},
): Promise<TeacherStudentPair> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const teacherEmail = `teacher_${ts}_${rand}@test.xx`;
  const teacherPassword = `TeacherPass${ts}`;
  const teacherDisplayName = `TestTeacher${ts}`;

  // Create teacher and sign in as teacher.
  await createTestUser(page, {
    user_type: 'teacher',
    email: teacherEmail,
    password: teacherPassword,
    password_confirmation: teacherPassword,
    name: teacherDisplayName,
    age: '21+',
    sign_in_count: 2,
    terms_of_service_version: '1',
    email_preference_opt_in: 'yes',
    email_preference_form_kind: teacherEmail,
    email_preference_request_ip: '127.0.0.1',
    email_preference_source: 'ACCOUNT_SIGN_UP',
  });

  // Optionally grant authorized teacher access while signed in as teacher.
  if (authorized) {
    const csrfForAuth = await page
      .locator('meta[name="csrf-token"]')
      .getAttribute('content');
    const authResp = await page.request.post(
      '/api/test/authorized_teacher_access',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfForAuth ?? '',
        },
      },
    );
    if (!authResp.ok()) {
      throw new Error(
        `authorized_teacher_access failed: ${authResp.status()} — ${await authResp.text()}`,
      );
    }
  }

  // Create a student section under the teacher.
  const csrfForSection = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const sectionResp = await page.request.post('/dashboardapi/sections', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfForSection ?? '',
    },
    data: {login_type: 'email', participant_type: 'student'},
  });
  if (!sectionResp.ok()) {
    throw new Error(
      `create section failed: ${sectionResp.status()} — ${await sectionResp.text()}`,
    );
  }
  const sectionCode = ((await sectionResp.json()) as {code: string}).code;

  // Create student and sign in as student.
  const studentTs = Date.now();
  const studentRand = Math.random().toString(36).slice(2, 8);
  const studentEmail = `student_${studentTs}_${studentRand}@test.xx`;
  const studentPassword = `StudentPass${studentTs}`;
  const studentDisplayName = studentName ?? `TestStudent${studentTs}`;

  await createTestUser(page, {
    user_type: 'student',
    email: studentEmail,
    password: studentPassword,
    password_confirmation: studentPassword,
    name: studentDisplayName,
    age: String(studentAge),
    sign_in_count: 2,
  });

  // Enroll student in the section.
  const csrfForJoin = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const joinResp = await page.request.post(`/join/${sectionCode}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfForJoin ?? '',
    },
  });
  if (!joinResp.ok()) {
    throw new Error(
      `join section failed: ${joinResp.status()} — ${await joinResp.text()}`,
    );
  }

  return {teacherEmail, teacherPassword, sectionCode};
}

/** Section identifiers returned by {@link createSection} and {@link createSectionWithCourse}. */
export interface SectionInfo {
  /** Teacher-shareable join code (e.g. "ABCDEF"). */
  sectionCode: string;
  /** Numeric section ID used in dashboard API URLs. */
  sectionId: number;
}

/**
 * Creates an empty student section for the currently signed-in teacher.
 * Mirrors `I create a new student section` from section_management_steps.rb.
 *
 * @param page - Playwright page whose context holds the teacher session
 * @returns section join code and numeric ID
 */
export async function createSection(page: Page): Promise<SectionInfo> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post('/dashboardapi/sections', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {login_type: 'email', participant_type: 'student'},
  });
  if (!resp.ok()) {
    throw new Error(
      `create section failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
  const json = (await resp.json()) as {code: string; id: number};
  return {sectionCode: json.code, sectionId: json.id};
}

/**
 * Creates a student section pre-assigned to a course unit for the currently
 * signed-in teacher (test-only API).
 * Mirrors `I create a new student section assigned to course X unit N`.
 *
 * @param page - Playwright page holding the teacher session
 * @param courseName - e.g. "allthethingscourse"
 * @param unitPosition - 1-based unit index
 * @returns section join code and numeric ID
 */
export async function createSectionWithCourse(
  page: Page,
  courseName: string,
  unitPosition: number,
): Promise<SectionInfo> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post(
    '/api/test/create_student_section_assigned_to_course_and_unit',
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
      data: {course_name: courseName, unit_position: unitPosition},
    },
  );
  if (!resp.ok()) {
    throw new Error(
      `create section with course failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
  const json = (await resp.json()) as {section_code: string; id: number};
  return {sectionCode: json.section_code, sectionId: json.id};
}

/**
 * Creates a levelbuilder account and signs in.
 * Mirrors `I create a levelbuilder named "..."` from levelbuilder_steps.rb:
 *   I create a teacher named "..." + I get levelbuilder access
 *   (POST /api/test/levelbuilder_access)
 */
export async function createLevelbuilder(page: Page): Promise<void> {
  await createTeacher(page);

  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  const response = await page.request.post('/api/test/levelbuilder_access', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
  });

  if (!response.ok()) {
    throw new Error(
      `levelbuilder_access failed: ${response.status()} — ${await response.text()}`,
    );
  }
}

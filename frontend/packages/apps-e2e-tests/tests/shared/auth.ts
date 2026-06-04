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
  given_name?: string;
  family_name?: string;
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
  /** EU data-transfer-agreement fields; set to suppress the GDPR dialog. */
  data_transfer_agreement_accepted?: boolean;
  /** @see data_transfer_agreement_accepted */
  data_transfer_agreement_request_ip?: string;
  /** @see data_transfer_agreement_accepted */
  data_transfer_agreement_kind?: string;
  /** @see data_transfer_agreement_accepted */
  data_transfer_agreement_source?: string;
  /** ISO-8601 string companion to {@link data_transfer_agreement_accepted}. */
  data_transfer_agreement_at?: string;
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
  let csrf: string | null = null;
  const csrfPages = ['/reset_session', '/users/sign_in'];
  for (let attempt = 1; attempt <= 3 && !csrf; attempt++) {
    for (const csrfPage of csrfPages) {
      await page.goto(csrfPage, {waitUntil: 'domcontentloaded'});
      const csrfToken = page.locator('meta[name="csrf-token"]');
      if ((await csrfToken.count()) > 0) {
        csrf = await csrfToken.getAttribute('content');
      }
      if (csrf) {
        break;
      }
    }
  }
  if (!csrf) {
    throw new Error('reset_session did not render a CSRF token');
  }

  let lastFailure = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await page.request.post('/api/test/create_user', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
      data: {user: payload},
    });

    if (response.ok()) {
      return;
    }

    lastFailure = `${response.status()} — ${await response.text()}`;
    if (response.status() < 500 || attempt === 3) {
      break;
    }
  }

  throw new Error(`create_user failed: ${lastFailure}`);
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
  givenName?: string;
  familyName?: string;
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
  {name, givenName, familyName}: CreateTeacherOptions = {},
): Promise<UserCredentials> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `teacher_${ts}_${rand}@test.xx`;
  const password = `TeacherPass${ts}`;
  // Space-separated, matching Cucumber's "TestTeacher " + SecureRandom.base64 pattern.
  // The server derives the username from the first word only ("TestTeacher"), keeping
  // it short enough to avoid generate_username column-width overflow.
  // The header (short_name) shows only the first word, so displayName returned here
  // is the first word — what the UI actually renders.
  const fullName = name ?? `TestTeacher ${rand}`;
  const displayName = fullName.split(' ')[0];

  await createTestUser(page, {
    user_type: 'teacher',
    email,
    password,
    password_confirmation: password,
    name: fullName,
    ...(givenName ? {given_name: givenName} : {}),
    ...(familyName ? {family_name: familyName} : {}),
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
 * @property us_state - US state code (e.g. 'CO'). Suppresses the
 *   school-info interstitial modal on first navigation. Required for young
 *   students (age < 13) that visit project-creation or other pages that
 *   trigger the "Finish creating your account" modal.
 */
interface CreateStudentOptions {
  age?: number;
  name?: string;
  us_state?: string;
  country_code?: string;
  data_transfer_agreement_accepted?: boolean;
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
  {
    age = 16,
    name,
    us_state,
    country_code,
    data_transfer_agreement_accepted,
  }: CreateStudentOptions = {},
): Promise<UserCredentials> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `student_${ts}_${rand}@test.xx`;
  const password = `StudentPass${ts}`;
  // Space-separated, matching Cucumber's "TestStudent " + SecureRandom.base64 pattern.
  // Server derives username from first word only; returned displayName is the short_name
  // (first word) that the UI header actually renders.
  const fullName = name ?? `TestStudent ${rand}`;
  const displayName = fullName.split(' ')[0];

  await createTestUser(page, {
    user_type: 'student',
    email,
    password,
    password_confirmation: password,
    name: fullName,
    age: String(age),
    sign_in_count: 2,
    ...(us_state ? {us_state, user_provided_us_state: true} : {}),
    ...(country_code ? {country_code} : {}),
    ...(data_transfer_agreement_accepted
      ? {
          data_transfer_agreement_accepted: true,
          data_transfer_agreement_request_ip: '127.0.0.1',
          data_transfer_agreement_kind: '0',
          data_transfer_agreement_source: 'ACCOUNT_SIGN_UP',
          data_transfer_agreement_at: new Date().toISOString(),
        }
      : {}),
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
  let lastFailure = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await page.request.get('/users/sign_out', {
      timeout: 30_000,
    });
    if (response.ok()) {
      return;
    }

    lastFailure = `${response.status()} — ${await response.text()}`;
    if (response.status() < 500 || attempt === 3) {
      break;
    }
  }

  throw new Error(`sign out failed: ${lastFailure}`);
}

/** Credentials returned by {@link createTeacherAssociatedStudent}. */
export interface TeacherStudentPair {
  /** Teacher's email address, used with {@link signIn} to switch sessions. */
  teacherEmail: string;
  /** Teacher's password. */
  teacherPassword: string;
  /** Student's email address, used with {@link signIn} to switch sessions. */
  studentEmail: string;
  /** Student's password. */
  studentPassword: string;
  /** Display name shown for the student in dashboard UI. */
  studentDisplayName: string;
  /** Section join code. */
  sectionCode: string;
  /** Numeric section ID used in dashboard URLs and APIs. */
  sectionId: number;
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
  let lastFailure = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/reset_session', {waitUntil: 'domcontentloaded'});
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

    if (response.ok()) {
      return;
    }

    lastFailure = `${response.status()} — ${await response.text()}`;
    if (response.status() < 500 && response.status() !== 422) {
      break;
    }
  }

  throw new Error(`sign_in failed: ${lastFailure}`);
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
  /** Student US state code (e.g. 'CO') for CAP and roster state tests. */
  studentUsState?: string;
  /** Student country code companion to {@link studentUsState}. */
  studentCountryCode?: string;
  /** ISO-8601 account creation time for CAP timing tests. */
  studentCreatedAt?: string;
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
    studentUsState,
    studentCountryCode,
    studentCreatedAt,
    authorized = false,
  }: CreateTeacherAssociatedStudentOptions = {},
): Promise<TeacherStudentPair> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const teacherEmail = `teacher_${ts}_${rand}@test.xx`;
  const teacherPassword = `TeacherPass${ts}`;
  // Space-separated, matching Cucumber's pattern; server uses first word for username.
  const teacherDisplayName = `TestTeacher ${rand}`;

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
    let lastAuthFailure = '';
    let authorizedTeacher = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const authResp = await page.request.post(
        '/api/test/authorized_teacher_access',
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfForAuth ?? '',
          },
        },
      );
      if (authResp.ok()) {
        authorizedTeacher = true;
        break;
      }

      lastAuthFailure = `${authResp.status()} — ${await authResp.text()}`;
      if (authResp.status() < 500 || attempt === 3) {
        break;
      }
    }
    if (!authorizedTeacher) {
      throw new Error(`authorized_teacher_access failed: ${lastAuthFailure}`);
    }
  }

  // Create a student section under the teacher.
  const csrfForSection = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  let sectionCode = '';
  let sectionId = 0;
  let lastSectionFailure = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const sectionResp = await page.request.post('/dashboardapi/sections', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfForSection ?? '',
      },
      data: {login_type: 'email', participant_type: 'student'},
    });
    if (sectionResp.ok()) {
      const sectionJson = (await sectionResp.json()) as {
        code: string;
        id: number;
      };
      sectionCode = sectionJson.code;
      sectionId = sectionJson.id;
      break;
    }

    lastSectionFailure = `${sectionResp.status()} — ${await sectionResp.text()}`;
    if (sectionResp.status() < 500 || attempt === 3) {
      break;
    }
  }
  if (!sectionCode || !sectionId) {
    throw new Error(`create section failed: ${lastSectionFailure}`);
  }

  // Create student and sign in as student.
  const studentTs = Date.now();
  const studentRand = Math.random().toString(36).slice(2, 8);
  const studentEmail = `student_${studentTs}_${studentRand}@test.xx`;
  const studentPassword = `StudentPass${studentTs}`;
  // Space-separated, matching Cucumber's pattern; server uses first word for username.
  const studentDisplayName = studentName ?? `TestStudent ${studentRand}`;

  await createTestUser(page, {
    user_type: 'student',
    email: studentEmail,
    password: studentPassword,
    password_confirmation: studentPassword,
    name: studentDisplayName,
    age: String(studentAge),
    sign_in_count: 2,
    ...(studentUsState
      ? {us_state: studentUsState, user_provided_us_state: true}
      : {}),
    ...(studentCountryCode ? {country_code: studentCountryCode} : {}),
    ...(studentCreatedAt ? {created_at: studentCreatedAt} : {}),
  });

  // Enroll student in the section.
  const csrfForJoin = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  let lastJoinFailure = '';
  let joinedSection = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const joinResp = await page.request.post(`/join/${sectionCode}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfForJoin ?? '',
      },
    });
    if (joinResp.ok()) {
      joinedSection = true;
      break;
    }

    lastJoinFailure = `${joinResp.status()} — ${await joinResp.text()}`;
    if (joinResp.status() < 500 || attempt === 3) {
      break;
    }
  }
  if (!joinedSection) {
    throw new Error(`join section failed: ${lastJoinFailure}`);
  }

  return {
    teacherEmail,
    teacherPassword,
    studentEmail,
    studentPassword,
    studentDisplayName,
    sectionCode,
    sectionId,
  };
}

/** Section identifiers returned by {@link createSection} and {@link createSectionWithCourse}. */
export interface SectionInfo {
  /** Teacher-shareable join code (e.g. "ABCDEF"). */
  sectionCode: string;
  /** Numeric section ID used in dashboard API URLs. */
  sectionId: number;
}

type TestRoleEndpoint =
  | 'universal_instructor_access'
  | 'plc_reviewer_access'
  | 'facilitator_access'
  | 'program_manager_access'
  | 'workshop_admin_access';

/**
 * POSTs a current-user role endpoint from TestController.
 *
 * @param page - Playwright page holding the signed-in teacher session
 * @param endpoint - test-only role endpoint name
 */
async function grantTestRole(
  page: Page,
  endpoint: TestRoleEndpoint,
): Promise<void> {
  await page.goto('/');
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post(`/api/test/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
  });
  if (!resp.ok()) {
    throw new Error(
      `${endpoint} failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
}

/**
 * Grants universal instructor access to the current user.
 * Mirrors `I get universal instructor access` from account_steps.rb.
 *
 * @param page - Playwright page holding the signed-in teacher session
 */
export async function grantUniversalInstructorAccess(
  page: Page,
): Promise<void> {
  await grantTestRole(page, 'universal_instructor_access');
}

/**
 * Grants PLC reviewer access to the current user.
 * Mirrors `I get plc reviewer access` from account_steps.rb.
 *
 * @param page - Playwright page holding the signed-in teacher session
 */
export async function grantPlcReviewerAccess(page: Page): Promise<void> {
  await grantTestRole(page, 'plc_reviewer_access');
}

/**
 * Grants facilitator access to the current user.
 * Mirrors `I get facilitator access` from pd.rb.
 *
 * @param page - Playwright page holding the signed-in teacher session
 */
export async function grantFacilitatorAccess(page: Page): Promise<void> {
  await grantTestRole(page, 'facilitator_access');
}

/**
 * Grants program manager access to the current user.
 * Mirrors `I get program manager access` from pd.rb.
 *
 * @param page - Playwright page holding the signed-in teacher session
 */
export async function grantProgramManagerAccess(page: Page): Promise<void> {
  await grantTestRole(page, 'program_manager_access');
}

/**
 * Grants workshop administrator access to the current user.
 * Mirrors `I make the teacher a workshop admin` from pd.rb.
 *
 * @param page - Playwright page holding the signed-in teacher session
 */
export async function grantWorkshopAdminAccess(page: Page): Promise<void> {
  await grantTestRole(page, 'workshop_admin_access');
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
 * Creates a professional-learning section for the currently signed-in teacher.
 * Mirrors `I create a new teacher/facilitator section and go home` from
 * section_management_steps.rb.
 *
 * @param page - Playwright page holding the teacher session
 * @param participantType - permitted participant audience for the section
 * @returns section join code and numeric ID
 */
export async function createProfessionalLearningSection(
  page: Page,
  participantType: 'teacher' | 'facilitator',
): Promise<SectionInfo> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post('/dashboardapi/sections', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {login_type: 'email', participant_type: participantType, grade: 'pl'},
  });
  if (!resp.ok()) {
    throw new Error(
      `create professional learning section failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
  const json = (await resp.json()) as {code: string; id: number};
  return {sectionCode: json.code, sectionId: json.id};
}

/**
 * Options for {@link createSectionWithCourse}.
 *
 * @property aiChatEnabled - when true, sets ai_chat_access_level: 'essential_only'
 *   on the section.  Mirrors `with AI chat enabled` in section_management_steps.rb.
 */
interface CreateSectionWithCourseOptions {
  aiChatEnabled?: boolean;
}

/**
 * Finds a section id for the current teacher by section code, falling back to
 * name for older test-controller responses that only include `section_code`.
 *
 * @param page - Playwright page holding the teacher session
 * @param sectionCode - join code returned by the create-section endpoint
 * @param sectionName - expected section name when code is absent from the list
 * @returns numeric section id
 */
async function findCurrentTeacherSectionId(
  page: Page,
  sectionCode: string,
  sectionName: string,
): Promise<number> {
  const resp = await page.request.get('/dashboardapi/sections');
  if (!resp.ok()) {
    throw new Error(
      `list sections failed: ${resp.status()} — ${await resp.text()}`,
    );
  }

  const sections = (await resp.json()) as Array<{
    id: number;
    code?: string;
    name: string;
  }>;
  const section =
    sections.find(s => s.code === sectionCode) ??
    sections.find(s => s.name === sectionName);
  if (!section) {
    throw new Error(`created section ${sectionCode} was not returned by API`);
  }

  return section.id;
}

/**
 * Sets AI Chat access for a teacher-owned section after creation.  This
 * mirrors the Cucumber `with AI chat enabled` option even when the test
 * controller computes the default access level from the course.
 *
 * @param page - Playwright page holding the teacher session
 * @param sectionId - numeric section id
 * @param accessLevel - section ai_chat_access_level value
 */
async function setSectionAiChatAccessLevel(
  page: Page,
  sectionId: number,
  accessLevel: 'essential_only',
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post(
    `/dashboardapi/sections/${sectionId}/ai_chat_access_level`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
      data: {ai_chat_access_level: accessLevel},
    },
  );
  if (!resp.ok()) {
    throw new Error(
      `set ai chat access failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
}

/**
 * Creates a student section pre-assigned to a course unit for the currently
 * signed-in teacher (test-only API).
 * Mirrors `I create a new student section assigned to course X unit N`.
 *
 * @param page - Playwright page holding the teacher session
 * @param courseName - e.g. "allthethingscourse"
 * @param unitPosition - 1-based unit index
 * @param options - optional flags; pass `{aiChatEnabled: true}` to enable AI chat
 * @returns section join code and numeric ID
 */
export async function createSectionWithCourse(
  page: Page,
  courseName: string,
  unitPosition: number,
  {aiChatEnabled = false}: CreateSectionWithCourseOptions = {},
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
      data: {
        course_name: courseName,
        unit_position: unitPosition,
        ...(aiChatEnabled ? {ai_chat_access_level: 'essential_only'} : {}),
      },
    },
  );
  if (!resp.ok()) {
    throw new Error(
      `create section with course failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
  const json = (await resp.json()) as {section_code: string; id?: number};
  const sectionId =
    json.id ??
    (await findCurrentTeacherSectionId(page, json.section_code, 'New Section'));
  if (aiChatEnabled) {
    await setSectionAiChatAccessLevel(page, sectionId, 'essential_only');
  }
  return {sectionCode: json.section_code, sectionId};
}

/**
 * Creates a teacher with authorized-teacher access and signs in.
 * Mirrors `I create a teacher named "..." + I give user "..." authorized teacher permission`
 * from account_steps.rb: create_user(teacher) + POST /api/test/authorized_teacher_access.
 *
 * @returns email, password, and display name for the new teacher account
 */
export async function createAuthorizedTeacher(
  page: Page,
): Promise<UserCredentials> {
  const credentials = await createTeacher(page);

  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  const resp = await page.request.post('/api/test/authorized_teacher_access', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
  });

  if (!resp.ok()) {
    throw new Error(
      `authorized_teacher_access failed: ${resp.status()} — ${await resp.text()}`,
    );
  }

  return credentials;
}

/**
 * Enrolls the currently signed-in student into a section by join code.
 * Mirrors `I join the section` from section_management_steps.rb
 * (uses direct POST rather than navigating the join UI).
 *
 * @param page - Playwright page holding the student session
 * @param sectionCode - section join code returned by {@link createSectionWithCourse}
 */
export async function joinSection(
  page: Page,
  sectionCode: string,
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  let lastFailure = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const resp = await page.request.post(`/join/${sectionCode}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
    });
    if (resp.ok()) {
      return;
    }

    lastFailure = `${resp.status()} — ${await resp.text()}`;
    if (resp.status() < 500 || attempt === 3) {
      break;
    }
  }

  throw new Error(`join section failed: ${lastFailure}`);
}

/**
 * Assigns the currently signed-in student to a course unit via the test-only
 * /api/test/assign_course_and_unit_as_student endpoint.
 * Mirrors `I am assigned to course "X" unit N` from steps.rb.
 *
 * @param page - Playwright page holding the student session
 * @param courseName - e.g. "ui-test-versioned-script-2017"
 * @param unitPosition - 1-based unit index
 */
export async function assignCourseAndUnit(
  page: Page,
  courseName: string,
  unitPosition: number,
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post(
    '/api/test/assign_course_and_unit_as_student',
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
      `assign_course_and_unit_as_student failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
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

/**
 * Grants levelbuilder access to the currently signed-in user without creating
 * a new account.  Mirrors `I get levelbuilder access` from
 * levelbuilder_steps.rb (POST /api/test/levelbuilder_access) when an existing
 * teacher session is already active.
 *
 * @param page - Playwright page holding an active teacher session
 */
export async function getLevelbuilderAccess(page: Page): Promise<void> {
  await page.goto('/');
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post('/api/test/levelbuilder_access', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
  });
  if (!resp.ok()) {
    throw new Error(
      `levelbuilder_access failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
}

/**
 * Adds the currently signed-in user to a named single-user experiment.
 * Mirrors `I add the current user to "X" single user experiment` from
 * experiment_steps.rb (POST /api/test/set_single_user_experiment).
 *
 * @param page - Playwright page holding an active session
 * @param experimentName - name of the experiment to enroll in
 */
export async function addUserToExperiment(
  page: Page,
  experimentName: string,
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const resp = await page.request.post('/api/test/set_single_user_experiment', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {experiment_name: experimentName},
  });
  if (!resp.ok()) {
    throw new Error(
      `set_single_user_experiment failed: ${resp.status()} — ${await resp.text()}`,
    );
  }
}

/**
 * Options for {@link assignCourseAsStudent}.
 *
 * @property teacherEmail - email of the teacher whose section to create under.
 *   If omitted the endpoint creates a throwaway teacher account.
 * @property sectionName - name for the new section.  Defaults to "New Section".
 */
export interface AssignCourseAsStudentOptions {
  teacherEmail?: string;
  sectionName?: string;
}

/**
 * Creates a section under the given teacher and enrolls the currently
 * signed-in student in it.
 * Mirrors `I am assigned to course "X" with teacher "Y" in a section named "Z"`
 * from steps.rb (POST /api/test/assign_course_as_student).
 *
 * @param page - Playwright page holding an active student session
 * @param courseName - slug of the course to assign (e.g. "allthethingscourse")
 * @param options - optional teacher email and section name
 */
export async function assignCourseAsStudent(
  page: Page,
  courseName: string,
  {teacherEmail, sectionName}: AssignCourseAsStudentOptions = {},
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  let lastFailure = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const resp = await page.request.post('/api/test/assign_course_as_student', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
      data: {
        course_name: courseName,
        ...(teacherEmail ? {teacher_email: teacherEmail} : {}),
        ...(sectionName ? {section_name: sectionName} : {}),
      },
    });
    if (resp.ok()) {
      return;
    }

    lastFailure = `${resp.status()} — ${await resp.text()}`;
    if (resp.status() < 500 || attempt === 3) {
      break;
    }
  }

  throw new Error(`assign_course_as_student failed: ${lastFailure}`);
}

/**
 * Assigns the currently signed-in teacher's section (0-based index) to a
 * course and unit via /api/test/assign_section_to_course_and_unit.
 * Mirrors `I assign my section in row N to course "X" unit Y` from steps.rb.
 *
 * The controller indexes into teacher.sections via `section_position - 1`, so
 * passing 0 here selects `sections[-1]` (last/only section in Ruby semantics).
 * For teachers with exactly one section, 0 is always the right value.
 *
 * @param page - Playwright page holding an active teacher session
 * @param sectionPosition - 0-based index (0 = first/only section)
 * @param courseName - slug of the course to assign
 * @param unitPosition - 1-based unit number within the course
 */
export async function assignSectionToCourseAndUnit(
  page: Page,
  sectionPosition: number,
  courseName: string,
  unitPosition: number,
): Promise<void> {
  await page.goto('/teacher_dashboard/home');
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  let lastFailure = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const resp = await page.request.post(
      '/api/test/assign_section_to_course_and_unit',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf ?? '',
        },
        data: {
          section_position: sectionPosition,
          course_name: courseName,
          unit_position: unitPosition,
        },
      },
    );
    if (resp.ok()) {
      return;
    }

    lastFailure = `${resp.status()} — ${await resp.text()}`;
    if (resp.status() < 500 || attempt === 3) {
      break;
    }
  }

  throw new Error(`assign_section_to_course_and_unit failed: ${lastFailure}`);
}

/**
 * Options for {@link createEuStudent}.
 *
 * @property name - display name; auto-generated if omitted.
 */
interface CreateEuStudentOptions {
  name?: string;
}

/**
 * Creates a student account pre-populated with EU data-transfer-agreement
 * fields accepted at sign-up.  This suppresses the GDPR dialog on all
 * subsequent page visits for that account.
 * Mirrors `I create a student in the eu named "..."` from account_steps.rb.
 *
 * @returns email, password, and display name for the new student account
 */
export async function createEuStudent(
  page: Page,
  {name}: CreateEuStudentOptions = {},
): Promise<UserCredentials> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `eu_student_${ts}_${rand}@test.xx`;
  const password = `StudentPass${ts}`;
  // Space-separated, matching Cucumber's pattern; returned displayName is first word
  // (the short_name the UI header renders).
  const fullName = name ?? `TestEuStudent ${rand}`;
  const displayName = fullName.split(' ')[0];

  await createTestUser(page, {
    user_type: 'student',
    email,
    password,
    password_confirmation: password,
    name: fullName,
    age: '16',
    sign_in_count: 2,
    data_transfer_agreement_accepted: true,
    data_transfer_agreement_request_ip: '127.0.0.1',
    data_transfer_agreement_kind: '0',
    data_transfer_agreement_source: 'ACCOUNT_SIGN_UP',
    data_transfer_agreement_at: new Date().toISOString(),
  });
  return {email, password, displayName};
}

import {type Page} from '@playwright/test';

/**
 * Creates a teacher account and signs in via the test-only
 * /api/test/create_user endpoint (available in rack_env :test only).
 *
 * Navigates to /reset_session first to get a fresh CSRF token, then POSTs
 * from the same browser context so the resulting session cookie is stored
 * in-place. After this call the page is authenticated as the new teacher.
 */
export async function createTeacher(page: Page): Promise<void> {
  await page.goto('/reset_session');
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `teacher_${ts}_${rand}@test.xx`;
  const password = `TeacherPass${ts}`;

  const response = await page.request.post('/api/test/create_user', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {
      user: {
        user_type: 'teacher',
        email,
        password,
        password_confirmation: password,
        name: `TestTeacher${ts}`,
        age: '21+',
        terms_of_service_version: '1',
        sign_in_count: 2,
        email_preference_opt_in: 'yes',
        email_preference_form_kind: email,
        email_preference_request_ip: '127.0.0.1',
        email_preference_source: 'ACCOUNT_SIGN_UP',
      },
    },
  });

  if (!response.ok()) {
    throw new Error(
      `create_user failed: ${response.status()} — ${await response.text()}`,
    );
  }
}

/**
 * Options for {@link createStudent}.
 *
 * @property age - student age; defaults to 16. Pass a value < 13 for
 *   under-13 behaviour (age-restriction redirects, song-filter enforcement).
 */
interface CreateStudentOptions {
  age?: number;
}

/**
 * Creates a student account and signs in.
 * Mirrors `I create a student named "..."` / `I create a young student named "..."`
 * from account_steps.rb: create_user(name, user_type: 'student', age:, sign_in_count: 2)
 */
export async function createStudent(
  page: Page,
  {age = 16}: CreateStudentOptions = {},
): Promise<void> {
  await page.goto('/reset_session');
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `student_${ts}_${rand}@test.xx`;
  const password = `StudentPass${ts}`;

  const response = await page.request.post('/api/test/create_user', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {
      user: {
        user_type: 'student',
        email,
        password,
        password_confirmation: password,
        name: `TestStudent${ts}`,
        age: String(age),
        sign_in_count: 2,
      },
    },
  });

  if (!response.ok()) {
    throw new Error(
      `create_user (student) failed: ${response.status()} — ${await response.text()}`,
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

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
  const email = `teacher_${ts}@test.xx`;
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

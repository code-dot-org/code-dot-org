import {test, expect} from '@playwright/test';

import {docsScreenshot} from './helpers';

test('LTI integration registration form loads and has correct labels', async ({
  page,
}) => {
  await page.goto('/lti/v1/integrations/new');

  // The registration form should be visible.
  const form = page.locator('.lti-integration-form');
  await expect(form).toBeVisible({timeout: 10000});

  // Assert the field labels the docs name.
  await expect(form.getByText('School or district name')).toBeVisible();
  await expect(form.getByText('LMS Client ID')).toBeVisible();
  await expect(form.getByText('Your email')).toBeVisible();
  await expect(form.getByText('What LMS are you using?')).toBeVisible();

  // Assert the submit button label.
  await expect(form.getByRole('button', {name: 'Register LMS'})).toBeVisible();

  // Assert the LMS dropdown options.
  const select = form.locator('select');
  const options = await select.locator('option').allTextContents();
  const lmsOptions = options.filter(t => t.trim() !== '');
  expect(lmsOptions).toEqual(
    expect.arrayContaining([
      'Canvas',
      'Canvas - Beta',
      'Canvas - Test',
      'Schoology',
    ]),
  );

  await docsScreenshot(
    page,
    'guide/integrations/connect-your-lms.md',
    'registration-form',
    {locator: form},
  );
});

test('LTI registration form is accessible without sign-in', async ({page}) => {
  // Clear all cookies to confirm no auth is needed.
  await page.context().clearCookies();
  await page.goto('/lti/v1/integrations/new');

  const form = page.locator('.lti-integration-form');
  await expect(form).toBeVisible({timeout: 10000});
});

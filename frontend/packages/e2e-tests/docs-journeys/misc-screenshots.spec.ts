import {test, expect} from '@playwright/test';

import {createUser} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

test('account type chooser on sign-up page', async ({page}) => {
  await page.goto('/users/sign_up/account_type');

  const studentCard = page.getByTestId('student-card');
  await expect(studentCard).toBeVisible({timeout: 10000});

  const cardContainer = studentCard.locator('..');
  await docsScreenshot(
    page,
    'guide/getting-started/create-an-account.md',
    'account-type-chooser',
    {locator: cardContainer},
  );
});

test('manage-your-settings: viewport orientation and form sections', async ({
  page,
}) => {
  await page.goto('/');
  // Use a realistic teacher name instead of a robotic test name.
  await createUser(page, {
    type: 'teacher',
    name: 'Maria Santos',
    extraFields: {given_name: 'Maria', family_name: 'Santos'},
  });

  await page.goto('/users/edit');
  await expect(page.locator('#account-information')).toBeVisible({
    timeout: 20_000,
  });

  // Viewport orientation image.
  await docsScreenshot(
    page,
    'guide/getting-started/account-settings.md',
    'settings',
  );

  // Crop: account information section.
  await docsScreenshot(
    page,
    'guide/getting-started/account-settings.md',
    'account-info',
    {
      locator: page.locator('#account-information'),
    },
  );

  // Crop: school information section.
  const schoolInfo = page.locator('#school-information');
  await expect(schoolInfo).toBeVisible({timeout: 10_000});
  await docsScreenshot(
    page,
    'guide/getting-started/account-settings.md',
    'school-info',
    {
      locator: schoolInfo,
    },
  );
});

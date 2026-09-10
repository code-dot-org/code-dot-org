import {test, expect} from '@playwright/test';

import {docsScreenshot} from './helpers';

test('student account creation flow loads', async ({page}) => {
  await page.goto('/users/sign_up/account_type');

  // Account type chooser shows both cards.
  const studentCard = page.getByTestId('student-card');
  await expect(studentCard).toBeVisible();
  const teacherCard = page.getByTestId('teacher-card');
  await expect(teacherCard).toBeVisible();

  // Crop to the card chooser area.
  await docsScreenshot(
    page,
    'guide/getting-started/create-an-account.md',
    'account-type-chooser',
    {
      locator: studentCard.locator('..'),
    },
  );

  // Assert labels the docs name.
  await expect(studentCard).toContainText("I'm a Student");

  // Click student card.
  await studentCard.getByRole('button').click();
  await page.waitForURL('**/sign_up/**', {waitUntil: 'domcontentloaded'});

  // The student sign-up form should have email and password fields.
  await expect(page.locator('#uitest-email')).toBeVisible({timeout: 10000});
});

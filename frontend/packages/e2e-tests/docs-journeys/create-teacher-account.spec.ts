import {test, expect} from '@playwright/test';

test('teacher account creation flow loads', async ({page}) => {
  await page.goto('/users/sign_up/account_type');

  const teacherCard = page.getByTestId('teacher-card');
  await expect(teacherCard).toBeVisible();

  // Click teacher card.
  await teacherCard.getByRole('button').click();
  await page.waitForURL('**/sign_up/**', {waitUntil: 'domcontentloaded'});

  // The teacher sign-up form should have email and password fields.
  await expect(page.locator('#uitest-email')).toBeVisible({timeout: 10000});
});

import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

test('teacher creates a section and receives a join code', async ({page}) => {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'DocsTeacher'});
  await page.goto('/');

  const resp = await requestWithCsrf(page, 'POST', '/dashboardapi/sections', {
    login_type: 'email',
    participant_type: 'student',
    grades: ['3'],
  });
  expect(resp.ok).toBe(true);

  const section = JSON.parse(resp.body) as {code: string; id: number};
  expect(section.code).toMatch(/^[A-Z]{6}$/);
  expect(section.id).toBeGreaterThan(0);
});

test('docs label: home page shows "New class section" button', async ({
  page,
}) => {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'LabelTeacher'});
  await page.goto('/');

  const button = page.getByRole('button', {name: /new class section/i});
  await expect(button).toBeVisible({timeout: 20_000});

  await docsScreenshot(
    page,
    'guide/sections/create-a-section.md',
    'new-class-section-button',
    {locator: button},
  );
});

test('docs label: login type picker shows correct card titles', async ({
  page,
}) => {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'LoginTypeTeacher'});
  await page.goto('/');

  const newSectionBtn = page.getByRole('button', {
    name: /new class section/i,
  });
  await expect(newSectionBtn).toBeVisible({timeout: 20_000});
  await newSectionBtn.click();

  // Wait for the login type picker dialog.
  const pictureCard = page.locator('.uitest-pictureLogin');
  await expect(pictureCard).toBeVisible({timeout: 10_000});

  // Assert the card titles match what the docs say.
  await expect(pictureCard).toContainText('Picture password');
  const wordCard = page.locator('.uitest-wordLogin');
  await expect(wordCard).toContainText('Secret words');
  const emailCard = page.locator('.uitest-emailLogin');
  await expect(emailCard).toContainText('Personal logins');

  // Crop the login type cards for the choose-a-login-type page.
  const cardContainer = pictureCard.locator('..').locator('..');
  await docsScreenshot(
    page,
    'guide/sections/choose-a-login-type.md',
    'login-type-picker',
    {locator: cardContainer},
  );
});

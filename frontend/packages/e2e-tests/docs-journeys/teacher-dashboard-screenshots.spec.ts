import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

test('add-a-co-teacher: co-teacher section in settings', async ({page}) => {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'Ms. Rivera'});

  const sectionResp = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {
      login_type: 'word',
      participant_type: 'student',
      name: 'Period 2 - Intro CS',
      grades: ['6'],
    },
  );
  expect(sectionResp.ok).toBe(true);
  const section = JSON.parse(sectionResp.body) as {id: number; code: string};

  // Navigate to teacher dashboard, then click Settings in sidebar.
  await page.goto(`/teacher_dashboard/sections/${section.id}/progress`);
  await expect(
    page.getByRole('heading', {name: 'Progress', exact: true}).first(),
  ).toBeVisible({timeout: 20_000});

  const settingsLink = page.locator('a').filter({hasText: /^Settings$/});
  await settingsLink.click();
  await page.waitForTimeout(3000);

  // Scroll to the Add Co-Teachers section.
  const coTeacherHeading = page.locator('text=Add Co-Teachers').first();
  await expect(coTeacherHeading).toBeVisible({timeout: 20_000});
  await coTeacherHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const coTeacherContainer = coTeacherHeading.locator('..').locator('..');
  await docsScreenshot(
    page,
    'guide/sections/add-a-co-teacher.md',
    'co-teacher-settings',
    {
      locator: coTeacherContainer,
    },
  );
});

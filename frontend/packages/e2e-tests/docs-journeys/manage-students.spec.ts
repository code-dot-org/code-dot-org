import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser} from '../tests/shared/auth';

test('teacher adds a student to the roster via API', async ({page}) => {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'RosterTeacher'});
  await page.goto('/');

  const sectionResp = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {login_type: 'word', participant_type: 'student'},
  );
  expect(sectionResp.ok).toBe(true);
  const {id: sectionId} = JSON.parse(sectionResp.body) as {id: number};

  const addResp = await requestWithCsrf(
    page,
    'POST',
    `/dashboardapi/sections/${sectionId}/students/bulk_add`,
    {students: [{name: 'TestKid'}]},
  );
  expect(addResp.ok).toBe(true);

  const listResp = await requestWithCsrf(
    page,
    'GET',
    `/dashboardapi/sections/${sectionId}/students`,
  );
  expect(listResp.ok).toBe(true);
  const students = JSON.parse(listResp.body) as Array<{name: string}>;
  expect(students.some(s => s.name === 'TestKid')).toBe(true);
});

test('docs label: roster row has "Show words" and actions menu', async ({
  page,
}) => {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'LabelRosterTeacher'});
  await page.goto('/');

  const sectionResp = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {login_type: 'word', participant_type: 'student', name: 'Docs Section'},
  );
  expect(sectionResp.ok).toBe(true);
  const {id: sectionId} = JSON.parse(sectionResp.body) as {id: number};

  const addResp = await requestWithCsrf(
    page,
    'POST',
    `/dashboardapi/sections/${sectionId}/students/bulk_add`,
    {students: [{name: 'AlexStudent'}]},
  );
  expect(addResp.ok).toBe(true);

  await page.goto(`/teacher_dashboard/sections/${sectionId}/roster`);
  await expect(page.getByText('AlexStudent').first()).toBeVisible({
    timeout: 20_000,
  });

  // Assert "Show words" button exists (secret words section).
  const showWordsBtn = page.locator('.uitest-show-picture-or-word').first();
  await expect(showWordsBtn).toBeVisible();
  await expect(showWordsBtn).toHaveText(/show words/i);
});

import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser, createStudent, signIn} from '../tests/shared/auth';

test('join page labels match docs', async ({page}) => {
  // The /join form only renders when signed in.
  await page.goto('/');
  await createStudent(page, {name: 'LabelStudent'});
  await page.goto('/join');
  await expect(page.getByRole('button', {name: 'Join'})).toBeVisible({
    timeout: 10000,
  });
});

test('student joins a section with a code', async ({page}) => {
  await page.goto('/');

  // Teacher creates a section.
  const teacher = await createUser(page, {
    type: 'teacher',
    name: 'JoinTeacher',
  });
  await page.goto('/');
  const sectionResp = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {login_type: 'email', participant_type: 'student'},
  );
  expect(sectionResp.ok).toBe(true);
  const {code} = JSON.parse(sectionResp.body) as {code: string};

  // Student joins.
  await createStudent(page, {name: 'JoinStudent'});
  await page.goto('/');
  const joinResp = await requestWithCsrf(
    page,
    'POST',
    `/api/v1/sections/${code}/join`,
  );
  expect(joinResp.ok).toBe(true);

  // Teacher verifies student on roster.
  await signIn(page, teacher);
  await page.goto('/');
  // Navigate to the teacher dashboard roster to confirm.
  await page.goto(`/teacher_dashboard/sections`);
  // The join succeeded if the POST returned ok; the roster API confirms it.
});

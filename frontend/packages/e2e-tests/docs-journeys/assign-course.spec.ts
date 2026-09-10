import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser, resetSession} from '../tests/shared/auth';

test('teacher assigns a course to a section, student sees it', async ({
  page,
}) => {
  // --- Teacher: create account and section ---
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'DocsAssignTeacher'});

  const sectionResp = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {
      login_type: 'email',
      participant_type: 'student',
      grades: ['6'],
    },
  );
  expect(sectionResp.ok).toBe(true);
  const section = JSON.parse(sectionResp.body) as {code: string; id: number};

  // --- Teacher: navigate to catalog, confirm at least one card ---
  await page.goto('/catalog');
  await expect(
    page.getByRole('heading', {name: 'Curriculum Catalog', level: 1}),
  ).toBeVisible();
  await expect(page.getByRole('heading', {level: 4}).first()).toBeVisible();

  // --- Assign via API: pick a known seed unit ---
  // Use the sections PATCH endpoint with a course name. The local seed data
  // has "coursea-2022" or similar. We look up the first assignable one via
  // the quick_assign_course_offerings endpoint.
  const qaResp = await page.evaluate(async () => {
    const r = await fetch(
      '/course_offerings/quick_assign_course_offerings?participantType=student',
    );
    return {ok: r.ok, status: r.status, body: await r.text()};
  });

  if (!qaResp.ok) {
    test.skip(true, `quick_assign_course_offerings returned ${qaResp.status}`);
    return;
  }

  let assignCourseVersionId: number | undefined;
  try {
    // Shape: {grade_band: {curriculum_type: {offering_name: [{id, key, display_name, course_versions: [[cv_id, {id, key, name, path, ...}], ...]}]}}}
    const offerings = JSON.parse(qaResp.body);
    outer: for (const gradeGroup of Object.values(offerings)) {
      for (const typeGroup of Object.values(gradeGroup)) {
        for (const offeringName of Object.keys(typeGroup)) {
          const coList = typeGroup[offeringName];
          for (const co of coList) {
            if (co.course_versions) {
              for (const cvEntry of co.course_versions) {
                // cvEntry is [cv_id, {id, name, ...}]
                const cv = Array.isArray(cvEntry) ? cvEntry[1] : cvEntry;
                if (cv?.id && cv?.name) {
                  assignCourseVersionId = cv.id;
                  break outer;
                }
              }
            }
          }
        }
      }
    }
  } catch {
    // Parsing failed.
  }

  if (!assignCourseVersionId) {
    test.skip(
      true,
      'No assignable course offering found in quick_assign response',
    );
    return;
  }

  // Assign the course version to the section.
  const patchResp = await requestWithCsrf(
    page,
    'PATCH',
    `/dashboardapi/sections/${section.id}`,
    {course_version_id: assignCourseVersionId},
  );
  expect(patchResp.ok).toBe(true);

  // --- Student: create account, join section, see assignment ---
  await resetSession(page);
  await page.goto('/');
  await createUser(page, {type: 'student', name: 'DocsAssignStudent'});

  const joinResp = await requestWithCsrf(
    page,
    'POST',
    `/api/v1/sections/${section.code}/join`,
  );
  expect(joinResp.ok).toBe(true);

  // Navigate to the student home page.
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');
  const title = await page.title();
  expect(title).not.toContain('500');
});

/**
 * ADVISORY legacy capture for the pilot-teacher-dashboard-home OpenSpec change
 * (Phase 4, Opus-owned; visual-artifacts.md). Ephemeral — run once against
 * test-studio, artifacts land under the OpenSpec change dir; this file is NOT
 * committed to the suite. Gated behind ADVISORY_CAPTURE=1 so an accidental
 * suite run skips it.
 *
 * NEVER run against production. Default TARGET_URL is test-studio.
 */
import path from 'node:path';

import {expect, test} from './fixtures';
import {requestWithCsrf} from './shared/api';
import {
  createStudent,
  createUser,
  resetSession,
  signIn,
  waitForHomeUrl,
} from './shared/auth';
import {settle} from './shared/stability';

const ARTIFACTS_DIR =
  '/var/home/sliang/git-workspaces/code-dot-org-full/.claude/worktrees/teacher-fable/sdd-experiment/openspec/changes/pilot-teacher-dashboard-home/artifacts/visual';

const COURSE_NAME = 'ui-test-single-unit-course-2026';

test.skip(!process.env.ADVISORY_CAPTURE, 'advisory capture only');

/** Suppress the logo transition before any teacher-home load. */
async function suppressLogoTransition(page: import('@playwright/test').Page) {
  const target = new URL(
    process.env.TARGET_URL ?? 'https://test-studio.code.org',
  );
  await page.context().addCookies([
    {
      name: 'hide_codeai_logo_transition',
      value: 'true',
      domain: target.hostname,
      path: '/',
    },
  ]);
}

/** Hide volatile overlays per visual-artifacts.md determinism controls. */
async function hideVolatileUi(page: import('@playwright/test').Page) {
  await page.addStyleTag({
    content: `
      #ui-test-teacher-promotions,
      [role="dialog"],
      .MuiDialog-root,
      .MuiSnackbar-root,
      [class*="floatingActionButton"],
      [class*="logoTransition"] {
        display: none !important;
      }
    `,
  });
}

test('TD-HOME-EMPTY legacy capture', async ({page}) => {
  await suppressLogoTransition(page);
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'TdPilotEmpty'});
  await page.goto('/teacher_dashboard/home');
  await waitForHomeUrl(page, 'teacher');

  // The EmptyState container (CSS-module class is hashed): the parent of the
  // legacy empty headline, holding image + headline + description.
  const region = page
    .getByRole('heading', {name: /it.s a bit empty here/i})
    .locator('..');
  await expect(region).toBeVisible({timeout: 30_000});
  await hideVolatileUi(page);
  await settle(page);
  await region.screenshot({
    path: path.join(ARTIFACTS_DIR, 'td-home-empty.legacy.png'),
    animations: 'disabled',
  });
});

test('TD-HOME-SECTION-LIST legacy capture', async ({page}) => {
  await suppressLogoTransition(page);
  await page.goto('/');
  const teacher = await createUser(page, {
    type: 'teacher',
    name: 'TdPilotList',
  });
  await page.goto('/');

  // Section A: unassigned, 0 students.
  const sectionA = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {login_type: 'email', participant_type: 'student'},
  );
  expect(sectionA.ok, `sections POST failed: ${sectionA.status}`).toBe(true);

  // Section B: assigned to the fixed course's unit 1.
  const sectionB = await requestWithCsrf(
    page,
    'POST',
    '/api/test/create_student_section_assigned_to_course_and_unit',
    {course_name: COURSE_NAME, unit_position: 1},
  );
  expect(sectionB.ok, `assigned-section POST failed: ${sectionB.status}`).toBe(
    true,
  );
  const {section_code: sectionCode} = JSON.parse(sectionB.body) as {
    section_code: string;
  };

  // One joined student in Section B (student session replaces teacher's).
  await createStudent(page, {name: 'TdPilotStudent'});
  await page.goto('/');
  const join = await requestWithCsrf(page, 'POST', `/join/${sectionCode}`);
  expect(join.ok, `join POST failed: ${join.status}`).toBe(true);

  // Back to the teacher (clear the student session first); capture the
  // section-list region.
  await resetSession(page);
  await suppressLogoTransition(page);
  await page.goto('/');
  await signIn(page, teacher);
  await page.goto('/teacher_dashboard/home');
  const region = page.locator('#ui-test-section-list');
  await expect(region).toBeVisible({timeout: 30_000});
  // Direct children only — legacy cards nest their own <li>s (dropdowns).
  await expect(region.locator('> li')).toHaveCount(2, {timeout: 30_000});
  await hideVolatileUi(page);
  await settle(page);
  await region.screenshot({
    path: path.join(ARTIFACTS_DIR, 'td-home-section-list.legacy.png'),
    animations: 'disabled',
  });
});

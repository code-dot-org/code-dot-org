import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {
  createUser,
  createStudent,
  signIn,
  resetSession,
  type UserCredentials,
} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

/**
 * Shared seeded state: one teacher, one section with four students enrolled
 * and csd-2024 assigned. Built once in beforeAll; individual tests take
 * screenshots. The progress grid shows student rows with lesson columns;
 * levels are not started (a freshly started class), which is realistic.
 */
interface SeededState {
  teacher: UserCredentials;
  sectionId: number;
  sectionCode: string;
}

const STUDENT_NAMES = ['Sam Rivera', 'Priya Patel', 'Jordan Lee', 'Alex Kim'];

test.describe('Seeded progress screenshots', () => {
  let state: SeededState;

  test.beforeAll(async ({browser}) => {
    const page = await browser.newPage();
    await page.goto('/');

    // Create teacher.
    const teacher = await createUser(page, {
      type: 'teacher',
      name: 'Ms. Chen',
    });
    await page.goto('/');

    // Create section with email login type and a realistic name.
    const sectionResp = await requestWithCsrf(
      page,
      'POST',
      '/dashboardapi/sections',
      {
        login_type: 'email',
        participant_type: 'student',
        name: 'Period 3 - CS Discoveries',
        grades: ['7', '8'],
      },
    );
    expect(sectionResp.ok).toBe(true);
    const {id: sectionId, code: sectionCode} = JSON.parse(sectionResp.body) as {
      id: number;
      code: string;
    };

    // Assign csd-2024 unit 1 to the section via the test API.
    const assignResp = await requestWithCsrf(
      page,
      'POST',
      '/api/test/assign_section_to_course_and_unit',
      {course_name: 'csd-2024', unit_position: 1, section_position: 1},
    );
    expect(assignResp.ok).toBe(true);

    // Create and enroll four students.
    for (const name of STUDENT_NAMES) {
      await resetSession(page);
      await page.goto('/');

      await createStudent(page, {name});
      await page.goto('/');

      const joinResp = await requestWithCsrf(
        page,
        'POST',
        `/api/v1/sections/${sectionCode}/join`,
      );
      expect(joinResp.ok).toBe(true);
    }

    state = {teacher, sectionId, sectionCode};
    await page.close();
  });

  test('tracking-progress: progress grid with student data', async ({page}) => {
    await page.goto('/');
    await signIn(page, state.teacher);

    await page.goto(`/teacher_dashboard/sections/${state.sectionId}/progress`);

    // Wait for student names to appear in the progress grid.
    await expect(page.getByText('Sam Rivera').first()).toBeVisible({
      timeout: 30_000,
    });

    // Viewport orientation: the progress tab with real student rows.
    await docsScreenshot(
      page,
      'guide/progress/tracking-progress.md',
      'progress',
    );

    // Crop: sidebar navigation.
    const sidebar = page.locator('#ui-test-teacher-sidebar');
    await expect(sidebar).toBeVisible({timeout: 10_000});
    await docsScreenshot(
      page,
      'guide/progress/tracking-progress.md',
      'sidebar-tabs',
      {locator: sidebar},
    );
  });

  test('your-home-page: section card with course and students', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.teacher);

    // Dismiss the rebrand banner and logo transition before loading the home page.
    await page.evaluate(() => {
      try {
        localStorage.setItem('2026-codeai-rebrand-banner', 'false');
      } catch {
        /* localStorage may be unavailable (e.g. blocked in this context). */
      }
      document.cookie =
        'hide_codeai_logo_transition=true; path=/; max-age=86400';
    });

    await page.goto('/home');

    // Wait for and dismiss the rebrand banner if it rendered before localStorage took effect.
    const rebrandBanner = page.locator('#rebrand-announcement-banner');
    if (await rebrandBanner.isVisible({timeout: 2000}).catch(() => false)) {
      const closeBtn = rebrandBanner.locator('button[aria-label*="close"]');
      if (await closeBtn.isVisible({timeout: 1000}).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    }

    await expect(
      page.getByText('Period 3 - CS Discoveries').first(),
    ).toBeVisible({timeout: 20_000});

    // Viewport orientation.
    await docsScreenshot(
      page,
      'guide/getting-started/your-home-page.md',
      'home',
    );

    // Crop: section cards area.
    const sectionList = page.locator('#ui-test-section-list');
    await expect(sectionList).toBeVisible({timeout: 10_000});
    await docsScreenshot(
      page,
      'guide/getting-started/your-home-page.md',
      'section-cards',
      {
        locator: sectionList,
      },
    );

    // Crop: New class section button.
    const createBtn = page.locator('#create-section-button');
    await expect(createBtn).toBeVisible({timeout: 10_000});
    await docsScreenshot(
      page,
      'guide/getting-started/your-home-page.md',
      'new-class-section',
      {locator: createBtn},
    );
  });

  test('managing-your-roster: roster with multiple students', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.goto(`/teacher_dashboard/sections/${state.sectionId}/roster`);

    await expect(page.getByText('Sam Rivera').first()).toBeVisible({
      timeout: 20_000,
    });

    // Viewport orientation: full roster page.
    await docsScreenshot(
      page,
      'guide/sections/managing-your-roster.md',
      'roster',
    );

    // Crop: a single student row.
    const samRow = page.locator('tr', {hasText: 'Sam Rivera'}).first();
    await expect(samRow).toBeVisible({timeout: 10_000});
    await docsScreenshot(
      page,
      'guide/sections/managing-your-roster.md',
      'roster-row-controls',
      {locator: samRow},
    );
  });

  test('edit-section-settings: settings form with realistic data', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.teacher);

    // Navigate to the teacher dashboard then click Settings in the sidebar.
    await page.goto(`/teacher_dashboard/sections/${state.sectionId}/progress`);
    await expect(
      page.getByRole('heading', {name: 'Progress', exact: true}).first(),
    ).toBeVisible({timeout: 20_000});

    const settingsLink = page.locator('a').filter({hasText: /^Settings$/});
    await settingsLink.click();
    await page.waitForTimeout(3000);

    await docsScreenshot(
      page,
      'guide/sections/edit-section-settings.md',
      'settings-form',
    );
  });

  test('assign-a-course: course catalog page', async ({page}) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.goto('/catalog');

    await expect(
      page.getByRole('heading', {name: 'Curriculum Catalog', level: 1}),
    ).toBeVisible({timeout: 20_000});

    await docsScreenshot(
      page,
      'guide/curriculum/assign-a-course.md',
      'course-catalog',
    );
  });

  test('hide-units-and-lessons: course view with visibility toggles', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.teacher);

    await page.goto(
      `/teacher_dashboard/sections/${state.sectionId}/script/csd1-2024`,
    );

    // Wait for the course/unit view to load.
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await docsScreenshot(
      page,
      'guide/curriculum/hide-units-and-lessons.md',
      'lesson-visibility',
    );
  });

  test('archive-a-section: section menu on home page', async ({page}) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.evaluate(() => {
      try {
        localStorage.setItem('2026-codeai-rebrand-banner', 'false');
      } catch {
        /* localStorage may be unavailable (e.g. blocked in this context). */
      }
    });
    await page.goto('/home');

    await expect(
      page.getByText('Period 3 - CS Discoveries').first(),
    ).toBeVisible({timeout: 20_000});

    // Try to find and click the section card's three-dot menu.
    const menuButton = page
      .locator('#ui-test-section-list button[aria-haspopup]')
      .first()
      .or(
        page.locator('#ui-test-section-list .uitest-section-dropdown').first(),
      )
      .or(page.locator('#ui-test-section-list [aria-label*="ection"]').first());
    const menuVisible = await menuButton.isVisible().catch(() => false);
    if (menuVisible) {
      await menuButton.click();
      await page.waitForTimeout(500);
      await docsScreenshot(
        page,
        'guide/sections/archive-a-section.md',
        'section-menu',
      );
    }
  });
});

test('docs label: sidebar shows "Roster" not "Manage Students"', async ({
  page,
}) => {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'SidebarLabelTeacher'});
  await page.goto('/');

  const sectionResp = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {login_type: 'email', participant_type: 'student'},
  );
  expect(sectionResp.ok).toBe(true);
  const {id: sectionId} = JSON.parse(sectionResp.body) as {id: number};

  await page.goto(`/teacher_dashboard/sections/${sectionId}/roster`);
  await page.waitForLoadState('domcontentloaded');

  const rosterLink = page.locator('a').filter({hasText: /^Roster$/});
  await expect(rosterLink).toBeVisible({timeout: 20_000});
});

import type {Page} from '@playwright/test';

import {
  assignSectionToCourseAndUnit,
  createTeacherAssociatedStudent,
  getLevelbuilderAccess,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {Maze} from '../activities/maze/Maze';

import {TeacherDashboardPage} from './TeacherDashboardPage';

/**
 * Teacher Dashboard Progress V2 — progress table controls and student work
 * links.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
 */

const MAZE_LEVEL_1_SOLUTION = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'maze_moveForward',
            id: 'startBlock',
            next: {
              block: {
                type: 'maze_moveForward',
                id: 'moveForward',
              },
            },
          },
        },
      },
    ],
  },
};

/**
 * Creates the same authorized teacher/student/course setup used by the source
 * feature and opens the V2 progress page.
 *
 * @param page - Playwright page
 * @param completeMazeLevel - when true, Sally completes lesson 2 level 1 first
 * @returns teacher dashboard page object
 */
async function openProgressDashboard(
  page: Page,
  {completeMazeLevel = false}: {completeMazeLevel?: boolean} = {},
): Promise<TeacherDashboardPage> {
  const {teacherEmail, teacherPassword} = await createTeacherAssociatedStudent(
    page,
    {
      authorized: true,
      studentName: 'Sally',
    },
  );

  if (completeMazeLevel) {
    const maze = new Maze(page);
    await maze.gotoLevel(1);
    await maze.loadBlocks(MAZE_LEVEL_1_SOLUTION);
    await maze.runUntilCongrats();
  }

  await signIn(page, teacherEmail, teacherPassword);
  await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
  await getLevelbuilderAccess(page);

  const dashboard = new TeacherDashboardPage(page);
  await dashboard.gotoHome();
  await dashboard.openFirstSectionProgress();
  await dashboard.expectProgressV2Ready();
  await expect(
    page.locator('#ui-test-student-row-unexpanded-Sally'),
  ).toBeVisible({
    timeout: 15_000,
  });

  return dashboard;
}

test.describe('Teacher Dashboard Progress V2', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Teacher can open and close Icon Key and details
   */
  test('teacher toggles icon key and details dialog', async ({page}) => {
    await openProgressDashboard(page, {completeMazeLevel: true});

    await expect(
      page.getByText('Assignment Completion States', {exact: true}),
    ).toBeVisible();
    await page.getByRole('button', {name: /Icon Key/}).click();
    await expect(
      page.getByText('Assignment Completion States', {exact: true}),
    ).not.toBeVisible();
    await page.getByRole('button', {name: /Icon Key/}).click();
    await expect(
      page.getByText('Assignment Completion States', {exact: true}),
    ).toBeVisible();

    await page.getByRole('link', {name: 'More Details'}).click();
    await expect(
      page.getByRole('heading', {name: 'Progress Tracking Icon Key'}),
    ).toBeVisible({timeout: 15_000});
    await page.getByRole('button', {name: 'OK'}).click();
    await expect(
      page.getByRole('heading', {name: 'Progress Tracking Icon Key'}),
    ).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Viewing student metadata
   */
  test('teacher expands and collapses student metadata', async ({page}) => {
    await openProgressDashboard(page);

    await page.getByRole('button', {name: 'Additional options'}).click();
    const expandAllStudentRows = page
      .locator('button')
      .filter({hasText: 'Expand all student rows'});
    const collapseAllStudentRows = page
      .locator('button')
      .filter({hasText: 'Collapse all student rows'});

    await expect(expandAllStudentRows).toBeVisible();
    await expect(collapseAllStudentRows).toBeVisible();

    await expandAllStudentRows.click();
    await expect(page.getByText('Last Updated')).toBeVisible();
    await expect(page.getByText('Time Spent')).toBeVisible();
    await expect(
      page.locator('#ui-test-student-row-expanded-Sally'),
    ).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', {name: 'Additional options'}).click();
    await collapseAllStudentRows
      .last()
      .evaluate(element => (element as HTMLElement).click());
    await expect(page.getByText('Time Spent')).not.toBeVisible();
    await expect(page.getByText('Last Updated')).not.toBeVisible();

    await page.locator('#ui-test-student-row-unexpanded-Sally').click();
    await expect(page.getByText('Last Updated')).toBeVisible();
    await expect(page.getByText('Time Spent')).toBeVisible();
    await page.locator('#ui-test-student-row-expanded-Sally').click();
    await expect(page.getByText('Time Spent')).not.toBeVisible();
    await expect(page.getByText('Last Updated')).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Teacher can open and close lessons and see level data cells
   */
  test('teacher expands and collapses lesson data cells', async ({page}) => {
    const dashboard = await openProgressDashboard(page);

    await dashboard.expandProgressLesson(2);
    await expect(
      page.locator(
        '#ui-test-courses-allthethingscourse-units-1-lessons-2-levels-1-cell-data',
      ),
    ).toBeVisible({timeout: 15_000});
    await expect(
      page.locator(
        '#ui-test-courses-original-allthethings-course-units-1-lessons-2-levels-1-cell-data',
      ),
    ).not.toBeVisible();

    await dashboard.collapseProgressLesson(2);
    await expect(
      page.locator(
        '#ui-test-courses-allthethingscourse-units-1-lessons-2-levels-1-cell-data',
      ),
    ).not.toBeAttached({timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Teacher can navigate to student work by clicking level cell.
   */
  test('teacher opens student work from a level cell', async ({
    page,
    context,
  }) => {
    const dashboard = await openProgressDashboard(page);

    await dashboard.expandProgressLesson(2);
    const studentWorkPage = context.waitForEvent('page');
    await page
      .locator(
        '#ui-test-courses-allthethingscourse-units-1-lessons-2-levels-1-cell-data',
      )
      .click();
    const newPage = await studentWorkPage;
    await newPage.waitForLoadState('domcontentloaded');
    await expect(newPage).toHaveURL(/user_id=/);
    await expect(newPage).toHaveURL(
      /courses\/allthethingscourse\/units\/1\/lessons\/2\/levels\/1/,
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Teacher can open lesson data, refresh the page, and lesson data will still be shown
   */
  test('open lesson data remains shown after refresh', async ({page}) => {
    const dashboard = await openProgressDashboard(page);

    await dashboard.expandProgressLesson(2);
    await expect(
      page.locator(
        '#ui-test-courses-allthethingscourse-units-1-lessons-2-levels-1-cell-data',
      ),
    ).toBeVisible({timeout: 15_000});

    await page.reload();
    await dashboard.expectProgressV2Ready();
    await expect(
      page.locator(
        '#ui-test-courses-allthethingscourse-units-1-lessons-2-levels-1-cell-data',
      ),
    ).toBeVisible({timeout: 30_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Teacher can view lesson progress for when students have completed a lesson and when they have started a lesson but not finished
   */
  test('teacher sees lesson progress icons after student progress', async ({
    page,
    eyes,
  }) => {
    await openProgressDashboard(page, {completeMazeLevel: true});

    await expect(page.getByTestId('progress-icon').first()).toBeVisible({
      timeout: 15_000,
    });
    await eyes.open('V2 progress dashboard');
    await eyes.check('V2 progress dashboard');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Teacher can view student work, ask student to keep working, on rubric level
   */
  test('teacher can open rubric-level student work from progress', async ({
    page,
    context,
    eyes,
  }) => {
    await eyes.open('V2 Progress Dashboard Assessments');
    const dashboard = await openProgressDashboard(page);

    await page.locator('#ui-test-lesson-header-38').scrollIntoViewIfNeeded();
    await dashboard.expandProgressLesson(38);
    await eyes.check('needs feedback icon is displayed');
    const studentWorkPage = context.waitForEvent('page');
    await page
      .locator(
        '#ui-test-courses-allthethingscourse-units-1-lessons-38-levels-1-cell-data',
      )
      .click();
    const newPage = await studentWorkPage;
    await expect(newPage).toHaveURL(/lessons\/38\/levels\/1/);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature
   * Scenario: Teacher can view choice levels
   */
  test('teacher expands and collapses choice-level progress', async ({
    page,
    eyes,
  }) => {
    await eyes.open('V2 Progress - Choice Levels');
    const dashboard = await openProgressDashboard(page);

    await dashboard.expandProgressLesson(40);
    const choiceLevel = page.locator('button').filter({hasText: /^40\.1$/});
    const choiceSublevel = page.locator('th').filter({hasText: /^b$/});

    await expect(choiceLevel).toBeVisible({
      timeout: 15_000,
    });
    await eyes.check('unexpanded choice level');

    await choiceLevel.click();
    await expect(choiceSublevel).toBeVisible({
      timeout: 15_000,
    });
    await eyes.check('expanded choice level');

    await choiceLevel.click();
    await expect(choiceSublevel).not.toBeVisible();
    await eyes.check('unexpanded choice level - closed');
  });
});

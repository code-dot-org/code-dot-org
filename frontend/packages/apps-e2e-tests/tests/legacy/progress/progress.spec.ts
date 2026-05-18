import {test} from '@playwright/test';

import {createStudent} from '../../shared/auth';
import {ScriptOverviewPage} from '../script-overview/ScriptOverviewPage';

/**
 * Level progress persistence.
 *
 * Source: dashboard/test/ui/features/teacher_tools/progress.feature
 */
test.describe('level progress', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/progress.feature
   * Scenario: Progress is saved for signed-in student
   */
  test('signed-in student progress is saved', async ({page}) => {
    await createStudent(page);

    const overview = new ScriptOverviewPage(page);
    await overview.completeK1MazeLevel();
    await overview.expectHeaderProgress(1, 'perfect');
    await overview.expectHeaderProgress(2, 'not_tried');

    await page.goto('/courses/allthethingscourse/units/1/lessons/2/levels/2');
    await overview.expectHeaderProgress(1, 'perfect');
    await overview.expectHeaderProgress(2, 'not_tried');

    await overview.gotoUnitOverview('/courses/allthethingscourse/units/1');
    await overview.expectLessonCell('Maze');
    await overview.expectSummaryProgressAfterReloads(2, 1, 'perfect');
    await overview.expectSummaryProgressAfterReloads(2, 2, 'not_tried');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/progress.feature
   * Scenario: Progress is saved for signed-out student
   */
  test('signed-out student progress is saved client-side', async ({page}) => {
    await page.goto('/reset_session');

    const overview = new ScriptOverviewPage(page);
    await overview.completeK1MazeLevel();
    await overview.expectHeaderProgress(1, 'perfect');
    await overview.expectHeaderProgress(2, 'not_tried');

    await page.goto('/courses/allthethingscourse/units/1/lessons/2/levels/2');
    await overview.expectHeaderProgress(1, 'perfect');
    await overview.expectHeaderProgress(2, 'not_tried');

    await overview.gotoUnitOverview('/courses/allthethingscourse/units/1');
    await overview.expectLessonCell('Maze');
    await overview.expectSummaryProgressAfterReloads(2, 1, 'perfect');
    await overview.expectSummaryProgressAfterReloads(2, 2, 'not_tried');
  });
});

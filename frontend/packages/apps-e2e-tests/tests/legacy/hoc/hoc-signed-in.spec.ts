import {expect, test} from '../../shared/fixtures';
import {HocLevel} from '../clearpuzzle/HocLevel';

import {TWO_MOVE_FORWARD_BLOCKS} from './blocks';

/**
 * Hour of Code — signed-in student server-side progress.
 *
 * Source: dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code_signed_in.feature
 *
 * All scenarios run as an authenticated student (@as_student). Unlike the
 * anonymous HoC suite, progress is stored server-side; hoc/reset clears
 * localStorage but leaves server-side saves intact.
 */
test.describe('Hour of Code — signed-in student progress', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code_signed_in.feature
   * Scenario: Solving puzzle 1, proceeding to puzzle 2, verifying that puzzle 1 appears as solved
   */
  test('solving puzzle 1 saves progress server-side; hoc/reset preserves saved source', async ({
    studentPage,
  }) => {
    const hoc = new HocLevel(studentPage);

    // Fresh student — no prior progress on this account.
    await hoc.loadLevel(1);
    await hoc.loadBlocks(TWO_MOVE_FORWARD_BLOCKS);
    await hoc.run();

    await hoc.modal.waitFor({state: 'visible'});
    await expect(hoc.congratsMessage).toContainText('You completed Puzzle 1.');

    // Continue advances to hoc/2 for signed-in users (server-side nav).
    await hoc.continueButton.click();
    await studentPage.waitForURL(/\/hoc\/2/);
    await hoc.runButton.waitFor({state: 'visible'});

    // Header progress bubble for level 1 should be "perfect".
    await hoc.expectProgressInHeader(1, 'perfect');

    // Course overview for hourofcode unit 1 should also reflect perfect.
    await studentPage.goto('/courses/hourofcode/units/1');
    await hoc.userStatsBlock.waitFor({state: 'visible'});
    await hoc.expectProgressOnOverview(1, 1, 'perfect');

    // A different course shows "not_tried" for level 1 (progress is scoped per course).
    await studentPage.goto(
      '/courses/20-hour/units/1/lessons/2/levels/2?noautoplay=true',
    );
    await studentPage.waitForURL(/\/courses\/20-hour\//);
    await studentPage
      .locator('.header_level .progress-bubble')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await hoc.expectProgressInHeader(1, 'not_tried');

    // Level source is server-saved — blocks persist after re-navigation.
    await hoc.loadLevel(1);
    await hoc.expectBlockIsChildOf('moveForward', 'startBlock');

    // hoc/reset clears localStorage but NOT server-side saves for signed-in users.
    await studentPage.goto('/hoc/reset');
    await hoc.loadLevel(1);
    await hoc.expectBlockIsChildOf('moveForward', 'startBlock');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code_signed_in.feature
   * Scenario: Failing at puzzle 6, refreshing puzzle 6, bubble should show up as attempted
   */
  test('failing puzzle 6 then refreshing shows attempted progress bubble', async ({
    studentPage,
  }) => {
    const hoc = new HocLevel(studentPage);

    await hoc.loadLevel(6);
    // Run with default empty workspace — bird cannot complete the path.
    await hoc.run();
    await hoc.inlineFeedback.waitFor({state: 'visible'});

    await studentPage.reload();
    await hoc.runButton.waitFor({state: 'visible'});
    await hoc.expectProgressInHeader(6, 'attempted');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code_signed_in.feature
   * Scenario: Progress on the server that is not on the client
   */
  test('server-side attempted progress survives hoc/reset of localStorage', async ({
    studentPage,
  }) => {
    const hoc = new HocLevel(studentPage);

    // Level 20 with empty workspace fails — recorded server-side as attempted.
    await hoc.loadLevel(20);
    await hoc.expectProgressInHeader(20, 'not_tried');
    await hoc.run();
    await hoc.inlineFeedback.waitFor({state: 'visible'});

    // hoc/reset clears localStorage; server progress is unaffected.
    await studentPage.goto('/hoc/reset');
    await hoc.loadLevel(20);
    await hoc.expectProgressInHeader(20, 'attempted');

    // Course overview reflects server-side attempted.
    await studentPage.goto('/courses/hourofcode/units/1');
    await hoc.userStatsBlock.waitFor({state: 'visible'});
    await hoc.expectProgressOnOverview(1, 20, 'attempted');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code_signed_in.feature
   * Scenario: Go to puzzle 10, see video, go somewhere else, return to puzzle 10, should not see video
   */
  test(
    'video at puzzle 10 not re-shown after first viewing',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const hoc = new HocLevel(studentPage);

      // Level 10 has an intro video — load without noautoplay so it auto-plays.
      await studentPage.goto('/hoc/10');
      await hoc.videoModal.waitFor({state: 'visible'});
      await hoc.closeVideoModal();

      await studentPage.goto('/hoc/11');
      await studentPage.waitForURL(/\/hoc\/11/);
      await hoc.runButton.waitFor({state: 'visible'});

      await studentPage.goto('/hoc/10');
      await studentPage.waitForURL(/\/hoc\/10/);
      await hoc.runButton.waitFor({state: 'visible'});

      // Video must NOT reappear on the second visit.
      await expect(hoc.videoModal).toBeHidden();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code_signed_in.feature
   * Scenario: Go to puzzle 9, see callouts, go somewhere else, return to puzzle 9, should not see callouts
   */
  test('callouts at puzzle 9 not re-shown after first viewing', async ({
    studentPage,
  }) => {
    const hoc = new HocLevel(studentPage);

    await studentPage.goto('/hoc/9?noautoplay=true');
    await hoc.runButton.waitFor({state: 'visible'});
    await expect(hoc.callout('Blocks that are grey')).toBeVisible();

    await studentPage.goto('/hoc/10?noautoplay=true');
    await studentPage.waitForURL(/\/hoc\/10/);
    await studentPage.goto('/hoc/9?noautoplay=true');
    await studentPage.waitForURL(/\/hoc\/9/);
    await hoc.runButton.waitFor({state: 'visible'});

    // Callout must NOT reappear on second visit.
    await expect(hoc.callout('Blocks that are grey')).not.toBeAttached();
  });
});

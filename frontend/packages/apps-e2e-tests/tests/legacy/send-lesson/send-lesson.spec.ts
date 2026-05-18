import {createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {SendLessonPage} from './SendLesson';

/**
 * Send lesson dialog — unit overview for allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/send_lesson.feature
 *
 * All scenarios tagged @as_teacher and @no_mobile.
 * @eyes scenario is skipped (Applitools only).
 */

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/teacher_tools/send_lesson.feature
 * Scenario: Send lesson dialog renders properly
 *
 * The source scenario is `@eyes`. This port executes the page and modal
 * readiness path up to the visual checkpoint; the Applitools screenshot
 * assertion is intentionally not performed in apps-e2e-tests.
 */
test(
  'visual path: send lesson dialog renders properly',
  {tag: '@no_mobile'},
  async ({page}) => {
    await createTeacher(page);
    const sendLesson = new SendLessonPage(page);
    await sendLesson.gotoUnitOverview();
    await expect(page.locator('.uitest-sendlesson').first()).toBeVisible();

    // Eyes checkpoint in Cucumber: "unit overview".
    await sendLesson.openDialog(4);
    await expect(
      page.locator('span').filter({hasText: 'Google'}).first(),
    ).toBeVisible({timeout: 15_000});
    // Eyes checkpoint in Cucumber: "send lesson dialog".
  },
);

test.describe('Send lesson dialog', () => {
  let sendLesson: SendLessonPage;

  test.beforeEach(async ({page}) => {
    await createTeacher(page);
    sendLesson = new SendLessonPage(page);
    await sendLesson.gotoUnitOverview();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/send_lesson.feature
   * Scenario: Send lesson dialog opens and closes
   */
  test('dialog opens and closes', {tag: '@no_mobile'}, async ({page}) => {
    await sendLesson.openDialog(4);

    await expect(
      page.locator('span').filter({hasText: 'Google'}).first(),
    ).toBeVisible({timeout: 15_000});

    await sendLesson.doneButton.click();
    await expect(sendLesson.modal).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/send_lesson.feature
   * Scenario: Send lesson dialog copy link button works
   */
  test('copy link button works', {tag: '@no_mobile'}, async () => {
    await sendLesson.openDialog(2);

    await expect(sendLesson.copyButton).toBeVisible({timeout: 15_000});
    await sendLesson.copyButton.click();

    await expect(sendLesson.copiedConfirmation).toBeVisible({timeout: 15_000});
  });
});

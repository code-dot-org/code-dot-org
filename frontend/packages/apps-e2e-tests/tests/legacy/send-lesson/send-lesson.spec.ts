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

// @eyes: visual regression test — Applitools only.
test.fixme('send lesson dialog renders properly', async () => {});

test.describe('Send lesson dialog', () => {
  let sendLesson: SendLessonPage;

  test.beforeEach(async ({page}) => {
    await createTeacher(page);
    sendLesson = new SendLessonPage(page);
    await sendLesson.gotoUnitOverview();
  });

  test('dialog opens and closes', {tag: '@no_mobile'}, async ({page}) => {
    await sendLesson.openDialog(4);

    await expect(
      page.locator('span').filter({hasText: 'Google'}).first(),
    ).toBeVisible({timeout: 15_000});

    await sendLesson.doneButton.click();
    await expect(sendLesson.modal).not.toBeVisible();
  });

  test('copy link button works', {tag: '@no_mobile'}, async () => {
    await sendLesson.openDialog(2);

    await expect(sendLesson.copyButton).toBeVisible({timeout: 15_000});
    await sendLesson.copyButton.click();

    await expect(sendLesson.copiedConfirmation).toBeVisible({timeout: 15_000});
  });
});

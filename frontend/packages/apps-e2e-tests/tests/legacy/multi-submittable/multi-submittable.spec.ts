import {createTeacherAssociatedStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Submittable multi-choice level — lesson 9 level 3 of allthethingscourse.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/multi_submittable.feature
 *
 * All scenarios tagged @no_mobile and @as_taught_student.
 */

const LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/9/levels/3?noautoplay=true';

test.describe('Submittable multi-choice — lesson 9 level 3', () => {
  test.beforeEach(async ({page}) => {
    await createTeacherAssociatedStudent(page);
  });

  test(
    'loading the level shows the question',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto(LEVEL_URL);
      await page
        .locator('.submitButton')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('.multi-question')).toHaveText(
        'What is your favorite color?',
      );
    },
  );

  test(
    'submit, unsubmit, and resubmit cycle restores editable state',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto(LEVEL_URL);
      await page
        .locator('.submitButton')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      // Both submit buttons disabled until an answer is chosen.
      await expect(page.locator('.submitButton').first()).toBeDisabled();
      await expect(page.locator('.submitButton').last()).toBeDisabled();

      // Select an answer and submit.
      await page.locator('.answerbutton[index="2"]').click();
      await expect(page.locator('.submitButton').first()).toBeEnabled();
      await page.locator('.submitButton').first().click();
      await page.locator('.modal').waitFor({state: 'visible'});

      // Reload: unsubmit button visible; submit buttons gone.
      await page.reload();
      await page
        .locator('.unsubmitButton')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.unsubmitButton').first()).toBeVisible();
      await expect(page.locator('.submitButton').first()).not.toBeVisible();
      await expect(page.locator('.submitButton').last()).not.toBeVisible();

      // Unsubmit and confirm.
      await page.locator('.unsubmitButton').first().click();
      await page.locator('.modal').waitFor({state: 'visible'});
      await page.locator('#continue-button').click();

      // After unsubmit both submit buttons are enabled again.
      await page
        .locator('.submitButton')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.submitButton').first()).toBeEnabled();
      await expect(page.locator('.submitButton').last()).toBeEnabled();
    },
  );
});

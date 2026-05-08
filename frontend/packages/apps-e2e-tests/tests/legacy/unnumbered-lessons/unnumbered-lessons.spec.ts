import {createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Unnumbered lessons — units, lesson pages, and header popup for
 * ui-test-unnumbered-lessons course.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/unnumbered_lessons.feature
 *
 * Signed in as teacher (anonymous users may not see progress-lesson elements).
 */

const UNIT_URL = '/courses/ui-test-unnumbered-lessons/units/1';
const LESSON1_URL = '/courses/ui-test-unnumbered-lessons/units/1/lessons/1';
const LEVEL1_URL =
  '/courses/ui-test-unnumbered-lessons/units/1/lessons/1/levels/1';

test.describe('Unnumbered lessons', () => {
  test('lesson names appear without numeric prefixes across unit, lesson, and level views', async ({
    page,
  }) => {
    await createTeacher(page);

    // Unit overview: lessons shown by name only.
    await page.goto(UNIT_URL);
    await page
      .locator('.uitest-progress-lesson')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.uitest-progress-lesson')).toContainText(
      'Lesson One',
    );
    await expect(page.locator('.uitest-progress-lesson')).not.toContainText(
      'Lesson 1',
    );
    await expect(page.locator('.uitest-progress-lesson')).toContainText(
      'Lesson Two',
    );
    await expect(page.locator('.uitest-progress-lesson')).not.toContainText(
      'Lesson 2',
    );

    // Lesson overview page.
    await page.goto(LESSON1_URL);
    await page
      .locator('.uitest-lesson-title')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.uitest-lesson-title')).toContainText(
      'Lesson One',
    );
    await expect(page.locator('.uitest-lesson-title')).not.toContainText(
      'Lesson 1',
    );

    // Level page: header popup shows unnumbered lesson names.
    await page.goto(LEVEL1_URL);
    await page
      .locator('button.header_popup_link')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.uitest-progress-lesson')).not.toBeVisible();

    await page.locator('button.header_popup_link').click();
    await page.locator('.uitest-progress-lesson').waitFor({state: 'visible'});
    await expect(page.locator('.uitest-progress-lesson')).toContainText(
      'Lesson One',
    );
    await expect(page.locator('.uitest-progress-lesson')).not.toContainText(
      'Lesson 1',
    );
    await expect(page.locator('.uitest-progress-lesson')).toContainText(
      'Lesson Two',
    );
    await expect(page.locator('.uitest-progress-lesson')).not.toContainText(
      'Lesson 2',
    );
  });
});

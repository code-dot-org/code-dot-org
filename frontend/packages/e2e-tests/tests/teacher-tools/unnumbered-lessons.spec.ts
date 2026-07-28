import {type Locator} from '@playwright/test';

import {expect, test} from '../fixtures';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {LessonOverviewPage} from '../pages/lesson-overview-page';
import {UnitOverviewPage} from '../pages/unit-overview-page';
import {joinedText} from '../shared/ui';

const COURSE = 'ui-test-unnumbered-lessons';

/**
 * Asserts a progress-lesson locator's joined text shows both unnumbered
 * lesson names. Reads the text once per retry (via `toPass`) so all four
 * contains/not-contains checks see the same DOM snapshot, rather than each
 * re-querying independently.
 */
async function expectUnnumberedLessonNames(
  progressLessons: Locator,
): Promise<void> {
  await expect(async () => {
    const text = await joinedText(progressLessons);
    expect(text).toContain('Lesson One');
    expect(text).not.toContain('Lesson 1');
    expect(text).toContain('Lesson Two');
    expect(text).not.toContain('Lesson 2');
  }).toPass();
}

test.describe('Unnumbered Lessons', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/unnumbered_lessons.feature "Units with Unnumbered Lessons"
   */
  test('Units with Unnumbered Lessons', async ({page, signInAsNewUser}) => {
    await signInAsNewUser({type: 'teacher', name: 'Test Teacher'});

    const unitOverview = new UnitOverviewPage(page);
    await unitOverview.gotoOverview({course: COURSE, unit: 1});
    await expect(unitOverview.progressLessons.first()).toBeVisible();
    await expectUnnumberedLessonNames(unitOverview.progressLessons);

    const lessonOverview = new LessonOverviewPage(page);
    await lessonOverview.gotoOverview({course: COURSE, unit: 1, lesson: 1});
    await expect(lessonOverview.lessonTitle).toBeVisible();
    await expect(lessonOverview.lessonTitle).toContainText('Lesson One');
    await expect(lessonOverview.lessonTitle).not.toContainText('Lesson 1');

    const lessonLevel = new LessonLevelPage(page);
    await lessonLevel.gotoLevel({course: COURSE, unit: 1, lesson: 1, level: 1});
    // Pre-click, the progress rows haven't mounted at all (a true React
    // unmount, not merely hidden) — assert absence by count, not visibility.
    await expect(lessonLevel.progressLessons).toHaveCount(0);

    await lessonLevel.openHeaderPopup();
    await expectUnnumberedLessonNames(lessonLevel.progressLessons);
  });
});

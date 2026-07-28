import {expect, test} from '../fixtures';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {LessonOverviewPage} from '../pages/lesson-overview-page';
import {UnitOverviewPage} from '../pages/unit-overview-page';
import {joinedText} from '../shared/ui';

const COURSE = 'ui-test-unnumbered-lessons';

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
    // .uitest-progress-lesson matches one card per lesson; joinedText mirrors
    // browser_helpers.rb's element_text, which joins all matched nodes'
    // text before the substring check runs.
    await expect
      .poll(() => joinedText(unitOverview.progressLessons))
      .toContain('Lesson One');
    await expect
      .poll(() => joinedText(unitOverview.progressLessons))
      .not.toContain('Lesson 1');
    await expect
      .poll(() => joinedText(unitOverview.progressLessons))
      .toContain('Lesson Two');
    await expect
      .poll(() => joinedText(unitOverview.progressLessons))
      .not.toContain('Lesson 2');

    const lessonOverview = new LessonOverviewPage(page);
    await lessonOverview.gotoOverview({course: COURSE, unit: 1, lesson: 1});
    await expect(lessonOverview.lessonTitle).toBeVisible();
    await expect(lessonOverview.lessonTitle).toContainText('Lesson One');
    await expect(lessonOverview.lessonTitle).not.toContainText('Lesson 1');

    const lessonLevel = new LessonLevelPage(page);
    await lessonLevel.gotoLevel({course: COURSE, unit: 1, lesson: 1, level: 1});
    await expect(lessonLevel.headerPopupButton).toBeVisible();
    // Pre-click, the progress rows haven't mounted at all (a true React
    // unmount, not merely hidden) — assert absence by count, not visibility.
    await expect(lessonLevel.progressLessons).toHaveCount(0);

    await lessonLevel.openHeaderPopup();
    await expect(lessonLevel.progressLessons.first()).toBeVisible();
    await expect
      .poll(() => joinedText(lessonLevel.progressLessons))
      .toContain('Lesson One');
    await expect
      .poll(() => joinedText(lessonLevel.progressLessons))
      .not.toContain('Lesson 1');
    await expect
      .poll(() => joinedText(lessonLevel.progressLessons))
      .toContain('Lesson Two');
    await expect
      .poll(() => joinedText(lessonLevel.progressLessons))
      .not.toContain('Lesson 2');
  });
});

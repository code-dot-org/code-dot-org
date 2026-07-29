import {type Locator} from '@playwright/test';

import {expect, test} from '../fixtures';
import {
  LessonLevelPage,
  PROGRESS_LESSON_SELECTOR,
} from '../pages/lesson-level-page';
import {LessonOverviewPage} from '../pages/lesson-overview-page';
import {UnitOverviewPage} from '../pages/unit-overview-page';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {joinedText} from '../shared/ui';

const COURSE = 'ui-test-unnumbered-lessons';

// Accessibility baseline for the three surfaces this feature introduces or
// changes, each scoped to its own DOM (not the shared header/footer chrome).
// rule id -> failing node count; a new violation outside this set fails the
// scan.
//   unitOverviewLessons: the per-lesson progress cards are clean.
//   lessonOverview: pre-existing DSCO shortfalls in LessonOverview.jsx, not
//     introduced by this port — color-contrast: the "0 minutes"/"Agenda"/
//     "Teaching Guide" <h2> section headers (teal #0093a4-on-white, 3.67:1,
//     below the 4.5:1 AA threshold); link-name: an in-page "#activity-N" jump
//     anchor with no accessible text.
//   headerPopup: the progress-summary popup content is clean.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  unitOverviewLessons: {},
  lessonOverview: {'color-contrast': 3, 'link-name': 1},
  headerPopup: {},
};

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
    expect(
      await analyze(page, {
        include: PROGRESS_LESSON_SELECTOR,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.unitOverviewLessons);

    const lessonOverview = new LessonOverviewPage(page);
    await lessonOverview.gotoOverview({course: COURSE, unit: 1, lesson: 1});
    await expect(lessonOverview.lessonTitle).toBeVisible();
    await expect(lessonOverview.lessonTitle).toContainText('Lesson One');
    await expect(lessonOverview.lessonTitle).not.toContainText('Lesson 1');
    expect(
      await analyze(page, {include: '#main_content', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.lessonOverview);

    const lessonLevel = new LessonLevelPage(page);
    await lessonLevel.gotoLevel({course: COURSE, unit: 1, lesson: 1, level: 1});
    await expect(lessonLevel.headerPopupButton).toBeVisible();
    // Pre-click, the progress rows haven't mounted at all (a true React
    // unmount, not merely hidden) — assert absence by count, not visibility.
    await expect(lessonLevel.progressLessons).toHaveCount(0);

    await lessonLevel.openHeaderPopup();
    await expectUnnumberedLessonNames(lessonLevel.progressLessons);
    expect(
      await analyze(page, {
        include: lessonLevel.headerPopupSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.headerPopup);
  });
});

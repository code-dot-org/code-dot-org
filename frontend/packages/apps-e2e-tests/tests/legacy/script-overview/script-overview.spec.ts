import {
  assignSectionToCourseAndUnit,
  createStudent,
  createTeacherAssociatedStudent,
  signIn,
} from '../../shared/auth';
import {test} from '../../shared/fixtures';
import {WINNING_ARTIST_BLOCKS} from '../activities/artist/blocks';

import {ScriptOverviewPage} from './ScriptOverviewPage';

/**
 * Unit overview page.
 *
 * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
 *
 * Source feature is tagged @no_safari @no_mobile.
 */

test.describe('Unit overview page', {tag: ['@no_mobile', '@no_safari']}, () => {
  test.beforeEach(({browserName}) => {
    test.skip(
      browserName === 'webkit',
      'Source Cucumber feature is @no_safari: dashboard/test/ui/features/teacher_tools/script_overview.feature',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
   * Scenario: Viewing student progress
   */
  test('student progress is visible to student and teacher', async ({page}) => {
    test.slow();
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Sally',
    });
    const scriptOverview = new ScriptOverviewPage(page);

    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/home', {waitUntil: 'domcontentloaded'});
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    await signIn(page, pair.studentEmail, pair.studentPassword);
    await scriptOverview.completeK1MazeLevel();

    await scriptOverview.gotoUnitOverview(
      '/courses/allthethingscourse/units/1',
    );
    await scriptOverview.expectLessonCell('Maze');
    await scriptOverview.expectTeacherPanelHidden();
    await scriptOverview.expectSummaryProgressAfterReloads(2, 1, 'perfect');
    await scriptOverview.expectSummaryProgress(2, 2, 'not_tried');

    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await scriptOverview.completeArtistLevel(WINNING_ARTIST_BLOCKS);
    await scriptOverview.gotoUnitOverview(
      '/courses/allthethingscourse/units/1',
    );
    await scriptOverview.expectDetailProgress(29, 4, 'perfect');
    await scriptOverview.selectViewAsStudent('Sally');
    await scriptOverview.expectLessonCell('Maze');
    await scriptOverview.expectSummaryLessonText('2. Maze');
    await scriptOverview.expectSummaryProgressAfterReloads(2, 1, 'perfect');
    await scriptOverview.expectSummaryProgress(2, 2, 'not_tried');

    await page.reload({waitUntil: 'domcontentloaded'});
    await scriptOverview.expectSummaryProgress(29, 4, 'not_tried');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
   * Scenario: Unit overview contents
   */
  test('unit overview toggles summary and detail lesson formats', async ({
    page,
  }) => {
    const scriptOverview = new ScriptOverviewPage(page);
    await createStudent(page, {name: 'Jean'});

    await scriptOverview.gotoUnitOverview(
      '/courses/allthethingscourse/units/1',
    );
    await scriptOverview.expectLessonCell('Maze');
    await scriptOverview.expectSummaryLessonText('2. Maze');
    await scriptOverview.openDetailView();
    await scriptOverview.expectDetailLessonText('Lesson 2: Maze');

    await scriptOverview.gotoUnitOverview('/courses/mc/units/1');
    await scriptOverview.expectLessonCell('Minecraft');
    await scriptOverview.expectSummaryLessonText('1. Minecraft Hour of Code');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
   * Scenario: Unit overview end-of-lesson
   */
  test('end-of-lesson header appears then clears on reload', async ({page}) => {
    test.slow();
    const scriptOverview = new ScriptOverviewPage(page);
    await createStudent(page, {name: 'Jean'});

    await scriptOverview.completeSingleAppLabLesson();
    await scriptOverview.expectEndOfLessonBannerClearsAfterReload();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
   * Scenario: Unit overview new lesson plan
   */
  test('new lesson plan link opens in a new tab', async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});
    await signIn(page, teacherEmail, teacherPassword);

    const scriptOverview = new ScriptOverviewPage(page);
    await scriptOverview.openLessonPlanInNewTab();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
   * Scenario: Unit overview student resources as teacher
   */
  test(
    'student resources link (as teacher) opens in a new tab',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {authorized: true});
      await signIn(page, teacherEmail, teacherPassword);

      await page.goto('/courses/allthelessonplans/units/1?no_redirect=true');
      await page
        .locator('#uitest-student-resources')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      const [newTab] = await Promise.all([
        page.context().waitForEvent('page'),
        page.locator('#uitest-student-resources').first().click(),
      ]);
      await newTab.waitForURL(
        /courses\/allthelessonplans\/units\/1\/lessons\/1\/student/,
        {timeout: 30_000},
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
   * Scenario: Unit overview student resources as student
   */
  test(
    'student resources link (as student) opens in a new tab',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page, {authorized: true});

      await page.goto('/courses/allthelessonplans/units/1?no_redirect=true');
      await page
        .locator('.ui-test-lesson-resources')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      const [newTab] = await Promise.all([
        page.context().waitForEvent('page'),
        page.locator('.ui-test-lesson-resources').first().click(),
      ]);
      await newTab.waitForURL(
        /courses\/allthelessonplans\/units\/1\/lessons\/1\/student/,
        {timeout: 30_000},
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/script_overview.feature
   * Scenario: Unit overview for unit in single-unit course
   */
  test(
    'version selector on single-unit course redirects to new version',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {authorized: true});
      await signIn(page, teacherEmail, teacherPassword);

      await page.goto('/courses/ui-test-single-unit-course-2025/units/1');
      await page
        .locator('#assignment-version-year')
        .waitFor({state: 'visible', timeout: 30_000});

      await page
        .locator('#assignment-version-year')
        .filter({hasText: '2025'})
        .waitFor({state: 'visible', timeout: 15_000});

      await page.locator('#assignment-version-year').click();
      await page
        .locator('.assignment-version-title')
        .filter({hasText: '2026'})
        .waitFor({state: 'visible', timeout: 15_000});
      await page
        .locator('.assignment-version-title')
        .filter({hasText: '2026'})
        .dispatchEvent('click');

      await page.waitForURL(
        /\/courses\/ui-test-single-unit-course-2026\/units\/1/,
        {timeout: 30_000},
      );
      await page
        .locator('#assignment-version-year')
        .filter({hasText: '2026'})
        .waitFor({state: 'visible', timeout: 15_000});
      await page
        .locator('.unit-breadcrumb')
        .waitFor({state: 'hidden', timeout: 15_000});
    },
  );
});

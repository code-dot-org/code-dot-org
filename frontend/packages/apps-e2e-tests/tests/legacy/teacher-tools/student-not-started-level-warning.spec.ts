import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {StudentNotStartedPage} from './StudentNotStartedPage';

test.describe(
  'Student has not started level warning',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/student_not_started_level_warning.feature
     * Scenario: Game lab level where student has not started
     */
    test('Game Lab teacher panel shows not-started warning for untouched student work', async ({
      page,
      eyes,
    }) => {
      await eyes.open('game lab student has not started');
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto('/teacher_dashboard/home');
      await expect(page.locator('#ui-test-section-list')).toBeVisible({
        timeout: 30_000,
      });
      const warning = new StudentNotStartedPage(page);
      await warning.openStudentWork(
        '/courses/allthethingscourse/units/1/lessons/38/levels/3',
        'Sally',
      );
      await expect(page.locator('#ui-test-feedback-input')).toHaveAttribute(
        'placeholder',
        /Please enter feedback for your student here\./,
        {timeout: 30_000},
      );
      await warning.expectWarningVisible();
      await warning.expectVisualLayoutReady();
      await eyes.check('student not started warning');
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/student_not_started_level_warning.feature
     * Scenario: Maze level where student has not started
     */
    test('Maze teacher panel shows not-started warning for untouched student work', async ({
      page,
      eyes,
    }) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });

      await signIn(page, teacherEmail, teacherPassword);
      await eyes.open('maze student has not started');
      await page.goto('/teacher_dashboard/home');
      await expect(page.locator('#ui-test-section-list')).toBeVisible({
        timeout: 30_000,
      });
      const warning = new StudentNotStartedPage(page);
      await warning.openStudentWork(
        '/courses/allthethingscourse/units/1/lessons/4/levels/2',
        'Sally',
      );
      await warning.expectWarningVisible();
      await warning.expectVisualLayoutReady();
      await eyes.check('student not started warning', {
        ignoreRegions: [
          page.locator('#visualizationColumn'),
          page.locator('.header_level'),
        ],
      });
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/student_not_started_level_warning.feature
     * Scenario: Contained level
     */
    test('contained level omits not-started warning', async ({page, eyes}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });

      await signIn(page, teacherEmail, teacherPassword);
      await eyes.open('contained level');
      await page.goto('/teacher_dashboard/home');
      await expect(page.locator('#ui-test-section-list')).toBeVisible({
        timeout: 30_000,
      });
      const warning = new StudentNotStartedPage(page);
      await warning.openStudentWork(
        '/courses/allthethingscourse/units/1/lessons/41/levels/1',
        'Sally',
      );
      await warning.expectWarningHidden();
      await warning.expectVisualLayoutReady();
      await eyes.check('no student not started warning');
    });
  },
);

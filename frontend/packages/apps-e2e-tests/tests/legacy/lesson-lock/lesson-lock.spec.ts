import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {LessonLockPage} from './LessonLockPage';

const SURVEY_LESSON = 'Anonymous student survey 2';
const ASSESSMENT_LESSON = 'Example CSP Assessment';
const SURVEY_PAGE_1 =
  '/courses/allthethingscourse/units/1/lockable/1/levels/1/page/1';
const SURVEY_PAGE_4 =
  '/courses/allthethingscourse/units/1/lockable/1/levels/1/page/4';
const ASSESSMENT_PAGE_3 =
  '/courses/allthethingscourse/units/1/lockable/3/levels/1/page/3';

test.describe('Lesson locking', {tag: ['@no_mobile']}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_lock.feature
   * Scenario: Stage Locking Dialog
   */
  test('stage locking dialog opens and unlocks the lesson', async ({
    page,
    eyes,
  }) => {
    const {teacherEmail, teacherPassword, sectionId} =
      await createTeacherAssociatedStudent(page, {
        authorized: true,
        studentName: 'bobby',
      });
    await eyes.open('stage locking');
    await signIn(page, teacherEmail, teacherPassword);

    const locks = new LessonLockPage(page);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await eyes.check('selected section');
    await locks.openLockDialog();
    await expect(locks.modalBody).toContainText(/Lock|Allow editing/);
    await eyes.check('stage lock dialog');
    await locks.unlockLessonForStudents();
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await expect(
      page.getByRole('button', {name: /Anonymous student survey/}).last(),
    ).toBeVisible({timeout: 30_000});
    await eyes.check('course overview for authorized teacher');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_lock.feature
   * Scenario: Readonly view does not show teacher only boxes
   */
  test('readonly assessment shows answers but not teacher-only boxes', async ({
    page,
  }) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'bobby',
    });

    const locks = new LessonLockPage(page);
    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 2, false, true);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(ASSESSMENT_LESSON, 'unlocked');
    await locks.expectReadonlyAnswers(
      ASSESSMENT_PAGE_3,
      /CS Principles Unit 1 Assessment/i,
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_lock.feature
   * Scenario: Lock settings for students in survey
   */
  test('survey locks after submit and readonly answers are visible', async ({
    page,
  }) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'bobby',
    });

    const locks = new LessonLockPage(page);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');
    await locks.expectLockedLevel(SURVEY_PAGE_1);

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, false);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');
    await locks.submitSurvey();
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, true);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');
    await locks.expectReadonlyAnswers(SURVEY_PAGE_4, /Pre-survey/i);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_lock.feature
   * Scenario: Lock settings for students who never submit
   */
  test('student who never submits can view readonly survey answers', async ({
    page,
  }) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'billy',
    });

    const locks = new LessonLockPage(page);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');
    await locks.expectLockedLevel(SURVEY_PAGE_1);

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, false);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, true);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_lock_retake.feature
   * Scenario: Lock settings for retake not submit scenario
   */
  test('retake can unlock an unsubmitted locked survey', async ({page}) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'babby',
    });

    const locks = new LessonLockPage(page);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');
    await locks.expectLockedLevel(SURVEY_PAGE_1);

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, false);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, true, false);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, false);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');
    await locks.submitSurvey();
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_lock_retake.feature
   * Scenario: Lock settings for retake after submit scenario
   */
  test('retake after submit exposes the unsubmit button', async ({page}) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'frank',
    });

    const locks = new LessonLockPage(page);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');
    await locks.expectLockedLevel(SURVEY_PAGE_1);

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, false);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');
    await locks.submitSurvey();
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'locked');

    await signIn(page, teacherEmail, teacherPassword);
    await locks.gotoUnitOverview(sectionId, {teacherControls: true});
    await locks.setLessonLockStatus(sectionId, 0, false, false);

    await signIn(page, studentEmail, studentPassword);
    await locks.gotoUnitOverview(sectionId);
    await locks.expectLessonStatus(SURVEY_LESSON, 'unlocked');
    await page.goto(SURVEY_PAGE_4);
    await expect(page.locator('.unsubmitButton')).toBeVisible({
      timeout: 30_000,
    });
  });
});

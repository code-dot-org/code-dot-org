import {type Browser, type Page} from '@playwright/test';

import {
  createProfessionalLearningSection,
  createTeacher,
  createTeacherAssociatedStudent,
  grantFacilitatorAccess,
  grantPlcReviewerAccess,
  grantUniversalInstructorAccess,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {ProfessionalLearningSectionsPage} from './ProfessionalLearningSectionsPage';

const SECTION_NAME = 'My Section of Teachers';

/**
 * Professional learning section creation and joining.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/pl_sections.feature
 */

test.describe('Professional learning sections', () => {
  test.use({viewport: {width: 1280, height: 900}});

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Create new professional learning section as universal instructor
   */
  test('universal instructor creates a facilitator PL section', async ({
    page,
  }) => {
    const pair = await createTeacherAssociatedStudent(page, {authorized: true});
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await grantUniversalInstructorAccess(page);

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.openCenter('Instructor Center');
    await plSections.expectSetupBox();
    await plSections.openNewSectionDialog();
    await plSections.expectParticipantTypes([
      'student',
      'teacher',
      'facilitator',
    ]);
    await plSections.createSectionFromDialog('facilitator', SECTION_NAME);
    await plSections.openCenter('Instructor Center');
    await plSections.expectOwnedSection(SECTION_NAME, 1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Create new professional learning section as plc reviewer
   */
  test('PLC reviewer creates a facilitator PL section', async ({page}) => {
    const pair = await createTeacherAssociatedStudent(page, {authorized: true});
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await grantPlcReviewerAccess(page);

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.openCenter('Instructor Center');
    await plSections.expectSetupBox();
    await plSections.openNewSectionDialog();
    await plSections.expectParticipantTypes([
      'student',
      'teacher',
      'facilitator',
    ]);
    await plSections.createSectionFromDialog('facilitator', SECTION_NAME);
    await plSections.openCenter('Instructor Center');
    await plSections.expectOwnedSection(SECTION_NAME, 1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Create new professional learning section as facilitator
   */
  test('facilitator creates a teacher PL section', async ({page}) => {
    const pair = await createTeacherAssociatedStudent(page, {authorized: true});
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await grantFacilitatorAccess(page);

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.openCenter('Facilitator Center');
    await plSections.expectSetupBox();
    await plSections.openNewSectionDialog();
    await plSections.expectParticipantTypes(
      ['student', 'teacher'],
      ['facilitator'],
    );
    await plSections.createSectionFromDialog('teacher', SECTION_NAME);
    await plSections.openCenter('Facilitator Center');
    await plSections.expectOwnedSection(SECTION_NAME, 1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Teacher can not create professional learning section
   */
  test('teacher cannot create a professional learning section', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Teacher'});
    await page.goto('/');
    await expect(page.locator('#teacher-home-header')).toBeVisible();

    await page.getByRole('button', {name: 'New class section'}).click();
    await expect(page.locator('.uitest-new-section-dialog')).toBeVisible();
    await expect(page.locator('.uitest-teacher-type')).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Teacher tries to join professional learning section for teachers
   */
  test('teacher joins a teacher PL section', async ({browser, page}) => {
    const sectionCode = await createOwnerSection(browser, 'teacher');
    await createTeacher(page, {name: 'Teacher'});

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.joinSection(sectionCode);
    await plSections.expectJoinedSectionRows(1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Teacher tries to join professional learning section for facilitators
   */
  test('teacher cannot join a facilitator PL section', async ({
    browser,
    page,
  }) => {
    const sectionCode = await createOwnerSection(browser, 'facilitator');
    await createTeacher(page, {name: 'Teacher'});

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.joinSection(sectionCode);
    await plSections.expectJoinPermissionError();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Facilitator tries to join professional learning section for teachers
   */
  test('facilitator joins a teacher PL section', async ({browser, page}) => {
    const sectionCode = await createOwnerSection(browser, 'teacher');
    await createTeacher(page, {name: 'Facilitator'});
    await grantFacilitatorAccess(page);

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.joinSection(sectionCode);
    await plSections.expectJoinedSectionRows(1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Facilitator tries to join professional learning section for facilitators
   */
  test('facilitator joins a facilitator PL section', async ({
    browser,
    page,
  }) => {
    const sectionCode = await createOwnerSection(browser, 'facilitator');
    await createTeacher(page, {name: 'Facilitator'});
    await grantFacilitatorAccess(page);

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.joinSection(sectionCode);
    await plSections.expectJoinedSectionRows(1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Universal Instructor tries to join professional learning section for teachers
   */
  test('universal instructor joins a teacher PL section', async ({
    browser,
    page,
  }) => {
    const sectionCode = await createOwnerSection(browser, 'teacher');
    await createTeacher(page, {name: 'Universal Instructor 2'});
    await grantUniversalInstructorAccess(page);

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.joinSection(sectionCode);
    await plSections.expectJoinedSectionRows(1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/pl_sections.feature
   * Scenario: Universal Instructor tries to join professional learning section for facilitators
   */
  test('universal instructor joins a facilitator PL section', async ({
    browser,
    page,
  }) => {
    const sectionCode = await createOwnerSection(browser, 'facilitator');
    await createTeacher(page, {name: 'Universal Instructor 2'});
    await grantUniversalInstructorAccess(page);

    const plSections = new ProfessionalLearningSectionsPage(page);
    await plSections.goto();
    await plSections.joinSection(sectionCode);
    await plSections.expectJoinedSectionRows(1);
  });
});

/**
 * Creates the owning universal-instructor PL section used by join scenarios.
 *
 * @param page - Playwright page for the owner setup session
 * @param participantType - PL section participant audience
 * @returns section join code
 */
async function createOwnerSection(
  browser: Browser,
  participantType: 'teacher' | 'facilitator',
): Promise<string> {
  const context = await browser.newContext();
  const page: Page = await context.newPage();
  try {
    const pair = await createTeacherAssociatedStudent(page, {authorized: true});
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await grantUniversalInstructorAccess(page);
    const {sectionCode} = await createProfessionalLearningSection(
      page,
      participantType,
    );
    return sectionCode;
  } finally {
    await context.close();
  }
}

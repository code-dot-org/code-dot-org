import {type Locator, type Page} from '@playwright/test';

import {
  assignSectionToCourseAndUnit,
  createSection,
  createSectionWithCourse,
  createTeacher,
  createTeacherAssociatedStudent,
  createTestUser,
  signIn,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Legacy Teacher Homepage — deprecated Cucumber coverage with current
 * teacher-dashboard-home equivalents.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
 */

/**
 * Creates a signed-in teacher with sign_in_count=0, matching the source step
 * `I create a teacher who has never signed in ...`.
 *
 * @param page - Playwright page whose context receives the teacher session
 * @param name - teacher display name
 */
async function createNeverSignedInTeacher(
  page: Parameters<typeof createTestUser>[0],
  name: string,
): Promise<void> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `teacher_${ts}_${rand}@test.xx`;
  const password = `TeacherPass${ts}`;

  await createTestUser(page, {
    user_type: 'teacher',
    email,
    password,
    password_confirmation: password,
    name,
    age: '21+',
    sign_in_count: 0,
    terms_of_service_version: '1',
    email_preference_opt_in: 'yes',
    email_preference_form_kind: email,
    email_preference_request_ip: '127.0.0.1',
    email_preference_source: 'ACCOUNT_SIGN_UP',
  });
}

function sectionCourseLabel(page: Page, sectionName = 'New Section'): Locator {
  return page.locator(
    `#course-content-dropdown-${sectionName.replaceAll(' ', '-')}`,
  );
}

async function openJumpToLink(page: Page, linkName: string): Promise<Locator> {
  await page.locator('#go-to-lesson-dropdown-button').click();
  const link = page.getByRole('link', {name: linkName});
  await expect(link).toBeVisible({timeout: 15_000});
  return link;
}

async function gotoHomeWithLessonListReady(
  page: Page,
  sectionId: number,
): Promise<void> {
  // WebKit can open the visible Jump to dropdown before its async lesson list
  // hydrates, so wait for the narrow lesson-list response before using it.
  const lessonsLoaded = page.waitForResponse(
    response =>
      response
        .url()
        .includes(`/sections/${sectionId}/retrieve_lessons_for_dropdown`) &&
      response.ok(),
    {timeout: 30_000},
  );

  await page.goto('/teacher_dashboard/home');
  await lessonsLoaded;
  await expect(page.locator('#ui-test-section-list')).toBeVisible({
    timeout: 30_000,
  });
}

async function hideUnit(page: Page, unitName: string): Promise<void> {
  const unitCard = page.locator('.uitest-CourseScript', {hasText: unitName});
  await expect(unitCard).toBeVisible({timeout: 30_000});
  await unitCard.locator('.fa-eye-slash').click();
  await expect(unitCard).toHaveAttribute('data-visibility', 'hidden', {
    timeout: 30_000,
  });
}

test.describe(
  'Legacy teacher homepage equivalents',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: See a section creation dialog when logging for the first time
     *
     * The legacy `/home` interstitial is no longer reachable for teachers:
     * `/home` redirects to `/teacher_dashboard/home`.  The current first-login
     * readiness signal is the empty teacher dashboard with its section CTA.
     */
    test('new teacher first login reaches teacher dashboard empty state', async ({
      page,
    }) => {
      await createNeverSignedInTeacher(page, 'Ariel');
      await page.goto('/');

      await expect(page).toHaveURL(/\/teacher_dashboard\/home/, {
        timeout: 30_000,
      });
      await expect(
        page.getByRole('heading', {name: 'Welcome, Ariel'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('heading', {name: 'Class Sections'}),
      ).toBeVisible();
      await expect(
        page.getByRole('button', {name: 'New class section'}),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', {name: "It's a bit empty here..."}),
      ).toBeVisible();
      await expect(
        page.getByText('You haven’t created any class sections yet.'),
      ).toBeVisible();

      const legacySectionCreationModal = page.getByRole('heading', {
        name: "Let's get you started teaching with Code.org!",
      });
      await expect(legacySectionCreationModal).not.toBeAttached();

      await page.reload();
      await expect(
        page.getByRole('heading', {name: 'Class Sections'}),
      ).toBeVisible({timeout: 30_000});
      await expect(legacySectionCreationModal).not.toBeAttached();
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Do not see a section creation dialog when logging after first time
     */
    test('returning teacher does not see section creation modal', async ({
      page,
    }) => {
      await createTeacher(page, {name: 'Belle'});
      await page.goto('/home');

      await expect(
        page.getByRole('heading', {name: 'Class Sections'}),
      ).toBeVisible({timeout: 30_000});
      await expect(page.locator('.modal')).not.toBeVisible();
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Loading the teacher homepage with new sections
     */
    test('teacher homepage lists newly-created sections', async ({page}) => {
      await createTeacher(page);
      await createSection(page);
      await createSection(page);

      await page.goto('/teacher_dashboard/home');
      await expect(page.locator('#ui-test-section-list')).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page.locator('#section-options-dropdown-dropdown-button'),
      ).toHaveCount(2);
      await expect(
        page.getByRole('heading', {name: 'Untitled Section'}),
      ).toHaveCount(2);
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Loading the print certificates page for a section
     */
    test('teacher opens the print certificates page for a section', async ({
      page,
    }) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {studentName: 'Sally'});

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto('/teacher_dashboard/home');
      await page.locator('#section-options-dropdown-dropdown-button').click();
      await page.locator('#ui-test-print-certificates').click();

      await expect(page).toHaveURL(/\/certificates\/batch/, {timeout: 30_000});
      await expect(page.locator('#certificate-batch')).toContainText('Sally', {
        timeout: 15_000,
      });
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Do not see the unit when a section is assigned a single-unit course
     */
    test('single-unit course section does not render current-unit text', async ({
      page,
    }) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {studentName: 'Sally'});

      await signIn(page, teacherEmail, teacherPassword);
      await assignSectionToCourseAndUnit(
        page,
        0,
        'ui-test-single-unit-course-2025',
        1,
      );

      await page.goto('/teacher_dashboard/home');
      await expect(page.locator('#ui-test-section-list')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('#ui-test-section-list')).toContainText(
        'Single Unit Course 2025',
      );
      await expect(page.locator('#ui-test-section-list')).not.toContainText(
        'Current unit:',
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Assign hidden unit to section
     *
     * Current teacher-dashboard routing exposes the same behavior on the course
     * overview: hiding the assigned unit marks the unit hidden for the section,
     * and the enrolled student sees the hidden-unit warning.
     */
    test('hidden assigned unit is marked hidden and blocked for the student', async ({
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
        studentName: 'Sally',
      });

      await signIn(page, teacherEmail, teacherPassword);
      await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
      await page.goto(`/courses/allthethingscourse?section_id=${sectionId}`);
      await expect(page.locator('.uitest-CourseScript').first()).toBeVisible({
        timeout: 30_000,
      });

      await hideUnit(page, 'All the Things!');

      await signOut(page);
      await signIn(page, studentEmail, studentPassword);
      await page.goto(
        `/courses/allthethingscourse/units/1?section_id=${sectionId}`,
      );
      await expect(
        page.getByText("Your teacher didn't expect you to be here."),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('link', {name: 'Go to course overview'}),
      ).toBeVisible({timeout: 30_000});
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Assign a Course assigns first Unit in Course by default
     */
    test('assigned course defaults the section Jump to menu to unit 1', async ({
      page,
    }) => {
      await createTeacher(page);
      const {sectionId} = await createSectionWithCourse(
        page,
        'ui-test-csp-2025',
        1,
      );

      await gotoHomeWithLessonListReady(page, sectionId);
      await expect(sectionCourseLabel(page)).toContainText('UI Test CSP', {
        timeout: 30_000,
      });

      const unitLink = await openJumpToLink(page, 'Unit 1: Applab');
      await expect(unitLink).toHaveAttribute(
        'href',
        new RegExp(
          `/teacher_dashboard/sections/${sectionId}/courses/ui-test-csp-2025/units/1`,
        ),
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Assign a CSF course with multiple versions
     */
    test('section card reflects changing a versioned course assignment', async ({
      page,
    }) => {
      await createTeacher(page);
      const {sectionId} = await createSectionWithCourse(
        page,
        'ui-test-course-2017',
        1,
      );

      await gotoHomeWithLessonListReady(page, sectionId);
      await expect(sectionCourseLabel(page)).toContainText(
        'ui-test-course-2017',
        {timeout: 30_000},
      );
      let unitLink = await openJumpToLink(
        page,
        'ui-test-script-in-course-2017',
      );
      await expect(unitLink).toHaveAttribute(
        'href',
        new RegExp(
          `/teacher_dashboard/sections/${sectionId}/courses/ui-test-course-2017/units/1`,
        ),
      );

      await assignSectionToCourseAndUnit(page, 0, 'ui-test-course-2019', 1);
      await gotoHomeWithLessonListReady(page, sectionId);
      await expect(sectionCourseLabel(page)).toContainText(
        'ui-test-course-2019',
        {timeout: 30_000},
      );
      unitLink = await openJumpToLink(page, 'ui-test-script-in-course-2019');
      await expect(unitLink).toHaveAttribute(
        'href',
        new RegExp(
          `/teacher_dashboard/sections/${sectionId}/courses/ui-test-course-2019/units/1`,
        ),
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_homepage.feature
     * Scenario: Navigate to course pages with course versions enabled
     */
    test('teacher homepage course links preserve section context on course pages', async ({
      page,
    }) => {
      await createTeacher(page);
      const {sectionId} = await createSectionWithCourse(
        page,
        'ui-test-csp-2025',
        1,
      );

      await gotoHomeWithLessonListReady(page, sectionId);

      const sectionCard = page.locator('#ui-test-section-list').filter({
        hasText: 'UI Test CSP',
      });
      await expect(sectionCard).toBeVisible({timeout: 30_000});
      await expect(
        page.locator('#course-content-dropdown-New-Section'),
      ).toContainText('UI Test CSP', {timeout: 30_000});

      await page.locator('#go-to-lesson-dropdown-button').click();
      const unitLink = page.getByRole('link', {name: 'Unit 1: Applab'});
      await expect(unitLink).toBeVisible({timeout: 15_000});
      await expect(unitLink).toHaveAttribute(
        'href',
        new RegExp(
          `/teacher_dashboard/sections/${sectionId}/courses/ui-test-csp-2025/units/1`,
        ),
      );
      await unitLink.click();

      await expect(page).toHaveURL(
        new RegExp(
          `/teacher_dashboard/sections/${sectionId}/courses/ui-test-csp-2025/units/1`,
        ),
        {timeout: 30_000},
      );
      await expect(
        page.getByRole('heading', {name: 'Unit 1 - Applab'}),
      ).toBeVisible({timeout: 30_000});
      const courseOverviewLink = page.getByRole('link', {
        name: '< UI Test CSP',
      });
      await expect(courseOverviewLink).toHaveAttribute(
        'href',
        new RegExp(
          `/teacher_dashboard/sections/${sectionId}/courses/ui-test-csp-2025$`,
        ),
      );
      await courseOverviewLink.click();

      await expect(page).toHaveURL(
        new RegExp(
          `/teacher_dashboard/sections/${sectionId}/courses/ui-test-csp-2025$`,
        ),
        {timeout: 30_000},
      );
      await expect(
        page.getByRole('heading', {name: 'UI Test CSP', exact: true}),
      ).toBeVisible({timeout: 30_000});
      await expect(page.locator('#assignment-version-year')).toBeVisible({
        timeout: 15_000,
      });
    });
  },
);

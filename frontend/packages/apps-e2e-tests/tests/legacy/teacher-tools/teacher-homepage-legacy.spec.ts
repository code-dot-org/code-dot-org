import {
  assignSectionToCourseAndUnit,
  createSection,
  createSectionWithCourse,
  createTeacher,
  createTeacherAssociatedStudent,
  createTestUser,
  signIn,
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

      await page.goto('/teacher_dashboard/home');
      await expect(page.locator('#ui-test-section-list')).toBeVisible({
        timeout: 30_000,
      });

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

import {
  createSection,
  createSectionWithCourse,
  createStudent,
  createTeacher,
  getLevelbuilderAccess,
  joinSection,
  signIn,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Teacher Homepage V2 — section management actions from the teacher dashboard
 * home page.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
 */

test.describe('Teacher Homepage V2', {tag: '@no_mobile'}, () => {
  /**
   * Source: teacher_homepage_v2.feature
   * "Teacher can access section pages from section options dropdown"
   *
   * Settings, Roster, Login cards, and Print certificates links all load the
   * correct destination pages.
   */
  test('section options dropdown links navigate to correct pages', async ({
    page,
  }) => {
    const {email: teacherEmail, password: teacherPassword} =
      await createTeacher(page);
    await page.goto('/home');
    await getLevelbuilderAccess(page);

    const {sectionCode} = await createSectionWithCourse(
      page,
      'ui-test-single-unit-course-2026',
      1,
    );
    const {displayName: studentName} = await createStudent(page);
    await joinSection(page, sectionCode);

    await signOut(page);
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/teacher_dashboard/home');

    // Settings
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-Section-settings')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-Section-settings').click();
    await page
      .locator('#sections-set-up-container')
      .waitFor({state: 'visible', timeout: 15_000});

    // Roster
    await page.goto('/teacher_dashboard/home');
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-Roster')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-Roster').click();
    await page
      .locator('#uitest-manage-students-table')
      .waitFor({state: 'visible', timeout: 15_000});

    // Login cards
    await page.goto('/teacher_dashboard/home');
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-Login-cards')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-Login-cards').click();
    await page
      .locator('#ui-test-section-login-info')
      .waitFor({state: 'visible', timeout: 15_000});

    // Print certificates (navigates to a new page)
    await page.goto('/teacher_dashboard/home');
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-print-certificates')
      .waitFor({state: 'visible', timeout: 10_000});
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#ui-test-print-certificates').click(),
    ]);
    await page
      .locator('#certificate-batch')
      .waitFor({state: 'visible', timeout: 15_000});

    void studentName;
  });

  /**
   * Source: teacher_homepage_v2.feature
   * "Teacher can archive and restore sections from the section options dropdown"
   */
  test('teacher can archive and restore sections', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-archive-section')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-archive-section').click();
    await page.locator('#ui-test-archived').click();

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-archive-section')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-archive-section').click();
    await page.locator('#ui-test-teaching').click();

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Source: teacher_homepage_v2.feature
   * "Teacher can delete a section from the section options dropdown"
   */
  test('teacher can delete a section', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-delete-section')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-delete-section').click();
    await page
      .locator('#ui-test-delete-section-confirm')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-delete-section-confirm').click();

    await expect(
      page.locator('#section-options-dropdown-dropdown-button'),
    ).not.toBeAttached({timeout: 15_000});
  });

  /**
   * Source: teacher_homepage_v2.feature
   * "Teacher can assign a course from the 'Assign a course' button and access
   * lessons from the 'Jump to' dropdown"
   */
  test('teacher assigns course from empty-state button and uses Jump to dropdown', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#ui-test-empty-state-button-Assign-a-course')
      .waitFor({state: 'visible', timeout: 30_000});
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#ui-test-empty-state-button-Assign-a-course').click(),
    ]);

    // Assign AI for Oceans.
    await page
      .locator('h4')
      .filter({hasText: 'AI for Oceans'})
      .waitFor({state: 'visible', timeout: 30_000});
    await page
      .locator("[aria-label='Assign AI for Oceans to your classroom']")
      .click();
    await page
      .locator('span')
      .filter({hasText: 'Untitled Section'})
      .waitFor({state: 'visible', timeout: 10_000});
    await page.getByRole('checkbox', {name: 'Untitled Section'}).click();
    await page
      .locator('button')
      .filter({hasText: 'Confirm section assignments'})
      .click();
    await page
      .locator('p')
      .filter({hasText: 'You have successfully assigned'})
      .waitFor({state: 'visible', timeout: 15_000});

    await page.goto('/teacher_dashboard/home');
    await page
      .locator('#course-content-dropdown-Untitled-Section')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(
      page.locator('#course-content-dropdown-Untitled-Section'),
    ).toContainText('Course: AI for Oceans');

    await page
      .locator('#go-to-lesson-dropdown-button')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#go-to-lesson-dropdown-button').click();
    await page
      .locator('#ui-test-lesson-AI-for-Oceans')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-lesson-AI-for-Oceans').click();
    await page
      .locator('a')
      .filter({hasText: 'AI for Oceans'})
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Source: teacher_homepage_v2.feature
   * "Teacher can access section roster from the 'Add students' button"
   */
  test('teacher opens roster via Add students button', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#ui-test-empty-state-button-Add-students')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#ui-test-empty-state-button-Add-students').click();
    await page
      .locator('#uitest-manage-students-table')
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Source: teacher_homepage_v2.feature
   * "Teacher can view student progress from the 'View progress' button"
   */
  test('teacher views student progress from View progress button', async ({
    page,
  }) => {
    const {email: teacherEmail, password: teacherPassword} =
      await createTeacher(page);
    await page.goto('/home');
    await getLevelbuilderAccess(page);

    const {sectionCode} = await createSectionWithCourse(
      page,
      'ui-test-single-unit-course-2026',
      1,
    );
    await createStudent(page, {name: 'Bobby'});
    await joinSection(page, sectionCode);

    await signOut(page);
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#task-button-View-progress-New-Section')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#task-button-View-progress-New-Section').click();
    await page
      .locator('h1')
      .filter({hasText: 'Progress'})
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Source: teacher_homepage_v2.feature
   * "Teacher can view lesson materials from the 'View lesson materials' button"
   */
  test('teacher views lesson materials from View lesson materials button', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSectionWithCourse(page, 'ui-test-single-unit-course-2026', 1);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#task-button-View-lesson-materials-New-Section')
      .waitFor({state: 'visible', timeout: 30_000});
    await page
      .locator('#task-button-View-lesson-materials-New-Section')
      .click();
    await page
      .locator('h1')
      .filter({hasText: 'Lesson Materials'})
      .waitFor({state: 'visible', timeout: 15_000});
  });
});

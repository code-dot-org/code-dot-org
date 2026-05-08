import {
  createTeacherAssociatedStudent,
  createStudent,
  signIn,
} from '../../shared/auth';
import {test} from '../../shared/fixtures';

/**
 * Unit overview page — end-of-lesson header, lesson plan links, student
 * resources, and version picker.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/script_overview.feature
 *
 * Tagged @no_safari @no_mobile (tab-switching fails on Safari 14+).
 * Two @properties_encryption_key scenarios are skipped.
 */

// @properties_encryption_key — requires encryption key configuration.
test.fixme(
  'unit overview: student progress saved and visible to teacher',
  async () => {},
);
test.fixme(
  'unit overview: summary vs detail view toggle and lesson name formats',
  async () => {},
);

test.describe('Unit overview page', () => {
  test(
    'end-of-lesson header appears then clears on reload',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      await page.goto('/courses/ui-test-csp-2019/units/1/lessons/1/levels/1');
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('#runButton').click();
      await page
        .locator('button:has-text("Finish")')
        .waitFor({state: 'visible', timeout: 15_000});
      await page.locator('button:has-text("Finish")').click();
      await page
        .locator('#continue-button')
        .waitFor({state: 'visible', timeout: 15_000});

      await Promise.all([
        page.waitForNavigation({timeout: 30_000}),
        page.locator('#continue-button').click(),
      ]);

      await page
        .locator('.uitest-end-of-lesson-header')
        .filter({hasText: 'You finished Lesson 1!'})
        .waitFor({state: 'visible', timeout: 30_000});

      await page.reload();
      await page
        .locator('.uitest-end-of-lesson-header')
        .waitFor({state: 'hidden', timeout: 15_000});
    },
  );

  test(
    'new lesson plan link opens in a new tab',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {authorized: true});
      await signIn(page, teacherEmail, teacherPassword);

      await page.goto('/courses/allthelessonplans/units/1?no_redirect=true');
      await page
        .locator('#uitest-lesson-plan')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      const [newTab] = await Promise.all([
        page.context().waitForEvent('page'),
        page.locator('#uitest-lesson-plan').first().click(),
      ]);
      await newTab.waitForURL(
        /\/courses\/allthelessonplans\/units\/1\/lessons\/1/,
        {timeout: 30_000},
      );
    },
  );

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

  test(
    'student resources link (as student) opens in a new tab',
    {tag: '@no_mobile'},
    async ({page}) => {
      // createTeacherAssociatedStudent ends with the student signed in.
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
      // The dropdown list overflows a clipped container; dispatchEvent bypasses
      // viewport checks that neither force:true nor scrollIntoView can overcome.
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

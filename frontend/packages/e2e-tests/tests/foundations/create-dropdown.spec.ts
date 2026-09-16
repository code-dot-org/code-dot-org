import {type HeaderComponent} from '../components/header';
import {expect, test} from '../fixtures';
import {HomePage} from '../pages/home-page';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {TeacherDashboardPage} from '../pages/teacher-dashboard/teacher-dashboard';
import {createStudent, createUser, resetSession, signOut} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {createSection, joinSection} from '../shared/sections';

// rule id -> failing node count, scoped to the create-menu dropdown panel
// (.create_menu) once open. Measured against test-studio; identical on both
// surfaces below because both violations are in markup that doesn't vary with
// the item set (the "New project" trigger and its own container element).
//   color-contrast: the "New project" label (.create_button, white text on
//     #7068d9) measures 4.49:1, just under the 4.5:1 AA threshold.
//   nested-interactive: #header_create_menu (role="button") contains the
//     dropdown's own focusable links once open — an interactive control
//     nested inside another.
//   fullMenuOpen: teacher / 13+ student / in-section young-student item set.
//   youngStudentMenuOpen: not-in-section young-student's reduced item set.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  fullMenuOpen: {'color-contrast': 1, 'nested-interactive': 1},
  youngStudentMenuOpen: {'color-contrast': 1, 'nested-interactive': 1},
};

/** The item set teachers, 13+ students, and in-section young students all share. */
async function expectFullCreateMenuItems(
  header: HeaderComponent,
): Promise<void> {
  await expect(header.getCreateProjectItem('spritelab')).toBeVisible();
  await expect(header.getCreateProjectItem('applab')).toBeVisible();
  await expect(header.getCreateProjectItem('gamelab')).toBeVisible();
  await expect(header.getCreateProjectItem('minecraft')).not.toBeVisible();
  await expect(header.getCreateProjectItem('dance')).toBeVisible();
  await expect(header.getCreateProjectItem('sketchlab')).toBeVisible();
  await expect(header.getCreateProjectItem('music_dance_ai')).toBeVisible();
  await expect(header.getCreateProjectItem('weblab2')).toBeVisible();
  await expect(header.getCreateProjectItem('music')).toBeVisible();
  await expect(header.getCreateProjectItem('pythonlab')).toBeVisible();
  await expect(header.viewAllProjectsLink).toBeVisible();
}

test.describe('Create Dropdown in Header', () => {
  // Both skips carry feature-level tags from the source Cucumber.
  test.skip(
    ({browserName}) => browserName === 'webkit',
    '@no_safari: dropdown hidden under a 1024x768 fixed-scrollbar media query',
  );
  test.skip(({browserName}) => browserName === 'firefox', '@no_firefox');

  /** Migration status: COMPLETED  Source: foundations/create_dropdown.feature "Create Dropdown does NOT show on level pages" */
  test(
    'Create Dropdown does NOT show on level pages',
    {tag: ['@no_mobile', '@no_safari', '@no_firefox', '@single_session']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: '16 Year Old'});

      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 18, level: 7});
      // Without this, the absence assertion passes vacuously on an unloaded page.
      await level.header.waitForSignedIn();
      await expect(level.header.createMenu).not.toBeVisible();

      await signOut(page);
    },
  );

  /** Migration status: COMPLETED  Source: foundations/create_dropdown.feature "Teacher - Correct Create Links" */
  test(
    'Teacher - Correct Create Links',
    {tag: ['@no_mobile', '@no_safari', '@no_firefox', '@single_session']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createUser(page, {type: 'teacher', name: 'Test Teacher'});

      const dashboard = new TeacherDashboardPage(page);
      await dashboard.goto();
      const header = dashboard.header;
      await expect(header.createMenu).toBeVisible();
      await header.openCreateMenu();

      await expectFullCreateMenuItems(header);
      expect(
        await analyze(page, {
          include: header.createMenuSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.fullMenuOpen);
    },
  );

  /** Migration status: COMPLETED  Source: foundations/create_dropdown.feature "Student, Age 13+ - Correct Create Links" */
  test(
    'Student, Age 13+ - Correct Create Links',
    {tag: ['@no_mobile', '@no_safari', '@no_firefox', '@single_session']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: '16 Year Old'});

      const home = new HomePage(page);
      await home.goto();
      const header = home.header;
      await expect(header.createMenu).toBeVisible();
      await header.openCreateMenu();

      await expectFullCreateMenuItems(header);
    },
  );

  /** Migration status: COMPLETED  Source: foundations/create_dropdown.feature "Young Student, Not in Section - Correct Create Links" */
  test(
    'Young Student, Not in Section - Correct Create Links',
    {tag: ['@no_mobile', '@no_safari', '@no_firefox', '@single_session']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      // A US under-13 with no us_state gets a "Finish creating your account"
      // interstitial instead of the header. WA has no CAP state policy, so it
      // yields the plain young student this scenario assumes.
      await createStudent(page, {
        name: '10 Year Old',
        age: '10',
        usState: 'WA',
      });

      const home = new HomePage(page);
      await home.goto();
      const header = home.header;
      await expect(header.createMenu).toBeVisible();
      await header.openCreateMenu();

      await expect(header.getCreateProjectItem('spritelab')).toBeVisible();
      await expect(header.getCreateProjectItem('artist')).toBeVisible();
      await expect(header.getCreateProjectItem('minecraft')).toBeVisible();
      await expect(header.getCreateProjectItem('applab')).not.toBeVisible();
      await expect(header.getCreateProjectItem('gamelab')).not.toBeVisible();
      await expect(header.getCreateProjectItem('dance')).toBeVisible();
      await expect(header.getCreateProjectItem('music')).toBeVisible();
      await expect(header.viewAllProjectsLink).toBeVisible();

      expect(
        await analyze(page, {
          include: header.createMenuSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.youngStudentMenuOpen);
    },
  );

  /** Migration status: COMPLETED  Source: foundations/create_dropdown.feature "Young Student, In Section - Correct Create Links" */
  test(
    'Young Student, In Section - Correct Create Links',
    {tag: ['@no_mobile', '@no_safari', '@no_firefox', '@single_session']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createUser(page, {type: 'teacher', name: 'Ms_Frizzle'});
      // Reload to pick up the teacher's CSRF token before posting the section.
      await page.goto('/');
      const {sectionUrl} = await createSection(page);

      // usState for the same reason as the not-in-section scenario above.
      await createStudent(page, {
        name: 'Young Student - In Section',
        age: '10',
        usState: 'WA',
      });
      await joinSection(page, sectionUrl);

      const home = new HomePage(page);
      const header = home.header;
      await expect(header.createMenu).toBeVisible();
      await header.openCreateMenu();

      await expectFullCreateMenuItems(header);
    },
  );
});

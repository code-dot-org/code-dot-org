import {expect, test} from '../fixtures';
import {CatalogPage} from '../pages/catalog-page';
import {HomePage} from '../pages/home-page';
import {TeacherDashboardPage} from '../pages/teacher-dashboard/teacher-dashboard';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {setCookie} from '../shared/cookies';

/**
 * WCAG AA violation counts per header state — one entry per state, not per
 * scenario, since the teacher and student dropdowns share markup. A new rule or
 * a larger count is a regression; a fix should shrink this map.
 */
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  signedOutHeader: {},
  signedInHeaderClosed: {},
  // Both are real header defects, not test artifacts: #header_display_name is
  // white on #7068d9 at 4.49:1, just under the 4.5:1 AA floor, and
  // #header_user_menu is a role="button" that holds focusable links once open.
  signedInHeaderOpen: {'color-contrast': 1, 'nested-interactive': 1},
};

test.describe('Sign In Button and User Menu in Header', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature "Signed Out - create account button shows on signed out studio page"
   */
  test(
    'Signed Out - create account button shows on signed out studio page',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const catalog = new CatalogPage(page);
      await catalog.goto();
      await setCookie(page, '_language', 'en');

      await expect(catalog.header.createAccountLink).toBeVisible();
      await expect(catalog.header.displayName).not.toBeVisible();

      expect(
        await analyze(page, {
          include: catalog.header.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.signedOutHeader);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature "Teacher Signed In - shows display name with correct links"
   */
  test(
    'Teacher Signed In - shows display name with correct links',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'Ms_Frizzle'});

      const dashboard = new TeacherDashboardPage(page);
      await dashboard.logoTransition.suppress();
      await dashboard.goto();
      const header = dashboard.header;

      await expect(header.displayName).toBeVisible();
      await expect(header.displayName).toContainText('Ms_Frizzle');

      await header.openUserMenu();
      await expect(header.userEditLink).toBeVisible();
      await expect(header.signOutLink).toBeVisible();

      // Suppression skips the animation but not the server-rendered pre-hide
      // style, and scanning while the logo is hidden costs a spurious
      // link-name violation.
      await dashboard.logoTransition.waitForSettled();

      expect(
        await analyze(page, {
          include: header.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.signedInHeaderOpen);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature "Student Signed In - shows display name with correct links"
   */
  test(
    'Student Signed In - shows display name with correct links',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'student', name: 'Arnold'});

      const home = new HomePage(page);
      await home.goto();
      const header = home.header;

      await expect(header.displayName).toBeVisible();
      await expect(header.displayName).toContainText('Arnold');

      await header.openUserMenu();
      await expect(header.userEditLink).toBeVisible();
      await expect(header.signOutLink).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature "Unicode in display name"
   */
  test(
    'Unicode in display name',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'student', name: 'Caoimhín'});

      const home = new HomePage(page);
      await home.goto();
      const header = home.header;

      await expect(header.displayName).toBeVisible();
      await expect(header.displayName).toContainText('Caoimhín');

      expect(
        await analyze(page, {
          include: header.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.signedInHeaderClosed);
    },
  );
});

import {createTeacher, createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {HeaderUserMenu} from './HeaderUserMenu';

/**
 * Sign-in button and user menu in the dashboard header.
 *
 * Source:
 *   dashboard/test/ui/features/foundations/user_menu.feature
 *
 * Tagged @no_mobile.
 * "I set the language cookie" step is covered by the default English catalog.
 */

test.describe('User menu in header', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature
   * Scenario: Signed Out - create account button shows on signed out studio page
   */
  test(
    'signed-out: create account button visible, display name absent',
    {tag: '@no_mobile'},
    async ({page}) => {
      const header = new HeaderUserMenu(page);

      await header.gotoSignedOutCatalog();
      await header.expectSignedOutState();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature
   * Scenario: Teacher Signed In - shows display name with correct links
   */
  test(
    'teacher signed in: display name shown with account and sign-out links',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {displayName} = await createTeacher(page, {name: 'Ms_Frizzle'});
      const header = new HeaderUserMenu(page);

      await header.gotoHome();
      await header.expectDisplayName(displayName);
      await header.openUserMenu();
      await header.expectAccountAndSignOutLinks();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature
   * Scenario: Student Signed In - shows display name with correct links
   */
  test(
    'student signed in: display name shown with account and sign-out links',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {displayName} = await createStudent(page, {name: 'Arnold'});
      const header = new HeaderUserMenu(page);

      await header.gotoHome();
      await header.expectDisplayName(displayName);
      await header.openUserMenu();
      await header.expectAccountAndSignOutLinks();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/user_menu.feature
   * Scenario: Unicode in display name
   */
  test(
    'unicode characters in display name render correctly',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {displayName} = await createStudent(page, {name: 'Caoimhín'});
      const header = new HeaderUserMenu(page);

      await header.gotoHome();
      await header.expectDisplayName(displayName);
    },
  );
});

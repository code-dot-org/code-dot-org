import {createTeacher, createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Sign-in button and user menu in the dashboard header.
 *
 * Source:
 *   dashboard/test/ui/features/foundations/user_menu.feature
 *
 * Tagged @no_mobile.
 * "I set the language cookie" step omitted — tests in English by default.
 */

test.describe('User menu in header', () => {
  test(
    'signed-out: create account button visible, display name absent',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/catalog');
      await page
        .locator('#create_account_button')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.display_name')).not.toBeVisible();
    },
  );

  test(
    'teacher signed in: display name shown with account and sign-out links',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {displayName} = await createTeacher(page);
      await page.goto('/home');
      await page
        .locator('.display_name')
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('.display_name')).toContainText(displayName);

      await page.locator('.display_name').click();
      await page
        .locator('#user-edit')
        .waitFor({state: 'visible', timeout: 10_000});
      await page
        .locator('#user-signout')
        .waitFor({state: 'visible', timeout: 10_000});
    },
  );

  test(
    'student signed in: display name shown with account and sign-out links',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {displayName} = await createStudent(page);
      await page.goto('/home');
      await page
        .locator('.display_name')
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('.display_name')).toContainText(displayName);

      await page.locator('.display_name').click();
      await page
        .locator('#user-edit')
        .waitFor({state: 'visible', timeout: 10_000});
      await page
        .locator('#user-signout')
        .waitFor({state: 'visible', timeout: 10_000});
    },
  );

  test(
    'unicode characters in display name render correctly',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {displayName} = await createStudent(page, {name: 'Caoimhín'});
      await page.goto('/home');
      await page
        .locator('.display_name')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.display_name')).toContainText(displayName);
    },
  );
});

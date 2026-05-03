import {expect, test} from '@playwright/test';

import {createStudent, createTeacher} from '../shared/auth';

/**
 * Header — sign-in button and user menu.
 *
 * Source: dashboard/test/ui/features/foundations/user_menu.feature
 * @no_mobile
 *
 * Four scenarios covering the header UI for signed-out and signed-in users.
 * Named accounts are used so the display-name assertions can be exact.
 */
test.describe('Header — sign-in button and user menu', () => {
  test(
    'signed-out user sees create-account button and no display name',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/reset_session');
      await page.goto('/catalog');
      // Two #create_account_button elements exist (desktop + mobile); either visible suffices.
      await page
        .locator('#create_account_button')
        .first()
        .waitFor({state: 'visible'});
      await expect(page.locator('.display_name')).not.toBeVisible();
    },
  );

  test(
    'teacher signed in sees display name and menu links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'Ms_Frizzle'});
      await page.goto('/home');
      const displayName = page.locator('.display_name');
      await displayName.waitFor({state: 'visible'});
      await expect(displayName).toContainText('Ms_Frizzle');
      await displayName.click();
      await expect(page.locator('#user-edit')).toBeVisible();
      await expect(page.locator('#user-signout')).toBeVisible();
    },
  );

  test(
    'student signed in sees display name and menu links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page, {name: 'Arnold'});
      await page.goto('/home');
      const displayName = page.locator('.display_name');
      await displayName.waitFor({state: 'visible'});
      await expect(displayName).toContainText('Arnold');
      await displayName.click();
      await expect(page.locator('#user-edit')).toBeVisible();
      await expect(page.locator('#user-signout')).toBeVisible();
    },
  );

  test(
    'unicode characters in display name render correctly',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page, {name: 'Caoimhín'});
      await page.goto('/home');
      const displayName = page.locator('.display_name');
      await displayName.waitFor({state: 'visible'});
      await expect(displayName).toContainText('Caoimhín');
    },
  );
});

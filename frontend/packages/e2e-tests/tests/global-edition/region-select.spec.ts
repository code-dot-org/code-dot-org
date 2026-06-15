import {expect, test} from '@playwright/test';

import {ArtistLab} from '../pages/artist-lab';
import {SignInPage} from '../pages/sign-in';

test.describe('Global Edition - Region Select', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/region_select.feature
   */
  test(
    'User can switch between the international and regional versions using the language selector on a Studio page',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const signIn = new SignInPage(page);

      await signIn.goto();
      await expect(signIn.selectedLocale).toContainText('English');

      await signIn.selectLocale('فارسی');
      await expect(page).toHaveURL(/\/fa\/users\/sign_in\?lang=fa-IR/);
      await expect(signIn.selectedLocale).toContainText('فارسی');

      // Root redirects to the persisted region (no lang=).
      await page.goto('/');
      await expect(page).toHaveURL(/\/fa\/users\/sign_in/);

      await signIn.selectLocale('English');
      await expect(page).toHaveURL(/\/users\/sign_in\?lang=en-US/);
      await expect(signIn.selectedLocale).toContainText('English');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/region_select.feature
   */
  test(
    'User can switch to regional versions using the language selector on a Lab page',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lab = new ArtistLab(page);

      await lab.new();
      await expect(lab.instructionsTab).toContainText('Instructions');
      await expect(lab.selectedLocale).toContainText('English');

      await lab.selectLabLocale('فارسی');
      await expect(page).toHaveURL(
        /\/fa\/projects\/artist\/.*\/edit\?lang=fa-IR/,
      );
      // Farsi for "Instructions".
      await expect(lab.instructionsTab).toContainText('دستورالعمل');
      await expect(lab.selectedLocale).toContainText('فارسی');

      await lab.selectLabLocale('English');
      await expect(page).toHaveURL(/\/projects\/artist\/.*\/edit\?lang=en-US/);
      await expect(lab.instructionsTab).toContainText('Instructions');
      await expect(lab.selectedLocale).toContainText('English');
    },
  );
});

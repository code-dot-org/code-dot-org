import {expect, test} from '../../fixtures';
import {SignInPage} from '../../pages/sign-in';
import {expectElementHasI18nText} from '../../shared/i18n';

test.describe('Global Edition - Farsi Headers when Signed Out', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'firefox/webkit hit a GE-redirect cookie race (ge_region cookie not applied on the 302 follow)',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/signed_out.feature
   * Scenario: Signed out user should see the correct header links on Dashboard
   */
  test(
    'Signed out user should see the correct header links on Dashboard',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const signIn = new SignInPage(page);
      await signIn.goto({globalRegion: 'fa'});
      await signIn.header.waitForVisible();

      const links: Array<[id: string, key: string]> = [
        ['header-teach', 'nav.header.teach'],
        ['header-about', 'nav.header.about'],
        ['header-csf', 'nav.header.csf'],
        ['header-videos', 'nav.header.videos'],
        ['header-hoa', 'nav.header.hour_of_ai'],
      ];
      for (const [id, key] of links) {
        const link = signIn.header.linkById(id);
        await expect(link).toBeVisible();
        await expectElementHasI18nText({locator: link, locale: 'fa', key});
      }
    },
  );
});

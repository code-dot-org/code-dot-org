import {BasePage} from './base-page';

/** The sign-in page. */
export class SignInPage extends BasePage {
  /** Navigate to /users/sign_in and wait for the locale dropdown. */
  async goto(): Promise<void> {
    await this.page.goto('/users/sign_in');
    await this.waitForLocaleDropdownVisible();
  }

  /** Switch locale via the global dropdown; wait for the full-page nav to settle. */
  async selectLocale(label: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(
        url => url.href.includes('lang=') || !url.pathname.endsWith('/sign_in'),
        {waitUntil: 'domcontentloaded'},
      ),
      this.localeDropdown.selectOption({label}),
    ]);
    await this.waitForLocaleDropdownVisible();
  }
}

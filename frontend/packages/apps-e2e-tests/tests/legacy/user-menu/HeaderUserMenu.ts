import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the dashboard header user menu.
 */
export class HeaderUserMenu {
  private readonly page: Page;
  private readonly createAccountLink: Locator;
  private readonly displayName: Locator;
  private readonly accountSettingsLink: Locator;
  private readonly signOutLink: Locator;

  /**
   * Builds locators for the header controls used by the user-menu scenarios.
   *
   * @param page - Playwright page under test.
   */
  constructor(page: Page) {
    this.page = page;
    this.createAccountLink = page.getByRole('link', {
      name: 'Create account',
    });
    this.displayName = page.locator('.display_name').first();
    this.accountSettingsLink = page.getByRole('link', {
      name: 'Account settings',
    });
    this.signOutLink = page.getByRole('link', {name: 'Sign out'});
  }

  /**
   * Opens the signed-out catalog page after resetting session state.
   */
  async gotoSignedOutCatalog(): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto('/catalog');
  }

  /**
   * Opens the authenticated home page without resetting the current session.
   */
  async gotoHome(): Promise<void> {
    await this.page.goto('/home');
  }

  /**
   * Asserts the signed-out header state from the Cucumber scenario.
   */
  async expectSignedOutState(): Promise<void> {
    await expect(this.createAccountLink).toBeVisible();
    await expect(this.displayName).not.toBeVisible();
  }

  /**
   * Waits for the signed-in header readiness signal and checks the display name.
   *
   * The visible display name replaces the Cucumber wait on `.display_name`.
   *
   * @param expectedName - Name expected in the header.
   */
  async expectDisplayName(expectedName: string): Promise<void> {
    await expect(this.displayName).toBeVisible();
    await expect(this.displayName).toContainText(expectedName);
  }

  /**
   * Opens the user menu from the visible display name.
   */
  async openUserMenu(): Promise<void> {
    await this.displayName.click();
  }

  /**
   * Asserts that the expected user menu links are visible.
   */
  async expectAccountAndSignOutLinks(): Promise<void> {
    await expect(this.accountSettingsLink).toBeVisible();
    await expect(this.signOutLink).toBeVisible();
  }
}

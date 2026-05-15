import {expect, type Locator, type Page} from '@playwright/test';

import {ReportAbusePage} from '../report-abuse/ReportAbusePage';

/**
 * Page object for project report-abuse spam-prevention flows.
 */
export class ReportAbuseSpamPage {
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Creates, names, runs, and saves a project.
   *
   * @param type - project type slug, e.g. "applab" or "gamelab"
   * @param name - project name to save
   */
  async makeNamedProject(type: string, name: string): Promise<void> {
    await this.page.goto(`/projects/${type}/new`);
    await this.page.waitForURL(new RegExp(`/projects/${type}/[^/]+/edit`), {
      timeout: 60_000,
    });
    await this.expectProjectSaved();
    await this.renameProject(name);
    const runButton = this.page.locator('#runButton');
    if (await runButton.isVisible({timeout: 1_000}).catch(() => false)) {
      await runButton.click();
    }
    await this.expectProjectSaved();
  }

  /**
   * Opens the project share dialog and returns the share URL.
   */
  async openShareDialogAndReadUrl(): Promise<string> {
    await this.page.locator('.project_share').click();
    await expect(this.page.locator('#project-share')).toBeVisible({
      timeout: 15_000,
    });
    const copyButton = this.page.locator('#sharing-dialog-copy-button');
    await expect(copyButton).toBeVisible({timeout: 15_000});
    const shareUrl = await copyButton.getAttribute('value');
    if (!shareUrl) {
      throw new Error('share URL not found in #sharing-dialog-copy-button');
    }
    return shareUrl;
  }

  /**
   * Opens the dashboard help menu on a project edit page.
   */
  async openHelpMenu(): Promise<void> {
    await expect(this.page.locator('#help-icon')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('#help-icon').click();
    await expect(this.page.locator('#help-contents')).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * Opens the small footer menu on a project share page.
   */
  async openSmallFooterMenu(): Promise<void> {
    const footerMenuButton = this.page
      .locator('div.small-footer-base button.more-link')
      .first();
    await expect(footerMenuButton).toBeVisible({timeout: 30_000});
    await footerMenuButton.click();
    await expect(this.page.locator('ul#more-menu')).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * Returns the report-abuse link in the open help menu.
   */
  helpReportAbuseLink(): Locator {
    return this.page.locator('#help-contents #report-abuse');
  }

  /**
   * Returns the report-abuse link in the open small footer menu.
   */
  footerReportAbuseLink(): Locator {
    return this.page.locator('ul#more-menu .ui-test-report-abuse');
  }

  /**
   * Returns the share-page "How It Works" footer link.
   */
  footerHowItWorksLink(): Locator {
    return this.page.locator('ul#more-menu .ui-test-how-it-works');
  }

  /**
   * Clicks a report-abuse link, fills the form in the new tab, and returns to
   * the project tab.
   *
   * The report-abuse form heading and submit button are the visible readiness
   * signal. They were confirmed with Agent Browser at /report_abuse.
   *
   * @param link - report-abuse link in the help or footer menu
   */
  async submitAbuseReportFrom(link: Locator): Promise<void> {
    const popupPromise = this.page.context().waitForEvent('page');
    await link.click();
    const popup = await popupPromise;
    await popup.waitForURL(/report_abuse/, {
      timeout: 30_000,
      waitUntil: 'domcontentloaded',
    });

    const reportAbuse = new ReportAbusePage(popup);
    await reportAbuse.fillStudentReport();
    await reportAbuse.submitAndExpectSupportRedirect();
    await popup.close();
    await this.page.bringToFront();
  }

  /**
   * Reloads the project page and waits for the visible saved state.
   */
  async reloadProjectPage(): Promise<void> {
    await this.page.reload({waitUntil: 'domcontentloaded'});
    await this.expectProjectSaved();
  }

  /**
   * Waits for the visible project editor saved state.
   */
  private async expectProjectSaved(): Promise<void> {
    await expect(this.page.locator('.project_updated_at')).toContainText(
      'Saved',
      {timeout: 60_000},
    );
  }

  /**
   * Renames the current project.
   *
   * @param name - project name to save
   */
  private async renameProject(name: string): Promise<void> {
    await this.page.locator('.project_edit').click();
    await this.page.locator('input.project_name').fill(name);
    await this.page.locator('.project_save').click();
    await expect(this.page.locator('.project_edit')).toBeVisible({
      timeout: 15_000,
    });
  }
}

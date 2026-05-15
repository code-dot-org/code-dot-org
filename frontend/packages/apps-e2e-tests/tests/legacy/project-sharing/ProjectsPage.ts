import {expect, type Page} from '@playwright/test';

/**
 * Page object for the dashboard projects landing and project ownership flows.
 */
export class ProjectsPage {
  private readonly page: Page;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the current user's projects page.
   */
  async gotoMyProjects(): Promise<void> {
    await this.page.goto('/projects/');
    await expect(this.page.locator('#uitest-view-full-list')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('#uitest-personal-projects')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Verifies the initial compact set of project-creation links.
   */
  async expectCompactProjectList(): Promise<void> {
    await expect(
      this.page.locator('#projects-page').getByText('Artist', {exact: true}),
    ).toBeVisible();
    await expect(
      this.page
        .locator('#projects-page')
        .getByText('The Amazing World of Gumball', {exact: true}),
    ).not.toBeVisible();
    await expect(this.page.locator('#uitest-personal-projects')).toContainText(
      'You currently have no projects.',
    );
  }

  /**
   * Expands the full project type list.
   */
  async showFullProjectList(): Promise<void> {
    await this.page.locator('#uitest-view-full-list').scrollIntoViewIfNeeded();
    await this.page.locator('#uitest-view-full-list').click();
    await expect(
      this.page
        .locator('#projects-page')
        .getByText('The Amazing World of Gumball', {exact: true}),
    ).toBeVisible({timeout: 15_000});
  }

  /**
   * Starts an anonymous Artist project and waits for the editable page.
   *
   * @returns editable project URL
   */
  async startAnonymousArtistProject(): Promise<string> {
    await this.page.goto('/reset_session');
    await this.page.goto('/projects/artist/new');
    await this.page.waitForURL(/\/projects\/artist\/[^/]+\/edit$/, {
      timeout: 60_000,
    });
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });
    return this.page.url();
  }

  /**
   * Reloads the current project and expects the viewer to retain edit access.
   */
  async expectEditAccessAfterReload(): Promise<void> {
    await this.page.reload({waitUntil: 'domcontentloaded'});
    await expect(this.page).toHaveURL(/\/projects\/artist\/[^/]+\/edit$/, {
      timeout: 60_000,
    });
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });
  }

  /**
   * Opens a saved project URL and waits for ownership-derived edit access.
   *
   * @param url - saved Artist project URL
   */
  async expectEditAccess(url: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(this.page).toHaveURL(/\/projects\/artist\/[^/]+\/edit$/, {
      timeout: 60_000,
    });
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });
  }

  /**
   * Opens a saved project URL and waits for signed-out read-only access.
   *
   * @param url - saved Artist project URL
   */
  async expectViewAccess(url: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(this.page).toHaveURL(/\/projects\/artist\/[^/]+\/view$/, {
      timeout: 60_000,
    });
  }
}

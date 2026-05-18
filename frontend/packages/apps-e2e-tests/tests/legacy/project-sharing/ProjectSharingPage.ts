import {expect, type Locator, type Page} from '@playwright/test';

import {GameLab} from '../activities/gamelab/GameLab';

/**
 * Page object for shared project creation and share-page navigation flows.
 */
export class ProjectSharingPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Creates a new project from the project-family route.
   *
   * @param type - project type slug, e.g. "gamelab"
   */
  async makeProjectFromFamilyRoute(type: string): Promise<void> {
    await this.page.goto(`/projects/${type}`);
    await this.page.waitForURL(new RegExp(`/projects/${type}/[^/]+/edit`), {
      timeout: 60_000,
    });
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });
    await expect(this.page.locator('.project_updated_at')).toContainText(
      'Saved',
      {timeout: 60_000},
    );
  }

  /**
   * Creates a new Game Lab project and waits for the first save.
   *
   * @returns Game Lab page object for editor interactions
   */
  async makeGameLabProject(): Promise<GameLab> {
    const gamelab = new GameLab(this.page);
    await this.page.goto('/projects/gamelab');
    await this.page.waitForURL(/\/projects\/gamelab\/[^/]+\/edit/, {
      timeout: 60_000,
    });
    await this.expectProjectEditorSaved();
    return gamelab;
  }

  /**
   * Renames the current project through the project title edit control.
   *
   * @param name - project title to save
   */
  async renameProject(name: string): Promise<void> {
    await this.page.locator('.project_edit').click();
    await this.page.locator('input.project_name').fill(name);
    await this.page.locator('.project_save').click();
    await expect(this.page.locator('.project_edit')).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * Opens the project share dialog and returns the copied share URL.
   *
   * @returns absolute share URL
   */
  async openShareDialogAndReadUrl(): Promise<string> {
    await this.page.locator('.project_share').first().click();
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
   * Opens a share URL and waits for the visible share-page controls.
   *
   * @param shareUrl - share URL to open
   */
  async gotoSharePage(shareUrl: string): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.page.goto(shareUrl, {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      });

      try {
        await this.expectShareControls();
        return;
      } catch (error) {
        lastError = error;
        const reloadLink = this.reloadLink();
        if (await reloadLink.isVisible({timeout: 1_000}).catch(() => false)) {
          await reloadLink.click();
          try {
            await this.expectShareControls();
            return;
          } catch (reloadError) {
            lastError = reloadError;
          }
        }
      }
    }

    throw lastError;
  }

  /**
   * Clicks the visible "View code" link on a share page.
   */
  async clickViewCode(): Promise<void> {
    await this.makeLinksOpenInCurrentTab();
    await this.viewCodeLink().click();
  }

  /**
   * Opens "How it Works (View Code)" from the share-page footer menu.
   */
  async openHowItWorksFromFooter(): Promise<void> {
    await this.makeLinksOpenInCurrentTab();
    const footerMenuButton = this.page.locator('#footerDiv .more-link').first();
    await expect(footerMenuButton).toBeVisible({timeout: 30_000});
    await footerMenuButton.evaluate(element =>
      (element as HTMLElement).click(),
    );
    await expect(this.page.locator('#more-menu')).toBeVisible({
      timeout: 15_000,
    });
    await this.page
      .locator('#footerDiv a', {hasText: 'How it Works (View Code)'})
      .first()
      .click();
  }

  /**
   * Verifies the editable Game Lab workspace is visible.
   */
  async expectEditableCodeWorkspace(): Promise<void> {
    await this.expectCodeWorkspace(false);
  }

  /**
   * Verifies the read-only Game Lab workspace is visible.
   */
  async expectReadonlyCodeWorkspace(): Promise<void> {
    await this.expectCodeWorkspace(true);
  }

  /**
   * Force share-page links to stay in the current Playwright page.
   */
  private async makeLinksOpenInCurrentTab(): Promise<void> {
    await this.page.locator('a[target]').evaluateAll(links => {
      for (const link of links) {
        link.removeAttribute('target');
      }
    });
  }

  /**
   * Returns the visible share-page "View code" action.
   */
  private viewCodeLink(): Locator {
    return this.page.locator('.WireframeButtons_button', {
      hasText: 'View code',
    });
  }

  /**
   * Waits for the Game Lab code workspace, using the visible reload affordance
   * if the lab reports that it is taking longer than usual.
   *
   * @param readonly - whether the workspace should be in read-only mode
   */
  private async expectCodeWorkspace(readonly: boolean): Promise<void> {
    const workspace = this.page.locator('#codeWorkspace');

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await expect(workspace).toBeVisible({timeout: 60_000});
        if (readonly) {
          await expect(workspace).toHaveClass(/readonly/);
        } else {
          await expect(workspace).not.toHaveClass(/readonly/);
        }
        return;
      } catch (error) {
        const reloadLink = this.page.getByRole('link', {
          name: 'Try reloading the page',
        });
        if (
          attempt === 2 ||
          !(await reloadLink.isVisible({timeout: 1_000}).catch(() => false))
        ) {
          throw error;
        }
        await reloadLink.click();
      }
    }
  }

  /**
   * Waits for the visible controls on the Game Lab share page.
   */
  private async expectShareControls(): Promise<void> {
    await expect(this.page.locator('.small-footer-base')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.viewCodeLink()).toBeVisible({timeout: 30_000});
  }

  /**
   * Returns the page's visible long-load recovery link.
   */
  private reloadLink(): Locator {
    return this.page.getByRole('link', {name: 'Try reloading the page'});
  }

  /**
   * Waits for the Game Lab editor and its visible saved state.
   */
  private async expectProjectEditorSaved(): Promise<void> {
    const runButton = this.page.locator('#runButton');

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await expect(runButton).toBeVisible({timeout: 60_000});
        await expect(this.page.locator('.project_updated_at')).toContainText(
          'Saved',
          {timeout: 60_000},
        );
        return;
      } catch (error) {
        const reloadLink = this.reloadLink();
        if (
          attempt === 2 ||
          !(await reloadLink.isVisible({timeout: 1_000}).catch(() => false))
        ) {
          throw error;
        }
        await reloadLink.click();
      }
    }
  }
}

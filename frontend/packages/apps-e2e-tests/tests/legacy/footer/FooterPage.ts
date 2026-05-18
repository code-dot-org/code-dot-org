import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the legacy small footer visual smoke tests.
 */
export class FooterPage {
  readonly page: Page;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens a legacy Blockly level and waits for the visible lab/footer signals.
   *
   * @param url - level URL path
   */
  async openLevel(
    url: string,
    options: {waitForBlocklyWorkspace?: boolean} = {},
  ): Promise<void> {
    const {waitForBlocklyWorkspace = true} = options;
    await this.page.goto(url);
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });
    await this.dismissInstructionsOverlayIfPresent();
    if (waitForBlocklyWorkspace) {
      await this.expectBlocklyWorkspaceReady();
    }
    await this.expectSmallFooter();
  }

  /**
   * Verifies the small footer is mounted.
   */
  async expectSmallFooter(): Promise<void> {
    await expect(this.page.locator('.small-footer-base')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the copyright dialog from the footer and verifies its controls.
   */
  async openCopyrightDialog(): Promise<void> {
    await this.page
      .getByRole('button', {name: /copyright/i})
      .evaluate(element => (element as HTMLElement).click());
    await expect(this.copyrightDialog()).toBeVisible({timeout: 15_000});
  }

  /**
   * Closes the active footer dialog.
   */
  async closeDialog(): Promise<void> {
    await this.page.locator('#ui-close-dialog').click();
    await expect(this.copyrightDialog()).toBeHidden({
      timeout: 15_000,
    });
  }

  /**
   * Opens a footer menu on a share page.
   */
  async openSmallFooterMenu(): Promise<void> {
    const menuButton = this.page.locator('#footerDiv .more-link').first();
    await expect(menuButton).toBeVisible({timeout: 30_000});
    await menuButton.evaluate(element => (element as HTMLElement).click());
    await expect(this.page.locator('#more-menu')).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * Selects a named item from the small footer menu.
   *
   * @param itemText - visible item text
   */
  async selectSmallFooterItem(itemText: string): Promise<void> {
    await this.page
      .locator('#footerDiv a', {hasText: itemText})
      .first()
      .click();
  }

  /**
   * Dismisses the first-load instructions curtain if it is blocking controls.
   */
  private async dismissInstructionsOverlayIfPresent(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 1_000}).catch(() => false)) {
      await overlay.evaluate(element => (element as HTMLElement).click());
      await overlay.waitFor({state: 'hidden', timeout: 10_000});
    }
  }

  /**
   * Waits for Blockly chrome and SVG workspace layout to settle before visual
   * checks. The footer scenarios load Blockly levels, and the small footer can
   * be visible before Blockly finishes its first layout pass.
   */
  private async expectBlocklyWorkspaceReady(): Promise<void> {
    await expect(this.page.locator('#codeWorkspace')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('#workspace-header')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('.blocklySvg').first()).toBeVisible({
      timeout: 30_000,
    });
    await this.page.waitForFunction(
      () =>
        new Promise<boolean>(resolve => {
          const selectors = [
            '#visualizationColumn',
            '#codeWorkspace',
            '#workspace-header',
            '#toolbox-header',
            '.blocklySvg',
            '.blocklyWorkspace',
          ];
          let previous = '';
          let stableFrames = 0;
          const signature = () =>
            selectors
              .flatMap(selector =>
                Array.from(document.querySelectorAll(selector)),
              )
              .map(element => {
                const box = element.getBoundingClientRect();
                return [
                  Math.round(box.x),
                  Math.round(box.y),
                  Math.round(box.width),
                  Math.round(box.height),
                  element.textContent?.trim(),
                ].join(':');
              })
              .join('|');

          const check = () => {
            const current = signature();
            stableFrames = current === previous ? stableFrames + 1 : 0;
            previous = current;
            if (stableFrames >= 5) {
              resolve(true);
            } else {
              requestAnimationFrame(check);
            }
          };
          requestAnimationFrame(check);
        }),
      undefined,
      {timeout: 15_000},
    );
  }

  /**
   * Returns the copyright dialog, excluding the persistent OneTrust dialog.
   */
  copyrightDialog(): Locator {
    return this.page.getByRole('dialog', {name: 'Copyright'});
  }
}

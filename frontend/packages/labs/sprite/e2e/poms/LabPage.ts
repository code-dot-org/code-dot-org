import {type Page} from 'playwright/test';

/**
 * Base Page Object for the Sprite Lab standalone dev server.
 *
 * Contains shared locators and navigation helpers. Extend this class to add
 * feature-specific interactions as the lab grows.
 */
export class LabPage {
  constructor(readonly page: Page) {}

  /** The Code tab, which every fixture but the image level shows. */
  get codeTab() {
    return this.page.getByRole('tab', {name: 'Code'});
  }

  /** The scene's Blockly workspace. */
  get workspace() {
    return this.page.locator('.blocklySvg').first();
  }

  /** Navigate to the standalone dev server root: the `simple` fixture. */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Navigate and wait for the lab to show its Code tab.
   *
   * @returns Loaded LabPage instance.
   */
  static async load(page: Page): Promise<LabPage> {
    const lab = new LabPage(page);
    await lab.goto();
    await lab.codeTab.waitFor({state: 'visible', timeout: 10_000});
    return lab;
  }
}

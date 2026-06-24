import {expect, type Locator, type Page} from '@playwright/test';

import {AuthoredHintsComponent} from '../components/authored-hints';
import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {BasePage} from './base-page';

/** Base for legacy Blockly labs (maze, artist, flappy, ...). */
export class LegacyBlocklyLab extends BasePage {
  /** Instructions tab; its text localizes with the lab locale. */
  readonly instructionsTab: Locator;

  /** Outer instructions container; authored hint content is appended here. */
  readonly instructionsPanel: Locator;

  /** Authored hints (lightbulb, count badge, "Yes" prompt) in the CSF instructions UI. */
  readonly hints: AuthoredHintsComponent;

  /** Run button; id is the stable test handle rendered by the lab chrome. */
  readonly runButton: Locator;

  /** Loading spinner in #codeApp; present until the lab boots, then removed — the load-complete signal. */
  readonly loadingSpinner: Locator;

  /** Reset button; appears after a run completes. */
  readonly resetButton: Locator;

  /** Inline feedback panel rendered below the instructions after an incorrect solution. */
  readonly inlineFeedback: Locator;

  constructor(page: Page) {
    super(page);
    this.instructionsTab = page.locator('.uitest-instructionsTab');
    this.instructionsPanel = page.locator('.csf-top-instructions');
    this.hints = new AuthoredHintsComponent(page);
    this.runButton = page.locator('#runButton');
    this.loadingSpinner = page.locator('#codeApp .loading');
    this.resetButton = page.locator('#resetButton');
    this.inlineFeedback = page.locator(
      '.uitest-topInstructions-inline-feedback',
    );
  }

  /**
   * Navigate to a lab level and wait for the lab. domcontentloaded, not 'load':
   * the lab is interactive long before all subresources, and 'load' can exceed
   * the test timeout on webkit.
   */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /** Wait for the lab to be interactive: run button, header, overlay dismissed, header settled. */
  async waitForReady(): Promise<void> {
    // #runButton mounts on window 'load'; a cold or contended boot can exceed 15s.
    const LAB_LOAD_TIMEOUT_MS = 45_000;
    await expect(this.loadingSpinner).toBeHidden({
      timeout: LAB_LOAD_TIMEOUT_MS,
    });
    await expect(this.runButton).toBeVisible({timeout: LAB_LOAD_TIMEOUT_MS});
    await this.waitForSignedIn();
    // Dismiss the instructions overlay if shown (anonymous sessions).
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible()) {
      await overlay.click();
    }
    // Let the header animation finish.
    await expect(this.page.locator('#header_middle_content')).toHaveCSS(
      'opacity',
      '1',
    );
  }

  /** Switch locale via the global dropdown; wait for the lab to reload. */
  async selectLabLocale(label: string): Promise<void> {
    // Require a CHANGED url: the pre-switch URL may already carry lang=.
    const previousUrl = this.page.url();
    await Promise.all([
      this.page.waitForURL(
        url => url.href !== previousUrl && url.href.includes('lang='),
        {waitUntil: 'domcontentloaded'},
      ),
      this.localeDropdown.selectOption({label}),
    ]);
    await this.waitForReady();
  }
}

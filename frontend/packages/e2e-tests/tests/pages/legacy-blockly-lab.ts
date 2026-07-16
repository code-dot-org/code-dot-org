import {expect, type Locator, type Page} from '@playwright/test';

import {AuthoredHintsComponent} from '../components/authored-hints';
import {CalloutsComponent} from '../components/callouts';
import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';
import {waitUntilStable} from '../shared/stability';

import {LessonLevelPage} from './lesson-level-page';

/** Base for legacy Blockly labs (maze, artist, flappy, ...). */
export class LegacyBlocklyLab extends LessonLevelPage {
  /** Instructions tab; its text localizes with the lab locale. */
  readonly instructionsTab: Locator;

  /** Outer instructions container; authored hint content is appended here. */
  readonly instructionsPanel: Locator;

  /** Authored hints (lightbulb, count badge, "Yes" prompt) in the CSF instructions UI. */
  readonly hints: AuthoredHintsComponent;

  /** Callouts (qTip tooltips) the code-studio level chrome renders over the lab. */
  readonly callouts: CalloutsComponent;

  /** Run button; id is the stable test handle rendered by the lab chrome. */
  readonly runButton: Locator;

  /** Loading spinner in #codeApp; present until the lab boots, then removed — the load-complete signal. */
  readonly loadingSpinner: Locator;

  /** Reset button; appears after a run completes. */
  readonly resetButton: Locator;

  /** Show Code header toggle; opens the program's code dialog. */
  readonly showCodeHeader: Locator;

  /** Inline feedback panel rendered below the instructions after an incorrect solution. */
  readonly inlineFeedback: Locator;

  /** Congratulations overlay shown on puzzle completion. */
  readonly congratsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.instructionsTab = page.locator('.uitest-instructionsTab');
    this.instructionsPanel = page.locator('.csf-top-instructions');
    this.hints = new AuthoredHintsComponent(page);
    this.callouts = new CalloutsComponent(page);
    this.runButton = page.locator('#runButton');
    this.loadingSpinner = page.locator('#codeApp .loading');
    this.resetButton = page.locator('#resetButton');
    this.showCodeHeader = page.locator('#show-code-header');
    this.inlineFeedback = page.locator(
      '.uitest-topInstructions-inline-feedback',
    );
    this.congratsMessage = page.locator('.congrats');
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

  /**
   * Navigate to an arbitrary level URL and wait for the lab. For levels whose
   * shape labLevelUrl does not model — standalone /hoc/N paths, or course levels
   * carrying extra query params (e.g. show_callouts). Same wait strategy as
   * gotoLevel; prefer gotoLevel when labLevelUrl can build the URL.
   */
  async gotoLevelUrl(url: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /**
   * Dismiss the sign-in reminder if present. It renders in the project-backed
   * level header for some anonymous sessions; the Close button is scoped to the
   * reminder so it cannot match another dialog's. Cucumber: "I dismiss the login reminder".
   */
  async dismissLoginReminder(): Promise<void> {
    const reminder = this.page.locator('.uitest-signincallout');
    if (await reminder.isVisible()) {
      await reminder.locator("[aria-label='Close']").click();
      await reminder.waitFor({state: 'hidden'});
    }
  }

  /** Wait for the lab to be interactive: run button, header, overlay dismissed, header settled. */
  async waitForReady(): Promise<void> {
    // #runButton mounts on window 'load'; a cold or contended boot can exceed 15s.
    const LAB_LOAD_TIMEOUT_MS = 45_000;
    await expect(this.loadingSpinner).toBeHidden({
      timeout: LAB_LOAD_TIMEOUT_MS,
    });
    await expect(this.runButton).toBeVisible({timeout: LAB_LOAD_TIMEOUT_MS});
    // State-agnostic: labs boot for anonymous sessions too, so wait for the
    // header user area in either auth state, not specifically signed-in.
    await this.header.waitForUserChrome();
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

  /** Clear the workspace, then arrange and load the given blocks XML via the lab's test-only interface. */
  async loadArrangedBlocksXml(blocksXml: string): Promise<void> {
    await expect
      .poll(() =>
        this.page.evaluate(() => Boolean(window.Blockly?.mainBlockSpace)),
      )
      .toBe(true);

    await this.page.evaluate((xml: string) => {
      const {Blockly, __TestInterface} = window;
      if (!Blockly || !__TestInterface) {
        throw new Error('Blockly test globals unavailable');
      }
      Blockly.mainBlockSpace.clear();
      __TestInterface.loadBlocks(__TestInterface.arrangeBlockPosition(xml, {}));
    }, blocksXml);
  }

  /** A block's rendered SVG group, keyed by its Blockly block id. */
  blockLocator(blockId: string): Locator {
    return this.page.locator(`.blocklySvg [data-id="${blockId}"]`);
  }

  /**
   * A block's workspace offset from its SVG translate transform. Auto-layout can
   * nudge a block over a few frames after it attaches, so wait for it to settle.
   */
  async blockOffset(blockId: string): Promise<{x: number; y: number}> {
    await waitUntilStable(this.blockLocator(blockId));
    return this.page.evaluate((id: string) => {
      const block = document.querySelector<SVGGElement>(
        `.blocklySvg [data-id="${id}"]`,
      );
      if (!block) {
        throw new Error(`Blockly block ${id} was not found`);
      }
      const transform = block.transform.baseVal.getItem(0);
      return {x: transform.matrix.e, y: transform.matrix.f};
    }, blockId);
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
      this.footer.localeDropdown.selectOption({label}),
    ]);
    await this.waitForReady();
  }

  /**
   * Load a Blockly workspace from a serialization object. Mirrors
   * load_json_blocks() from blockly_initialization_blocks.rb.
   */
  async loadBlocks(blocksJson: object): Promise<void> {
    await this.page.waitForFunction(() =>
      Boolean(window.Blockly?.getMainWorkspace()),
    );
    await this.page.evaluate(state => {
      const blockly = window.Blockly;
      const workspace = blockly?.getMainWorkspace();
      if (!blockly || !workspace) {
        throw new Error(
          'Blockly main workspace unavailable when loading blocks',
        );
      }
      blockly.serialization.workspaces.load(state, workspace);
    }, blocksJson);
  }

  /** Click Run to execute the current workspace program. */
  async run(): Promise<void> {
    await this.runButton.click();
  }
}

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

  /** Instructions paragraph text; localizes with the lab locale. */
  readonly instructionsText: Locator;

  /** CSF instructions More/Less toggle (apps/src/templates/instructions/CollapserButton.jsx). */
  readonly instructionsToggleButton: Locator;

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

  /**
   * Show Code dialog's overlay (the DSCO Modal's role="presentation" backdrop,
   * mounted on #showCodeModal appended to body). Carries the modal-backdrop
   * z-index; this is the element whose stacking sits in front of the callouts.
   */
  readonly showCodeModalOverlay: Locator;

  /** Inline feedback panel rendered below the instructions after an incorrect solution. */
  readonly inlineFeedback: Locator;

  /** Congratulations overlay shown on puzzle completion. */
  readonly congratsMessage: Locator;

  /**
   * The maze/game visualization surface (#visualization, see
   * apps/src/maze/Visualization.jsx). Sprite art (e.g. idle-animation frames)
   * can render mid-transition when the screenshot is taken, so visual checks
   * that don't care about the exact playfield frame should mask this.
   */
  readonly visualization: Locator;

  /** Continue button on the shared feedback/congrats dialog, rendered for all legacy Blockly labs. */
  readonly continueButton: Locator;

  /**
   * Read-only Blockly workspaces embedded inline in markdown instructions
   * (see convertXmlToBlockly() in apps/src/templates/instructions/utils.js).
   * Empty if this level's instructions have no embedded blocks.
   */
  readonly embeddedInstructionBlocks: Locator;

  /** CSS: no accessible role or name (a11y gap), just a div around the modal's Blockly workspace. */
  readonly functionEditorContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.instructionsTab = page.locator('.uitest-instructionsTab');
    this.instructionsPanel = page.locator('.csf-top-instructions');
    this.instructionsText = page.locator('.csf-top-instructions p');
    this.instructionsToggleButton = page.locator('#toggleButton');
    this.hints = new AuthoredHintsComponent(page);
    this.callouts = new CalloutsComponent(page);
    this.runButton = page.locator('#runButton');
    this.loadingSpinner = page.locator('#codeApp .loading');
    this.resetButton = page.locator('#resetButton');
    this.showCodeHeader = page.locator('#show-code-header');
    this.showCodeModalOverlay = page.locator(
      '#showCodeModal [role="presentation"]',
    );
    this.inlineFeedback = page.locator(
      '.uitest-topInstructions-inline-feedback',
    );
    this.congratsMessage = page.locator('.congrats');
    this.visualization = page.locator('#visualization');
    this.continueButton = page.locator('#continue-button');
    this.embeddedInstructionBlocks = page.locator(
      '.readonly-block-space-container',
    );
    this.functionEditorContainer = page.locator(
      '[class*="modalFunctionEditorContainer"]',
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

  /**
   * Navigate to an arbitrary level URL and wait for the lab. For levels whose
   * shape labLevelUrl does not model, e.g. course levels carrying extra query
   * params (show_callouts). Same wait strategy as gotoLevel; prefer gotoLevel
   * when labLevelUrl can build the URL.
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

  /** Hook for lab-specific modals that must clear before the instructions overlay; see CraftLab. */
  protected async dismissLabInterstitials(): Promise<void> {}

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
    // Both of these stack above the instructions overlay handled below, whose
    // OK-dialog click they would otherwise intercept.
    await this.introVideoModal.dismissIfShown();
    await this.dismissLabInterstitials();
    // Dismiss the instructions overlay if shown (anonymous sessions). Its
    // backdrop (#overlay) fills the viewport and a plain .click() lands on
    // the default center point, which the instructions dialog itself can
    // cover for levels with enough instructions text — that dialog then
    // intercepts the click instead of the backdrop underneath it (see
    // apps/src/templates/Overlay.jsx, apps/src/templates/instructions/
    // InstructionsCsfMiddleCol.jsx). Click the dialog's own OK button
    // instead: same dismissal (closeOverlay), no coordinate guessing.
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible()) {
      const dialogOk = this.page.getByRole('button', {
        name: 'OK',
        exact: true,
      });
      // Retry the dismissal until the overlay actually hides. On firefox the
      // first click can land before the dialog's onClick (closeOverlay) is
      // bound and silently no-op, leaving the overlay up; re-clicking once the
      // handler is attached clears it.
      await expect(async () => {
        if (await dialogOk.isVisible()) {
          await dialogOk.click();
        } else {
          await overlay.click();
        }
        await expect(overlay).toBeHidden({timeout: 2_000});
      }).toPass({timeout: LAB_LOAD_TIMEOUT_MS});
    }
    // Let the header animation finish.
    await expect(this.page.locator('#header_middle_content')).toHaveCSS(
      'opacity',
      '1',
    );
  }

  /**
   * Wait for embedded Blockly workspaces in markdown instructions to render
   * and settle. Creation is gated on a GET /user_preference/theme
   * round-trip that MarkdownInstructions never awaits, so a container can
   * still be 0x0 well after waitForReady()/waitForVisualStability resolve;
   * a FieldImage inside (e.g. a K1 harvester block) can also resize again
   * once its icon loads. No-op if this level's instructions have no
   * embedded blocks.
   */
  async waitForEmbeddedInstructionsStable(): Promise<void> {
    const count = await this.embeddedInstructionBlocks.count();
    for (let i = 0; i < count; i++) {
      const block = this.embeddedInstructionBlocks.nth(i);
      await expect(async () => {
        const box = await block.boundingBox();
        expect(
          box?.width,
          'embedded Blockly workspace has not rendered yet',
        ).toBeGreaterThan(0);
      }).toPass({intervals: [120], timeout: 15_000});
      await waitUntilStable(block);
    }
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
   * A toolbox category's label, by 1-based position. Blockly exposes the
   * toolbox as an ARIA tree, so by position rather than by name: the name is
   * the locale-dependent text under test. The accessibility tree also omits
   * the duplicate non-interactive toolbox some lessons render, which a
   * `:visible` CSS filter would have had to exclude by hand.
   */
  toolboxCategoryLabel(index: number): Locator {
    return this.mainContent
      .getByRole('tree')
      .getByRole('treeitem')
      .nth(index - 1);
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

  /** Click Continue on the post-run feedback dialog; typically triggers a real navigation to the next level. */
  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /** Click Reset to clear the run result and return the workspace to its pre-run state. */
  async reset(): Promise<void> {
    await this.resetButton.click();
  }
}

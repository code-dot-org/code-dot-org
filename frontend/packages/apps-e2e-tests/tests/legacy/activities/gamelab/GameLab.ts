import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for Game Lab — p5.js + Blockly CSF activity.
 *
 * Uses allthethingscourse lesson 19.
 * Extends LegacyBlocklyLab for the shared run/reset/congrats interface.
 * Adds animation-tab switching and console inspection.
 */
export class GameLab extends LegacyBlocklyLab {
  /** Mode toggle: switches to code view. */
  readonly codeMode: Locator;

  /** Mode toggle: switches to animation-tab view. */
  readonly animationMode: Locator;

  /** "+" button in the animation list — present when animation tab is open. */
  readonly animationListNewItem: Locator;

  /** Debug/console output div — `#debug-output`. */
  readonly consoleOutput: Locator;

  /** Assessment submit button, present after running a submittable level. */
  readonly submitButton: Locator;

  /** Assessment unsubmit button, present after submitted work reloads. */
  readonly unsubmitButton: Locator;

  /** Confirmation button in the unsubmit modal. */
  readonly confirmButton: Locator;

  /** Piskel editor iframe. */
  readonly piskelFrame: FrameLocator;

  constructor(page: Page) {
    super(page);
    this.codeMode = page.locator('#codeMode');
    this.animationMode = page.locator('#animationMode');
    this.animationListNewItem = page.locator('#newListItem');
    this.consoleOutput = page.locator('#debug-output');
    this.submitButton = page.locator('#submitButton');
    this.unsubmitButton = page.locator('#unsubmitButton');
    this.confirmButton = page.locator('#confirm-button');
    this.piskelFrame = page.frameLocator('iframe[src*="piskel"]');
  }

  /** Lesson 19 of allthethingscourse — used by reloadLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(19, level);
  }

  /**
   * Navigate to a new Game Lab project and wait for the animation library
   * manifest to be parsed and rendered before returning.
   *
   * Must be used instead of `goto('/projects/gamelab/new') + waitForLabPage()`
   * when the test will interact with the animation picker. The fetch probe must
   * be installed BEFORE navigation so it can wrap the manifest response's
   * json() method. Waiting for the response alone is too early; that only means
   * the headers arrived, not that P5LabView has parsed JSON and set React state.
   *
   * Without this readiness signal, AnimationPickerBody.componentDidMount calls
   * searchAssets() with the initial empty manifest ({}) and crashes:
   *   Object.keys({}.aliases) → TypeError: Cannot convert undefined or null
   * That error unmounts the entire lab React tree (blank page).
   */
  async gotoNewProject(): Promise<void> {
    await this.page.addInitScript(() => {
      const win = window as typeof window & {
        __gamelabManifestProbeInstalled?: boolean;
        __gamelabManifestReady?: boolean;
      };
      if (win.__gamelabManifestProbeInstalled) {
        return;
      }
      win.__gamelabManifestProbeInstalled = true;

      const originalFetch = win.fetch.bind(win);
      win.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const request = args[0];
        const url =
          typeof request === 'string'
            ? request
            : request instanceof Request
              ? request.url
              : request instanceof URL
                ? request.href
                : '';

        if (url.includes('/api/v1/animation-library/manifest/gamelab')) {
          const originalJson = response.json.bind(response);
          response.json = async () => {
            const manifest = await originalJson();
            win.__gamelabManifestReady = Boolean(
              manifest?.aliases && manifest?.categories && manifest?.metadata,
            );
            return manifest;
          };
        }
        return response;
      };
    });

    const manifestReady = this.page.waitForResponse(
      r =>
        r.url().includes('/api/v1/animation-library/manifest/gamelab') &&
        r.status() === 200,
      {timeout: 30_000},
    );
    await this.page.goto('/projects/gamelab/new');
    await this.waitForLabPage();
    await manifestReady;
    await this.page.waitForFunction(
      () =>
        Boolean(
          (
            window as typeof window & {
              __gamelabManifestReady?: boolean;
            }
          ).__gamelabManifestReady,
        ),
      undefined,
      {timeout: 30_000},
    );
    await this.page.evaluate(
      () =>
        new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  }

  /**
   * Switch to the animation tab.
   * Clicks #animationMode and waits for the #newListItem ("+") button.
   * Mirrors `When I switch to the animation tab` from gamelab.rb.
   */
  async switchToAnimationTab(): Promise<void> {
    await this.animationMode.click();
    await this.animationListNewItem.waitFor({state: 'visible'});
  }

  /**
   * Switch back to code view from the animation tab.
   * Uses JS evaluate to click #codeMode, matching the Cucumber
   * `I switch to the code tab in Game Lab` step (jQuery-based click).
   */
  async switchToCodeTab(): Promise<void> {
    await this.page.evaluate(() => {
      (document.querySelector('#codeMode') as HTMLElement)?.click();
    });
    await this.runButton.waitFor({state: 'visible'});
  }

  /**
   * Count of animations in the animation column (excludes the "+" new-item button).
   * Mirrors `I see N animations in the animation column` from gamelab.rb.
   */
  async animationCount(): Promise<number> {
    return this.page.evaluate(() => {
      const buttons = document.querySelectorAll(
        '.animationList > div > button',
      );
      const newItem = document.querySelector('#newListItem');
      let count = 0;
      buttons.forEach(btn => {
        if (btn !== newItem) count++;
      });
      return count;
    });
  }

  /**
   * Wait until user code has entered the Game Lab draw loop.
   *
   * This replaces the Cucumber step's fixed two-second sleep.  The user-visible
   * control state is #resetButton; tickCount confirms the Game Lab runtime
   * has drawn frames, which is when missing-animation console errors surface.
   */
  async waitForDrawLoop(): Promise<void> {
    await expect(this.resetButton).toBeVisible({timeout: 15_000});
    await this.page.waitForFunction(
      () => {
        const win = window as typeof window & {
          __mostRecentGameLabInstance?: {tickCount?: number};
        };
        return (win.__mostRecentGameLabInstance?.tickCount ?? 0) > 1;
      },
      undefined,
      {timeout: 15_000},
    );
  }

  /**
   * Open the animation picker by clicking #newListItem via JS.
   * Mirrors `I open the animation picker` from gamelab.rb:
   *   execute_script("$(\"#newListItem\")[0].click();")
   */
  async openAnimationPicker(): Promise<void> {
    await this.page.evaluate(() => {
      (document.querySelector('#newListItem') as HTMLElement)?.click();
    });
    await this.page
      .locator('.modal .uitest-animation-picker-list')
      .last()
      .waitFor({state: 'visible', timeout: 30_000});
  }

  /**
   * Select the first blank-animation tile in the picker.
   * Mirrors `I select a blank animation`:
   *   $(".uitest-animation-picker-list>div>div>div>button")[0].click()
   */
  async selectBlankAnimation(): Promise<void> {
    const blankAnimations = this.page.locator(
      '.modal .uitest-animation-picker-list>div>div>div>button',
    );
    await expect(blankAnimations.last()).toBeVisible({timeout: 30_000});
    await blankAnimations.last().click();
  }

  /**
   * Select the Animals category tab in the animation library picker.
   * Mirrors `I select the animal category of the animation library`:
   *   waits for img[src*='/category_animals.png'] then clicks index [1]
   */
  async selectAnimalCategory(): Promise<void> {
    await expect(
      this.page.locator("img[src*='/category_animals.png']").last(),
    ).toBeVisible({timeout: 30_000});
    await this.page.locator("img[src*='/category_animals.png']").last().click();
  }

  /**
   * Click the bear animal-head thumbnail in the animal category.
   * Mirrors `I select the bear animal head animation from the animal category`:
   *   waits for img[src*='/category_animals/animalhead_bear.png'] then clicks [0]
   */
  async selectBearAnimation(): Promise<void> {
    await expect(
      this.page
        .locator(".modal img[src*='/category_animals/animalhead_bear.png']")
        .last(),
    ).toBeVisible({timeout: 30_000});
    await this.page
      .locator(".modal img[src*='/category_animals/animalhead_bear.png']")
      .last()
      .click();
  }

  /**
   * Click the animation picker's "done" button.
   * Mirrors `I select the animation picker 'done' button`:
   *   clicks .ui-test-selector-done-button once visible
   */
  async clickAnimationPickerDone(): Promise<void> {
    await this.page
      .locator('.modal .ui-test-selector-done-button')
      .last()
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page
      .locator('.modal .ui-test-selector-done-button')
      .last()
      .click();
  }

  /**
   * Add a new blank animation: open picker → select blank tile.
   * Mirrors `I add a new, blank animation` from gamelab.rb.
   */
  async addBlankAnimation(): Promise<void> {
    await this.openAnimationPicker();
    await this.selectBlankAnimation();
  }

  /**
   * Add bear animation from library: open picker → Animals category → bear → done.
   * Mirrors `I add the bear animal head animation from the library` from gamelab.rb.
   */
  async addBearAnimation(): Promise<void> {
    await this.openAnimationPicker();
    await this.selectAnimalCategory();
    await this.selectBearAnimation();
    await this.clickAnimationPickerDone();
  }

  /**
   * Wait for Piskel to render the editor toolbar in its same-origin iframe.
   */
  async waitForPiskelEditor(): Promise<void> {
    await expect(this.piskelFrame.locator('.icon-tool-pen')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Download the current Piskel animation as a GIF from the export panel.
   */
  async exportGif(): Promise<void> {
    await expect(
      this.piskelFrame.locator('.icon-settings-export-white').first(),
    ).toBeVisible({timeout: 30_000});
    await expect(this.piskelFrame.locator('#loadingMask')).not.toBeVisible({
      timeout: 30_000,
    });

    const unsupportedDialogClose = this.piskelFrame.locator(
      '.unsupported-browser .dialog-close',
    );
    if (await unsupportedDialogClose.isVisible().catch(() => false)) {
      await unsupportedDialogClose.click();
    }

    await this.piskelFrame
      .locator('.icon-settings-export-white')
      .first()
      .click();
    await expect(
      this.piskelFrame.locator('.gif-download-button').first(),
    ).toBeVisible({timeout: 15_000});
    const download = this.page.waitForEvent('download', {timeout: 30_000});
    await this.piskelFrame.locator('.gif-download-button').first().click();
    await download;
  }

  /**
   * Submit the current Game Lab assessment level.  The legacy Cucumber step
   * clicks submit directly; unlike App Lab, this path does not show a confirm
   * modal before the page navigates.
   */
  async submitAssessment(): Promise<void> {
    await this.run();
    await expect(this.submitButton).toBeVisible({timeout: 30_000});
    await Promise.all([
      this.page.waitForEvent('framenavigated', {
        predicate: frame => frame === this.page.mainFrame(),
        timeout: 30_000,
      }),
      this.submitButton.click(),
    ]);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Unsubmit the current Game Lab assessment and wait for the full-page reload
   * kicked off by the modal confirmation button.
   */
  async unsubmitAssessment(): Promise<void> {
    await expect(this.unsubmitButton).toBeVisible({timeout: 30_000});
    await this.unsubmitButton.click();
    await expect(this.page.locator('.modal')).toBeVisible({timeout: 15_000});
    await Promise.all([
      this.page.waitForEvent('framenavigated', {
        predicate: frame => frame === this.page.mainFrame(),
        timeout: 30_000,
      }),
      this.confirmButton.click(),
    ]);
    await this.page.waitForLoadState('domcontentloaded');
  }
}

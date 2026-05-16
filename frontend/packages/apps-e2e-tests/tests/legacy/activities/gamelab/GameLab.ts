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

  /** Droplet block/text mode toggle. */
  readonly showCodeHeader: Locator;

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
    this.showCodeHeader = page.locator('#show-code-header');
  }

  /** Lesson 19 of allthethingscourse — used by reloadLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(19, level);
  }

  /**
   * Waits for the user-visible Game Lab run control after app load.
   *
   * The source Cucumber step waits for `#runButton`. Keep that readiness
   * signal, but allow full-suite WebKit reloads enough time to pass through the
   * visible "This is taking longer than usual..." loading state.
   */
  protected async waitForInitialLoad(): Promise<void> {
    await expect(this.runButton).toBeVisible({timeout: 60_000});
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
   * Wait until the new project has completed its first save.
   */
  async waitForInitialProjectSave(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const pageWindow = window as typeof window & {
          dashboard?: {
            project?: {
              __TestInterface?: {isInitialSaveComplete?: () => boolean};
            };
          };
        };
        return pageWindow.dashboard?.project?.__TestInterface?.isInitialSaveComplete?.();
      },
      undefined,
      {timeout: 60_000},
    );
  }

  /**
   * Ensure the Game Lab editor is in text mode.
   * Mirrors the shared Cucumber `I switch to text mode` step.
   */
  async ensureTextMode(): Promise<void> {
    await this.showCodeHeader.waitFor({state: 'visible', timeout: 15_000});
    const text = await this.showCodeHeader.textContent();
    if (text?.trim() === 'Show Text') {
      await this.showCodeHeader.click();
      await this.page.waitForFunction(
        () => {
          const el = document.querySelector(
            '.droplet-gutter > div',
          ) as HTMLElement | null;
          return !el || getComputedStyle(el).display === 'none';
        },
        undefined,
        {timeout: 10_000},
      );
    }
  }

  /**
   * Insert code into the current Droplet ACE cursor position.
   *
   * @param code - source text to insert
   */
  async insertCodeAtCursor(code: string): Promise<void> {
    await this.page.evaluate((c: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ace = (window as any).__TestInterface.getDroplet().aceEditor;
      ace.textInput.focus();
      ace.onTextInput(c);
    }, code);
  }

  /**
   * Open the Game Lab library publish dialog.
   * Mirrors `I open the library publish dialog`.
   */
  async openLibraryDialog(): Promise<void> {
    await this.page.locator('.project_share').first().click();
    await this.page
      .locator('#project-share')
      .waitFor({state: 'visible', timeout: 15_000});

    const advancedLink = this.page.locator('#project-share a', {
      hasText: 'Show advanced options',
    });
    if (await advancedLink.isVisible()) {
      await advancedLink.click();
    }

    await this.page
      .locator('#project-share li', {hasText: 'Share as library'})
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page
      .locator('#project-share li', {hasText: 'Share as library'})
      .click();

    await this.page
      .locator('#project-share button', {hasText: 'Share as library'})
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page
      .locator('#project-share button', {hasText: 'Share as library'})
      .click();
  }

  /**
   * Open the Manage Libraries dialog from the settings cog.
   * Mirrors `I open the Manage Libraries dialog`.
   */
  async openManageLibrariesDialog(): Promise<void> {
    await this.page
      .locator('.settings-cog:visible')
      .waitFor({state: 'visible', timeout: 15_000});
    await this.page.locator('.settings-cog:visible').click();
    await this.page
      .locator(
        '.ui-test-settings-cog-menu:visible .ui-test-settings-cog-menu-item',
        {hasText: 'Manage Libraries'},
      )
      .click();
    await expect(this.page.locator('.modal')).toContainText(
      'Manage libraries in this project',
      {timeout: 15_000},
    );
  }

  /**
   * Create a new Game Lab project and publish a basic library from it.
   * Mirrors `I publish a basic library in Game Lab`.
   */
  async publishBasicLibrary(): Promise<{
    libraryUrl: string;
    channelId: string;
  }> {
    await this.gotoNewProject();
    await this.waitForInitialProjectSave();
    await this.ensureTextMode();
    await this.insertCodeAtCursor(
      '// my library function\nfunction myLibrary() {}',
    );

    await this.openLibraryDialog();
    await this.page
      .locator('#ui-test-library-description')
      .waitFor({state: 'visible', timeout: 30_000});
    await this.page.locator('#ui-test-library-description').fill('My library');
    await this.page.locator('label', {hasText: 'Select all functions'}).click();
    await this.page.locator('#ui-test-publish-library').click();
    await expect(
      this.page.locator('b', {
        hasText: 'Successfully published your library:',
      }),
    ).toBeVisible({timeout: 15_000});

    const libraryUrl = this.page.url();
    const channelId = libraryUrl.match(/\/projects\/gamelab\/([^/]+)/)?.[1];
    if (!channelId) {
      throw new Error(`Could not read Game Lab channel id from ${libraryUrl}`);
    }

    await this.closeOpenDialog();
    return {libraryUrl, channelId};
  }

  /**
   * Close the currently visible modal/dialog with Escape.
   */
  async closeOpenDialog(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page
      .locator('.modal')
      .waitFor({state: 'hidden', timeout: 10_000});
  }

  /**
   * Click an element that triggers a main-frame navigation.
   *
   * @param click - action that triggers the navigation
   */
  async clickAndWaitForMainFrameNavigation(
    click: () => Promise<unknown>,
  ): Promise<void> {
    await Promise.all([
      this.page.waitForEvent('framenavigated', {
        predicate: frame => frame === this.page.mainFrame(),
        timeout: 30_000,
      }),
      click(),
    ]);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Import a library by channel id from the Manage Libraries dialog.
   *
   * @param channelId - source library channel id
   */
  async importLibraryByChannelId(channelId: string): Promise<void> {
    await this.openManageLibrariesDialog();
    await expect(
      this.page.locator('h2', {hasText: 'Import library from ID'}),
    ).toBeVisible();
    await this.page.locator('#ui-test-import-library > input').fill(channelId);
    await this.clickAndWaitForMainFrameNavigation(() =>
      this.page.locator('#ui-test-import-library > button').click(),
    );
    await this.waitForLabPage();
  }

  /**
   * Remove the first library listed in the Manage Libraries dialog.
   */
  async removeFirstLibrary(): Promise<void> {
    await this.clickAndWaitForMainFrameNavigation(() =>
      this.page.locator('.ui-test-remove-library').first().click(),
    );
    await this.waitForLabPage();
  }

  /**
   * Assign this published library to the first available section.
   */
  async assignLibraryToFirstSection(): Promise<void> {
    await this.openLibraryDialog();
    await this.page
      .locator('#ui-test-manage-libraries')
      .waitFor({state: 'visible', timeout: 30_000});
    await this.page.locator('#ui-test-manage-libraries').click();
    await this.page
      .locator('.ui-test-sortable-table-select')
      .waitFor({state: 'visible', timeout: 30_000});

    await this.page.locator('select[name="selectOption"]').selectOption({
      index: 1,
    });
    await this.page
      .locator('.ui-test-sortable-table-select table input')
      .first()
      .click();
    const assignDone = this.page.waitForResponse(
      response =>
        /\/v3\/channels\//.test(response.url()) &&
        response.request().method() === 'POST',
      {timeout: 30_000},
    );
    await this.page.locator('div', {hasText: 'Assign library'}).last().click();
    await assignDone;
    await expect(
      this.page.locator('p', {
        hasText: 'This library is assigned to the following sections:',
      }),
    ).toBeVisible({timeout: 30_000});
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

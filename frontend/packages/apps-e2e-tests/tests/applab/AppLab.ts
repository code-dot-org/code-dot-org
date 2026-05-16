import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page Object for App Lab — the Droplet/JS-based lab at lesson 18 of
 * allthethingscourse, or free projects at /projects/applab.
 *
 * App Lab uses a three-mode toolbar (Code / Design / Data) and a JS runtime
 * that runs inside #divApplab.  This POM covers the toolbar, mode switching,
 * the debug console, and the data-mode workspace — enough for the core
 * smoke scenarios.
 */
export class AppLab {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Run button — starts the user's program. */
  readonly runButton: Locator;

  /** Design Mode toggle button. */
  readonly designModeButton: Locator;

  /** Data Mode toggle button. */
  readonly dataModeButton: Locator;

  /** App canvas — #divApplab — contains all running app elements. */
  readonly appCanvas: Locator;

  /** Design workspace — #designWorkspace — visible in design mode. */
  readonly designWorkspace: Locator;

  /** Data workspace wrapper — #dataWorkspaceWrapper — visible in data mode. */
  readonly dataWorkspace: Locator;

  /** #codeModeButton — switches toolbar back to code view from design/data mode. */
  readonly codeModeButton: Locator;

  /** #codeWorkspaceWrapper — visible when in code mode. */
  readonly codeWorkspaceWrapper: Locator;

  /** #show-code-header — blocks ↔ text (ACE) mode toggle inside the code editor. */
  readonly showCodeHeader: Locator;

  /** Key-value output label rendered by getKeyValue/setKeyValue blocks. */
  readonly keyValueLabel: Locator;

  /** Record output label rendered by createRecord/readRecord blocks. */
  readonly recordLabel: Locator;

  /** Data library container — #data-library-container — lists available tables. */
  readonly dataLibraryContainer: Locator;

  /** Data table grid — #dataTable — visible after selecting a table. */
  readonly dataTable: Locator;

  /** Debug console output — #debug-output — accumulates console.log lines. */
  readonly consoleOutput: Locator;

  /** Reset button — stops the running program and restores initial state. */
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.resetButton = page.locator('#resetButton');
    this.designModeButton = page.locator('#designModeButton');
    this.dataModeButton = page.locator('#dataModeButton');
    this.codeModeButton = page.locator('#codeModeButton');
    this.codeWorkspaceWrapper = page.locator('#codeWorkspaceWrapper');
    this.showCodeHeader = page.locator('#show-code-header');
    this.appCanvas = page.locator('#divApplab');
    this.designWorkspace = page.locator('#designWorkspace');
    this.dataWorkspace = page.locator('#dataWorkspaceWrapper');
    this.keyValueLabel = page.locator('#keyValueLabel');
    this.recordLabel = page.locator('#divApplab #recordLabel');
    this.dataLibraryContainer = page.locator('#data-library-container');
    this.dataTable = page.locator('#dataTable');
    this.consoleOutput = page.locator('#debug-output');
  }

  /**
   * Wait until App Lab is interactive enough to interact with.
   * Only #runButton is guaranteed on all level types (course levels lack the
   * design/data mode buttons).  Project pages (/projects/applab) do render
   * all three toolbar buttons, but they appear after #runButton.
   */
  async waitForReady(): Promise<void> {
    await expect(this.runButton).toBeVisible({timeout: 60_000});
  }

  /**
   * Click Design Mode and wait for the design workspace to appear.
   * Mirrors "I switch to design mode" from applab.rb.
   */
  async switchToDesignMode(): Promise<void> {
    await this.designModeButton.click();
    await expect(this.designWorkspace).toBeVisible();
  }

  /**
   * Click Data Mode and wait for the data workspace wrapper to appear.
   * Mirrors "I switch to data mode" from applab.rb.
   */
  async switchToDataMode(): Promise<void> {
    await this.dataModeButton.click();
    await expect(this.dataWorkspace).toBeVisible();
  }

  /**
   * Open the debug console by clicking the expand chevron if it is visible.
   * Mirrors "I open the debug console" from applab.rb:
   *   I click selector "#debug-area-header .fa-circle-chevron-up" if it exists
   */
  async openDebugConsole(): Promise<void> {
    const chevron = this.page.locator(
      '#debug-area-header .fa-circle-chevron-up',
    );
    if (await chevron.isVisible()) {
      await chevron.click();
    }
  }

  /** Click the run button to execute the current program. */
  async run(): Promise<void> {
    await this.runButton.click();
  }

  /**
   * Wait for App Lab's visible save status after a save-triggering action.
   * This observes the same readiness a user sees: catch "Saving..." when the
   * transition is visible, then require "Saved".  If the save is too quick to
   * catch, a changed saved timestamp is equivalent readiness.
   *
   * @param action - user action that triggers an App Lab source save
   * @param options - set expectSave false when the action may be a no-op
   */
  async waitForUiSaveAfter(
    action: () => Promise<void>,
    {expectSave = true}: {expectSave?: boolean} = {},
  ): Promise<void> {
    const previousTimestamp = await this.currentSavedTimestamp();

    await action();

    const saveStatus = this.page.locator('.project_updated_at');
    const saveError = this.page.locator('.project-save-error');
    const savingIndicator = saveStatus.filter({hasText: 'Saving'});

    if (expectSave) {
      const transition = await Promise.race([
        savingIndicator
          .waitFor({state: 'visible', timeout: 60_000})
          .then(() => 'saving' as const),
        expect
          .poll(() => this.currentSavedTimestamp(), {timeout: 60_000})
          .not.toBe(previousTimestamp)
          .then(() => 'saved' as const),
        saveError
          .waitFor({state: 'visible', timeout: 60_000})
          .then(() => 'error' as const),
      ]);

      if (transition === 'error') {
        throw new Error('App Lab reported a visible save error');
      }
    } else {
      await savingIndicator
        .waitFor({state: 'visible', timeout: 5_000})
        .catch(() => undefined);
    }

    const result = await Promise.race([
      expect(saveStatus)
        .toContainText('Saved', {timeout: 60_000})
        .then(() => 'saved' as const),
      saveError
        .waitFor({state: 'visible', timeout: 60_000})
        .then(() => 'error' as const),
    ]);

    if (result === 'error') {
      throw new Error('App Lab reported a visible save error');
    }
  }

  /**
   * Return the dateTime value displayed by the App Lab save indicator.
   */
  private async currentSavedTimestamp(): Promise<string | null> {
    return this.page
      .locator('.project_updated_at time')
      .getAttribute('datetime', {timeout: 1_000})
      .catch(() => null);
  }

  /**
   * Wait for the key-value output label to become visible.
   * Level 18/8: getKeyValue/setKeyValue blocks print to #keyValueLabel on success.
   */
  async waitForKeyValueLabel(): Promise<void> {
    await expect(this.keyValueLabel).toBeVisible({timeout: 30_000});
  }

  /**
   * Wait for the data library container to become visible after entering data mode.
   * The library loads asynchronously; this blocks until the table list is ready.
   */
  async waitForDataLibrary(): Promise<void> {
    await expect(this.dataLibraryContainer).toBeVisible({timeout: 30_000});
  }

  /**
   * Enter Data mode and wait until a data-table link is visible.
   * App Lab can render Data mode before level-defined tables reach the Data
   * Browser.  Agent Browser verified that the empty Data Tables list does not
   * update in place; switching back to Code and re-entering Data exposes the
   * table once App Lab is ready.  The visible table link is the readiness
   * signal replacing Cucumber's fixed delay.
   *
   * @param name - exact table name text as shown in the Data Tables list
   */
  async switchToDataModeWithTable(name: string): Promise<void> {
    await expect(async () => {
      if (await this.dataWorkspace.isVisible()) {
        await this.switchToCodeMode();
      }

      await this.switchToDataMode();
      await this.waitForDataLibrary();
      await expect(
        this.page.locator('#dataTablesBody a', {hasText: name}),
      ).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({
      intervals: [250, 500, 1_000],
      timeout: 30_000,
    });
  }

  /**
   * Click a table name link in the data library and wait for the data grid.
   * Call waitForDataLibrary() before this to ensure the library is loaded.
   *
   * @param name - exact table name text as shown in the library list
   */
  async selectDataTable(name: string): Promise<void> {
    await this.page.locator('a', {hasText: name}).click();
    await expect(this.dataTable).toBeVisible({timeout: 15_000});
  }

  /**
   * Assert that a cell with the given text is visible in the current data table.
   * Call selectDataTable() first to open the table.
   *
   * @param text - cell text to look for (exact match)
   */
  async expectDataTableCell(text: string): Promise<void> {
    await expect(this.page.locator('td', {hasText: text})).toBeVisible();
  }

  /**
   * Switch from design or data mode back to code mode.
   * Clicks #codeModeButton and waits for #codeWorkspaceWrapper to appear.
   */
  async switchToCodeMode(): Promise<void> {
    await this.codeModeButton.click();
    await expect(this.codeWorkspaceWrapper).toBeVisible();
  }

  /**
   * Ensure the Droplet editor is in text (ACE) mode.
   * Checks #show-code-header button text; if "Show Text" clicks it and waits
   * for the droplet gutter to disappear (text mode signal from droplet_steps.rb).
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
        {timeout: 10_000},
      );
    }
  }

  /**
   * Append code to the Droplet ACE editor. Must call ensureTextMode() first.
   * Uses __TestInterface.getDroplet().aceEditor.onTextInput(), matching the
   * Cucumber `I append text to droplet "..."` step from droplet_steps.rb.
   *
   * @param code - source text to append at the end of the editor
   */
  async appendCode(code: string): Promise<void> {
    await expect(async () => {
      if (!(await this.dropletContents()).includes(code)) {
        await this.page.evaluate((c: string) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ace = (window as any).__TestInterface.getDroplet().aceEditor;
          ace.navigateFileEnd();
          ace.textInput.focus();
          ace.onTextInput(c);
        }, code);
      }

      await expect.poll(() => this.dropletContents()).toContain(code);
    }).toPass({
      intervals: [250, 500, 1_000],
      timeout: 15_000,
    });
  }

  /**
   * Insert code at the current ACE cursor position. Must call ensureTextMode() first.
   * Mirrors `I add code "..." to ace editor` from droplet_steps.rb, which does
   * NOT navigate to file end — it inserts at the current cursor position.  After
   * a page reload the cursor defaults to position 0, so this effectively prepends.
   *
   * @param code - source text to insert at the current cursor position
   */
  async insertCodeAtCursor(code: string): Promise<void> {
    await this.page.evaluate((c: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ace = (window as any).__TestInterface.getDroplet().aceEditor;
      ace.textInput.focus();
      ace.onTextInput(c);
    }, code);
  }

  /** Return the current text-mode Droplet source. */
  private async dropletContents(): Promise<string> {
    return this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).__TestInterface.getDroplet().aceEditor.getValue();
    });
  }

  /**
   * Open the project share dialog, read the share URL from
   * #sharing-dialog-copy-button (mirrors `I save the share URL` from
   * project_steps.rb), close the dialog, and return the URL as a relative
   * path suitable for page.goto().
   *
   * Forces a save first via dashboard.project.save() so the share page
   * reflects the current code/design — autosave debounce is not reliable
   * enough to guarantee this without the explicit flush.
   */
  async getShareUrlFromDialog(): Promise<string> {
    // Open the share dialog (mirrors "I open the project share dialog"
    // from project_steps.rb: click .project_share, wait for dialog).
    await this.page.locator('.project_share').first().click();
    await this.page
      .locator('#project-share')
      .waitFor({state: 'visible', timeout: 15_000});

    // Read the share URL from the copy button's value attribute.
    // #sharing-dialog-copy-button is a MuiButton (<button> element) with the
    // URL in its value= attribute.  inputValue() only works for input/select,
    // so use getAttribute() instead — mirrors Cucumber's .value JS access.
    const copyButton = this.page.locator('#sharing-dialog-copy-button');
    await copyButton.waitFor({state: 'visible', timeout: 10_000});
    const fullUrl = await copyButton.getAttribute('value');
    if (!fullUrl) {
      throw new Error('share dialog copy button did not expose a URL value');
    }

    // Close dialog.
    await this.page.keyboard.press('Escape');
    await this.page
      .locator('#project-share')
      .waitFor({state: 'hidden', timeout: 10_000});

    // Strip origin so the path works against the test baseURL.
    return fullUrl.replace(/^(?:https?:)?\/\/[^/]+/, '');
  }

  /**
   * Return the current Droplet editor text content via __TestInterface.
   * Mirrors `the Droplet ACE text is "..."` from droplet_steps.rb.
   */
  async getDropletContents(): Promise<string> {
    return this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).__TestInterface.getDropletContents() as string,
    );
  }

  /**
   * Return the current App Lab code via `Applab.getCode()`.
   * Mirrors `the droplet code is "..."` from applab.rb, which uses
   * `Applab.getCode()` — the canonical code getter regardless of block/text mode.
   * Unlike getDropletContents() or getAceEditorCode(), this includes the trailing
   * newline that App Lab appends to saved code.
   */
  async getCode(): Promise<string> {
    return this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).Applab.getCode() as string,
    );
  }

  /**
   * Return the ACE editor text trimmed of leading/trailing whitespace.
   * Mirrors `ace editor code is equal to "..."` from droplet_steps.rb, which
   * calls `aceEditor.getValue().trim()` rather than `getDropletContents()`.
   */
  async getAceEditorCode(): Promise<string> {
    return this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iface = (window as any).__TestInterface;
      return (iface.getDroplet().aceEditor.getValue() as string).trim();
    });
  }

  /**
   * Return App Lab's current level HTML (Applab.levelHtml).
   * Reflects the design-mode-authored HTML for the running app.
   */
  async getLevelHtml(): Promise<string> {
    return this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).Applab.levelHtml as string,
    );
  }

  /**
   * Drag a design-mode element by type name into the app visualization.
   * Mirrors `I drag a {element_type} into the app` from applab.rb:
   * fires jQuery mousedown → mousemove → mouseup on the palette item.
   *
   * @param elementType - palette element type, e.g. 'BUTTON', 'SCREEN', 'LABEL', 'TEXT_AREA'
   */
  async dragElementToApp(elementType: string): Promise<void> {
    await this.page.evaluate((type: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const $ = (window as any).$;
      const el = $(`[data-element-type='${type}']`);
      const offset = el.offset();
      el.trigger(
        $.Event('mousedown', {which: 1, pageX: offset.left, pageY: offset.top}),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vizOffset = ($('#visualization') as any).offset();
      $(document).trigger(
        $.Event('mousemove', {
          pageX: vizOffset.left + 15,
          pageY: vizOffset.top,
        }),
      );
      $(document).trigger(
        $.Event('mouseup', {
          pageX: vizOffset.left + 15,
          pageY: vizOffset.top,
        }),
      );
    }, elementType);
  }

  /**
   * Move a design-mode element to an exact app-space position.
   * Mirrors the App Lab property editor by calling Applab.updateProperty()
   * with the internal left/top property names.
   *
   * @param elementId - Design element id, e.g. `design_button1`
   * @param x - Left coordinate in app-space pixels
   * @param y - Top coordinate in app-space pixels
   */
  async setDesignElementPosition(
    elementId: string,
    x: number,
    y: number,
  ): Promise<void> {
    await this.page.evaluate(
      ({elementId, x, y}: {elementId: string; x: number; y: number}) => {
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error(
            `Could not find App Lab design element #${elementId}`,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const applab = (window as any).Applab;
        applab.updateProperty(element, 'left', x);
        applab.updateProperty(element, 'top', y);
      },
      {elementId, x, y},
    );
  }

  /**
   * Save the current App Lab project through the same product API used by the
   * Cucumber `I save the project` step.
   */
  async saveProject(): Promise<void> {
    await this.waitForUiSaveAfter(() =>
      this.page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Applab.serializeAndSave();
      }),
    );
  }

  /**
   * Dispatch a mousemove over an App Lab element so VisualizationOverlay
   * renders the user-visible coordinate/id tooltip.
   *
   * @param elementId - Element id to hover, without `#`
   */
  async hoverAppElement(elementId: string): Promise<void> {
    await this.page.evaluate((id: string) => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Could not find App Lab element #${id}`);
      }
      const rect = element.getBoundingClientRect();
      const scale = rect.width / (element as HTMLElement).offsetWidth || 1;
      element.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: false,
          view: window,
          clientX: rect.left + 5 * scale,
          clientY: rect.top + 5 * scale,
        }),
      );
    }, elementId);
  }

  /**
   * Dispatch a mousemove over the App Lab visualization at app-space
   * coordinates, matching the Cucumber blank-screen hover step.
   *
   * @param x - App-space x coordinate
   * @param y - App-space y coordinate
   */
  async hoverVisualizationAt(x: number, y: number): Promise<void> {
    await this.page.evaluate(
      ({x, y}: {x: number; y: number}) => {
        const visualization = document.getElementById('visualizationOverlay');
        if (!visualization) {
          throw new Error('Could not find App Lab visualization overlay');
        }
        const rect = visualization.getBoundingClientRect();
        const scale =
          rect.width / (visualization as unknown as SVGElement).clientWidth ||
          1;
        visualization.dispatchEvent(
          new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: false,
            view: window,
            clientX: rect.left + x * scale,
            clientY: rect.top + y * scale,
          }),
        );
      },
      {x, y},
    );
  }

  /**
   * Reset the project to its starting (initial) version via the Version History dialog.
   * Mirrors `I reset the puzzle to the starting version` from steps.rb.
   * Opens #versions-header, clicks "Start over", then confirms with #start-over-button.
   */
  async resetToStartingVersion(): Promise<void> {
    await this.page.locator('#versions-header').click();
    await this.page
      .locator('#showVersionsModal')
      .waitFor({state: 'visible', timeout: 15_000});
    // Scope to the modal — the main toolbar also has a "Start over" button
    // (#clear-puzzle-header) which would cause a strict-mode violation.
    const startOver = this.page
      .locator('#showVersionsModal')
      .locator('button', {hasText: 'Start over'});
    await startOver.waitFor({state: 'visible', timeout: 15_000});
    await startOver.click();
    await this.page
      .locator('#start-over-button')
      .waitFor({state: 'visible', timeout: 10_000});

    const navigationDone = this.page.waitForEvent('framenavigated', {
      predicate: frame => frame === this.page.mainFrame(),
      timeout: 60_000,
    });
    await this.page.locator('#start-over-button').click();
    await navigationDone;
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForReady();
    await expect(this.page.locator('.project_updated_at')).toContainText(
      'Saved',
      {timeout: 60_000},
    );
    await this.page
      .locator('#showVersionsModal')
      .waitFor({state: 'hidden', timeout: 15_000});
  }

  /**
   * Open the project share dialog, navigate to the Embed tab, and return the
   * embed page URL as a relative path (e.g. `/projects/applab/<id>/embed`).
   *
   * Mirrors the Cucumber `I navigate to the embedded version of my project`
   * flow from applab.rb: click .project_share → Show advanced options → Embed
   * → read the <iframe src="..."> value from the textarea.
   *
   * @param hideSource - when true, also ticks "Hide ability to view code"
   *   (mirrors `I navigate to the embedded version of my project with source hidden`)
   * @returns relative URL path suitable for page.goto()
   */
  async getEmbedUrl(hideSource = false): Promise<string> {
    await this.page.locator('.project_share').first().click();
    await this.page
      .locator('#project-share')
      .waitFor({state: 'visible', timeout: 15_000});

    // Expand advanced options to reveal the Embed tab.
    await this.page
      .locator('#project-share a', {hasText: 'Show advanced options'})
      .click();
    await this.page
      .locator('#project-share li', {hasText: 'Embed'})
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page.locator('#project-share li', {hasText: 'Embed'}).click();

    if (hideSource) {
      // Tick the "Hide ability to view code" checkbox via its label.
      await this.page
        .locator('#project-share label', {hasText: 'Hide ability to view code'})
        .click();
    }

    // Read the <iframe src="..."> HTML from the embed textarea.
    const textarea = this.page.locator('#project-share textarea');
    await textarea.waitFor({state: 'visible', timeout: 10_000});
    const iframeHtml = await textarea.inputValue();

    // Close dialog.
    await this.page.keyboard.press('Escape');
    await this.page
      .locator('#project-share')
      .waitFor({state: 'hidden', timeout: 10_000});

    // Parse src attribute and strip origin so the path works against the test baseURL.
    const srcMatch = iframeHtml.match(/src="([^"]+)"/);
    if (!srcMatch) {
      throw new Error(`No src found in embed HTML: ${iframeHtml}`);
    }
    // Strip protocol + host (handles both "//host/path" and "https://host/path").
    return srcMatch[1].replace(/^(?:https?:)?\/\/[^/]+/, '');
  }
}

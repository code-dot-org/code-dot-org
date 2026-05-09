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

  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
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
    await this.page.evaluate((c: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ace = (window as any).__TestInterface.getDroplet().aceEditor;
      ace.navigateFileEnd();
      ace.textInput.focus();
      ace.onTextInput(c);
    }, code);
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
   * Reset the project to its starting (initial) version via the Version History dialog.
   * Mirrors `I reset the puzzle to the starting version` from steps.rb.
   * Opens #versions-header, clicks "Start over", then confirms with #start-over-button.
   */
  async resetToStartingVersion(): Promise<void> {
    await this.page.locator('#versions-header').click();
    await this.page
      .locator('#showVersionsModal')
      .waitFor({state: 'visible', timeout: 15_000});
    const startOver = this.page.locator('button', {hasText: 'Start over'});
    await startOver.waitFor({state: 'visible', timeout: 15_000});
    await startOver.click();
    await this.page
      .locator('#start-over-button')
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page.locator('#start-over-button').click();
    await this.page
      .locator('#showVersionsModal')
      .waitFor({state: 'hidden', timeout: 15_000});
  }
}

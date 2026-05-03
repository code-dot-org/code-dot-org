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

  /** Key-value output label rendered by getKeyValue/setKeyValue blocks. */
  readonly keyValueLabel: Locator;

  /** Record output label rendered by createRecord/readRecord blocks. */
  readonly recordLabel: Locator;

  /** Data library container — #data-library-container — lists available tables. */
  readonly dataLibraryContainer: Locator;

  /** Data table grid — #dataTable — visible after selecting a table. */
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.designModeButton = page.locator('#designModeButton');
    this.dataModeButton = page.locator('#dataModeButton');
    this.appCanvas = page.locator('#divApplab');
    this.designWorkspace = page.locator('#designWorkspace');
    this.dataWorkspace = page.locator('#dataWorkspaceWrapper');
    this.keyValueLabel = page.locator('#keyValueLabel');
    this.recordLabel = page.locator('#divApplab #recordLabel');
    this.dataLibraryContainer = page.locator('#data-library-container');
    this.dataTable = page.locator('#dataTable');
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
}

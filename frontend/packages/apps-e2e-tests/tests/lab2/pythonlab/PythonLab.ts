import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {Lab2Lab} from '../shared/Lab2Lab';

/**
 * Page Object for Python Lab (lab2 architecture) — lesson 50 of
 * allthethingscourse. Appends `&hideProductTours=true` to suppress onboarding
 * overlays that would otherwise block test interactions.
 */
export class PythonLab extends Lab2Lab {
  /** Run button — `#uitest-codebridge-run`. */
  readonly runButton: Locator;

  /** CodeMirror editor content area. */
  readonly editorContent: Locator;

  /** File list panel — `#uitest-files-list`. */
  readonly filesList: Locator;

  /** Add-file button (`+`) in the files panel header. */
  readonly filesPlus: Locator;

  /** Console output panel — `#uitest-codebridge-console`. */
  readonly console: Locator;

  /** Validate button on the validation resource panel tab. */
  readonly validateButton: Locator;

  /** Validation tab in the resource panel. */
  readonly validationTab: Locator;

  /** Project save status indicator in the header (shows "Saved" when up to date). */
  readonly projectUpdatedAt: Locator;

  /** Extra Links button visible to levelbuilders only. */
  readonly extraLinksButton: Locator;

  constructor(page: Page) {
    super(page);
    this.runButton = page.locator('#uitest-codebridge-run');
    this.editorContent = page.locator('.cm-content');
    this.filesList = page.locator('#uitest-files-list');
    this.filesPlus = page.locator('#uitest-files-plus');
    this.console = page.locator('#uitest-codebridge-console');
    this.validateButton = page.locator('#instructions-validate-button');
    this.validationTab = page.locator('#resource-panel-tab-validation');
    this.projectUpdatedAt = page.locator('.project_updated_at');
    this.extraLinksButton = page.locator(
      '#uitest-resource-panel-extra-links-button',
    );
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(50, level) + '&hideProductTours=true';
  }

  /**
   * Python Lab is ready when the run button is visible. The lab mounts its
   * editor and file panel before pyodide finishes loading, so visible is
   * sufficient for file-management tests.
   */
  protected async waitForReady(): Promise<void> {
    await this.runButton.waitFor({state: 'visible'});
  }

  /** Clicks the run button. */
  async run(): Promise<void> {
    await this.runButton.click();
  }

  /**
   * Opens the kebab dropdown for the file at the given index.
   * Mirrors `I open the dropdown for file N` from codebridge_steps.rb:
   *   hover `#uitest-file-{N}-row`, then click `#uitest-file-{N}-kebab`.
   *
   * @param fileIndex - 0-based index of the file in the file list
   */
  async openFileDropdown(fileIndex: number): Promise<void> {
    await this.page.locator(`#uitest-file-${fileIndex}-row`).hover();
    await this.page.locator(`#uitest-file-${fileIndex}-kebab`).click();
  }

  /**
   * Returns a locator for the popup menu of the file at the given index.
   * Use `toContainText` / `not.toContainText` to assert menu item presence.
   *
   * @param fileIndex - 0-based index of the file in the file list
   */
  filePopup(fileIndex: number): Locator {
    return this.page.locator(`#uitest-file-${fileIndex}-popup`);
  }

  /**
   * Returns the progress bubble locator for the given 1-based level number.
   * The header renders one bubble per level; level 1 is index 0.
   */
  progressBubble(level: number): Locator {
    return this.page
      .locator('.header_level .react_stage a')
      .nth(level - 1)
      .locator('.progress-bubble');
  }

  /**
   * Asserts that the header progress bubble for the given level matches state.
   *
   * CSS values from progress.rb `color_string()`:
   *   not_tried  — bg rgb(254,254,254)  border rgb(198,202,205)
   *   attempted  — bg rgb(254,254,254)  border rgb(14,190,14)
   *   perfect    — bg rgb(14,190,14)    border rgb(14,190,14)
   *
   * @param level - 1-based level number
   * @param state - progress state name
   */
  async expectProgressIs(
    level: number,
    state: 'not_tried' | 'attempted' | 'perfect',
  ): Promise<void> {
    const bgColor =
      state === 'perfect' ? 'rgb(14, 190, 14)' : 'rgb(254, 254, 254)';
    const borderColor =
      state === 'not_tried' ? 'rgb(198, 202, 205)' : 'rgb(14, 190, 14)';
    const bubble = this.progressBubble(level);
    await expect(bubble).toBeVisible();
    await expect(bubble).toHaveCSS('background-color', bgColor);
    await expect(bubble).toHaveCSS('border-top-color', borderColor);
  }

  /**
   * Clicks in the editor, then types text (including any trailing newline).
   * Mirrors `I focus selector ".cm-content"` + `I press keys "..."`.
   */
  async typeInEditor(text: string): Promise<void> {
    await this.editorContent.click();
    await this.editorContent.pressSequentially(text);
  }

  /**
   * Navigates to start mode via the Extra Links modal.
   * Waits for the Extra Links button to appear, for the project to report
   * "Saved", opens the modal, and clicks the [s]tart link.
   * Calls waitForReady() after navigation completes.
   */
  async navigateToStartMode(): Promise<void> {
    await expect(this.extraLinksButton).toBeVisible();
    await expect(this.projectUpdatedAt).toContainText('Saved');
    await this.extraLinksButton.click();
    const startLink = this.page.locator('a', {hasText: '[s]tart'});
    await expect(startLink).toBeVisible();
    await startLink.click();
    await this.waitForReady();
  }
}

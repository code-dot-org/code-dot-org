import {type Locator, type Page} from '@playwright/test';

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

  constructor(page: Page) {
    super(page);
    this.runButton = page.locator('#uitest-codebridge-run');
    this.editorContent = page.locator('.cm-content');
    this.filesList = page.locator('#uitest-files-list');
    this.filesPlus = page.locator('#uitest-files-plus');
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
}

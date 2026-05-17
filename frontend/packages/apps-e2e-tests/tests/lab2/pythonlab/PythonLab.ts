import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {Lab2Lab} from '../shared/Lab2Lab';

const MILESTONE_ATTEMPTED = -150;
const MILESTONE_ALL_PASS = 100;

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

  /** Validation results table rendered after validation runs. */
  readonly validationResults: Locator;

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
    this.validationResults = page.locator('table', {
      has: page.getByRole('cell', {name: 'Result'}),
    });
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
    await this.waitForCodeStudioHeaderReady();
  }

  /**
   * Waits for the Code Studio level header and progress bubbles when present.
   * Python Lab visual checkpoints include this course chrome.
   */
  async waitForCodeStudioHeaderReady(): Promise<void> {
    const header = this.page.locator('.header_level').first();
    if (!(await header.isVisible({timeout: 1_000}).catch(() => false))) {
      return;
    }

    await expect(this.page.locator('#header_middle_content')).toBeVisible({
      timeout: 30_000,
    });

    const progressContainer = this.page
      .locator('#lesson_progress_container')
      .first();
    if (
      !(await progressContainer.isVisible({timeout: 1_000}).catch(() => false))
    ) {
      return;
    }

    await expect(
      this.page.locator('.header_level .progress-bubble').first(),
    ).toBeVisible({timeout: 30_000});
  }

  /** Clicks the run button. */
  async run(): Promise<void> {
    await this.runButton.click();
  }

  /**
   * Waits for a milestone post with the expected test result.
   *
   * Validation can post both an attempted milestone and a final pass milestone.
   * The test must wait for the durable result it is about to assert.
   *
   * @param testResult - numeric Code.org TestResults value
   */
  private async waitForMilestoneResult(testResult: number): Promise<void> {
    await this.page.waitForResponse(
      response => {
        if (
          response.request().method() !== 'POST' ||
          !response.url().includes('/milestone/') ||
          !response.ok()
        ) {
          return false;
        }

        const postData = response.request().postData();
        if (!postData) {
          return false;
        }

        try {
          return JSON.parse(postData).testResult === testResult;
        } catch {
          return false;
        }
      },
      {timeout: 30_000},
    );
  }

  /**
   * Clicks Run and waits for the milestone post that persists progress.
   *
   * The header progress bubble can update optimistically before the backing
   * progress save is durable. Cucumber's progress helper waits for Ajax before
   * trusting the bubble; this waits for the same user-visible state change to
   * be persisted without relying on page jQuery.
   */
  async runAndWaitForProgressSave(): Promise<void> {
    const progressSave = this.waitForMilestoneResult(MILESTONE_ATTEMPTED);
    await this.run();
    await progressSave;
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
    await this.expectProgressCss(level, state, 30_000);
  }

  /**
   * Asserts the progress bubble CSS with a caller-provided timeout.
   *
   * @param level - 1-based level number
   * @param state - progress state name
   * @param timeout - assertion timeout in milliseconds
   */
  private async expectProgressCss(
    level: number,
    state: 'not_tried' | 'attempted' | 'perfect',
    timeout: number,
  ): Promise<void> {
    const bgColor =
      state === 'perfect' ? 'rgb(14, 190, 14)' : 'rgb(254, 254, 254)';
    const borderColor =
      state === 'not_tried' ? 'rgb(198, 202, 205)' : 'rgb(14, 190, 14)';
    const bubble = this.progressBubble(level);
    await expect(bubble).toBeVisible();
    await expect(bubble).toHaveCSS('background-color', bgColor, {
      timeout,
    });
    await expect(bubble).toHaveCSS('border-top-color', borderColor, {
      timeout,
    });
  }

  /**
   * Waits for the Python runtime to finish loading.
   *
   * The workspace mounts before Pyodide is ready. The user-visible readiness
   * signal is the Run button changing from disabled to enabled, matching the
   * Cucumber background step.
   */
  async waitForRunReady(): Promise<void> {
    await expect(this.runButton).toBeEnabled({timeout: 60_000});
  }

  /**
   * Checks whether the Python runtime has enabled Run.
   *
   * @param timeout - readiness timeout in milliseconds
   */
  async isRunReady(timeout = 60_000): Promise<boolean> {
    return this.runButton.isEnabled({timeout}).catch(() => false);
  }

  /**
   * Asserts that validation has rendered all expected pass results.
   *
   * This is the user-visible readiness signal after pressing Validate. The
   * Continue button can become enabled while the result table is still filling
   * in, so wait for the table before checking persisted progress.
   */
  async expectValidationPassed(): Promise<void> {
    await expect(this.validationResults).toBeVisible({timeout: 30_000});
    await expect(
      this.validationResults.getByRole('cell', {name: /Pass/}),
    ).toHaveCount(5, {timeout: 30_000});
  }

  /**
   * Clicks Validate and waits for the milestone post that persists progress.
   *
   * The visible validation table and Continue button update before the
   * `sendSuccessReport` fetch resolves. Cucumber covers this with its
   * "wait until jQuery Ajax requests are finished" progress helper; this is the
   * equivalent wait for the real request, not a stub.
   */
  async validateAndWaitForProgressSave(): Promise<void> {
    const progressSave = this.waitForMilestoneResult(MILESTONE_ALL_PASS);
    await this.validateButton.click();
    await progressSave;
  }

  /**
   * Runs validation until the passed results produce a durable perfect bubble.
   *
   * Python Lab can post an attempted milestone and a pass milestone close
   * together. If the attempted response is merged last, the visible progress
   * bubble returns to not-tried even though the validation table passed. Running
   * validation again is the user-visible recovery path.
   *
   * @param level - 1-based level number
   */
  async validateUntilProgressIsPerfect(level: number): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.validateAndWaitForProgressSave();
      await this.expectValidationPassed();
      if (
        await this.expectProgressCss(level, 'perfect', 10_000)
          .then(() => true)
          .catch(() => false)
      ) {
        return;
      }
    }

    await this.expectProgressIs(level, 'perfect');
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

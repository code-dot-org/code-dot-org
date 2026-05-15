import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for legacy Java Lab levels.
 */
export class JavaLabPage {
  readonly page: Page;
  readonly runButton: Locator;
  readonly testButton: Locator;
  readonly finishButton: Locator;
  readonly submitButton: Locator;
  readonly unsubmitButton: Locator;
  readonly console: Locator;
  readonly consoleInput: Locator;
  readonly clearConsoleButton: Locator;
  readonly commitCodeButton: Locator;
  readonly commitNotes: Locator;
  readonly confirmButton: Locator;
  readonly reviewTab: Locator;
  readonly reviewRefreshButton: Locator;
  readonly openCodeReviewButton: Locator;
  readonly closeCodeReviewButton: Locator;
  readonly codeReviewTimelineReview: Locator;
  readonly codeReviewTimelineCommit: Locator;
  readonly peerDropdownButton: Locator;
  readonly codeReviewCommentInput: Locator;
  readonly teacherPanel: Locator;
  readonly teacherPanelRows: Locator;
  readonly teacherUnsubmitButton: Locator;
  readonly levelbuilderToggle: Locator;
  readonly neighborhoodSpeedSlider: Locator;
  readonly photoInput: Locator;
  readonly captchaDialog: Locator;

  /**
   * @param page - Playwright page for the current Java Lab scenario
   */
  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.testButton = page.locator('#testButton');
    this.finishButton = page.locator('#finishButton');
    this.submitButton = page.locator('#submitButton');
    this.unsubmitButton = page.locator('#unsubmitButton');
    this.console = page.locator('.javalab-console');
    this.consoleInput = page.locator('#console-input');
    this.clearConsoleButton = page.getByRole('button', {
      name: /Clear Console/,
    });
    this.commitCodeButton = page.locator('#javalab-editor-save');
    this.commitNotes = page.locator('#commit-notes');
    this.confirmButton = page.locator('#confirmationButton, #confirm-button');
    this.reviewTab = page.locator('.uitest-reviewTab');
    this.reviewRefreshButton = page.locator('.review-refresh-button');
    this.openCodeReviewButton = page.locator('.uitest-open-code-review');
    this.closeCodeReviewButton = page.locator('.uitest-close-code-review');
    this.codeReviewTimelineReview = page.locator(
      '.uitest-code-review-timeline-review',
    );
    this.codeReviewTimelineCommit = page.locator(
      '.uitest-code-review-timeline-commit',
    );
    this.peerDropdownButton = page.locator('.peer-dropdown-button');
    this.codeReviewCommentInput = page.locator(
      '#ui-test-code-review-comment-input',
    );
    this.teacherPanel = page.locator('#teacher-panel-container');
    this.teacherPanelRows = page.locator('#teacher-panel-container tr');
    this.teacherUnsubmitButton = page.locator('#unsubmit-button-uitest');
    this.levelbuilderToggle = page.locator('#levelbuilder-menu-toggle');
    this.neighborhoodSpeedSlider = page.locator(
      'input[name="neighborhood-speed"]',
    );
    this.photoInput = page.locator('#photoInput');
    this.captchaDialog = page.locator('.modal', {
      hasText: "Please confirm you're human",
    });
  }

  /**
   * Navigate to an allthethingscourse Java Lab level and wait for the lab shell.
   *
   * @param level - lesson 44 level number
   * @param query - optional query string, without the leading question mark
   */
  async gotoLevel(level: number, query = 'noautoplay=true'): Promise<void> {
    await this.page.goto(
      `/courses/allthethingscourse/units/1/lessons/44/levels/${level}?${query}`,
      {waitUntil: 'domcontentloaded'},
    );
    await this.waitForReady();
  }

  /**
   * Wait for user-visible Java Lab controls.
   */
  async waitForReady(): Promise<void> {
    await expect(this.runButton).toBeVisible({timeout: 60_000});
    await expect(this.testButton).toBeVisible({timeout: 60_000});
  }

  /**
   * Make a harmless source edit and wait for dashboard autosave.
   */
  async editSourceForNewVersion(): Promise<void> {
    await this.page.getByRole('textbox').first().click();
    await this.page.keyboard.insertText('// playwright commit\n');
    await expect(this.page.locator('.project_updated_at')).toContainText(
      'Saved',
      {timeout: 60_000},
    );
  }

  /**
   * Commit the current Java Lab source with notes.
   *
   * @param notes - commit notes to enter in the dialog
   */
  async commitCode(notes: string): Promise<void> {
    await expect(this.commitCodeButton).toBeVisible({timeout: 60_000});
    await this.commitCodeButton.click();
    await expect(this.commitNotes).toBeVisible({timeout: 15_000});
    await this.commitNotes.fill(notes);
    await expect(this.commitNotes).toHaveValue(notes);

    const commitSaved = this.page.waitForResponse(
      resp =>
        resp.url().includes('/project_commits') &&
        resp.request().method() === 'POST',
      {timeout: 30_000},
    );
    await this.confirmButton.click();
    await commitSaved;
    await expect(this.commitNotes).toBeHidden({timeout: 15_000});
  }

  /**
   * Select the Review tab.
   */
  async selectReviewTab(): Promise<void> {
    await expect(this.reviewTab).toBeVisible({timeout: 30_000});
    await this.reviewTab.click();
  }

  /**
   * Open the student code-review tab and wait for its refresh button.
   */
  async openReviewTab(): Promise<void> {
    await this.selectReviewTab();
    await expect(this.reviewRefreshButton).toBeVisible({timeout: 30_000});
  }

  /**
   * Open a new code review from the current student's Review tab.
   */
  async openNewCodeReview(): Promise<void> {
    await this.openReviewTab();
    await expect(this.openCodeReviewButton).toBeEnabled({timeout: 30_000});
    const reviewCreated = this.page.waitForResponse(
      resp =>
        resp.url().endsWith('/code_reviews') &&
        resp.request().method() === 'POST' &&
        resp.ok(),
      {timeout: 90_000},
    );
    await this.openCodeReviewButton.click();
    await reviewCreated;
    await this.waitForOpenReviewInTimeline();
  }

  /**
   * Wait for the current commit to appear in the Review timeline.
   */
  async waitForCommitInReviewTimeline(): Promise<void> {
    await expect(async () => {
      if (
        !(await this.codeReviewTimelineCommit
          .first()
          .isVisible()
          .catch(() => false))
      ) {
        await expect(this.reviewRefreshButton).toBeVisible({timeout: 10_000});
        await this.reviewRefreshButton.click();
      }
      await expect(this.codeReviewTimelineCommit).toBeVisible({
        timeout: 10_000,
      });
    }).toPass({timeout: 60_000});
  }

  /**
   * Wait for the open code review card to appear in the Review timeline.
   */
  async waitForOpenReviewInTimeline(): Promise<void> {
    await expect(async () => {
      if (
        !(await this.codeReviewTimelineReview
          .first()
          .isVisible()
          .catch(() => false))
      ) {
        await expect(this.reviewRefreshButton).toBeVisible({timeout: 10_000});
        await this.reviewRefreshButton.click();
      }
      await expect(this.codeReviewTimelineReview).toBeVisible({
        timeout: 10_000,
      });
    }).toPass({timeout: 60_000});
  }

  /**
   * Load a peer's open code review from the Review tab.
   *
   * @param peerIndex - one-based index matching the Cucumber step
   */
  async loadPeerCodeReview(peerIndex: number): Promise<void> {
    await this.openReviewTab();
    await expect(this.peerDropdownButton).toBeVisible({timeout: 30_000});
    await this.peerDropdownButton.click();
    const peerLink = this.page
      .locator('.code-review-peer-link')
      .nth(peerIndex - 1);
    await expect(peerLink).toBeVisible({timeout: 30_000});
    await Promise.all([
      this.page.waitForURL(/viewingCodeReview=true.*user_id=/, {
        timeout: 30_000,
      }),
      peerLink.click(),
    ]);
    await expect(this.codeReviewCommentInput).toBeVisible({timeout: 30_000});
  }

  /**
   * Close the currently open owner code review.
   */
  async closeOwnCodeReview(): Promise<void> {
    await expect(this.closeCodeReviewButton).toBeVisible({timeout: 30_000});
    await expect(this.closeCodeReviewButton).toBeEnabled({timeout: 30_000});
    const reviewClosed = this.page.waitForResponse(
      resp =>
        resp.url().includes('/code_reviews/') &&
        resp.request().method() === 'PATCH' &&
        resp.ok(),
      {timeout: 60_000},
    );
    await this.closeCodeReviewButton.click();
    await reviewClosed;
    await expect(this.openCodeReviewButton).toBeVisible({timeout: 60_000});
  }

  /**
   * Run a console-input Java Lab program through completion.
   *
   * @param input - text entered when the program prompts in the console
   */
  async runConsoleProgram(input: string): Promise<void> {
    await expect(async () => {
      if (await this.clearConsoleButton.isVisible().catch(() => false)) {
        await this.clearConsoleButton.click();
      }
      await this.runButton.click();
      await expect(this.console).toContainText("What's your name?", {
        timeout: 60_000,
      });
    }).toPass({timeout: 120_000});
    await this.consoleInput.fill(input);
    await this.consoleInput.press('Enter');
    await expect(this.console).toContainText('[JAVALAB] Program completed.', {
      timeout: 60_000,
    });
  }

  /**
   * Run Java Lab validation tests and wait for the console completion line.
   */
  async runValidationTests(): Promise<void> {
    await this.testButton.click();
    await expect(this.console).toContainText('[JAVALAB] Program completed.', {
      timeout: 60_000,
    });
  }

  /**
   * Press the levelbuilder toggle used by the source Eyes scenarios before
   * their visual checkpoints.
   */
  async clickLevelbuilderToggle(): Promise<void> {
    await expect(this.levelbuilderToggle).toBeVisible({timeout: 30_000});
    await this.levelbuilderToggle.click();
  }

  /**
   * Set the visible Neighborhood speed slider to its fastest value.
   */
  async setNeighborhoodSpeedToFast(): Promise<void> {
    await expect(this.neighborhoodSpeedSlider).toBeVisible({timeout: 30_000});
    await this.neighborhoodSpeedSlider.fill('100');
    await expect(this.neighborhoodSpeedSlider).toHaveValue('100');
  }

  /**
   * Submit the current Java Lab level and wait for the level page to reload.
   */
  async submitLevel(): Promise<void> {
    await this.runButton.click();
    await expect(this.submitButton).toBeVisible({timeout: 60_000});
    await this.submitButton.click();
    await expect(this.page.locator('.modal')).toBeVisible({timeout: 15_000});
    await this.clickAndWaitForMainFrameNavigation(() =>
      this.page.locator('#confirm-button').click(),
    );
  }

  /**
   * Unsubmit the current student's Java Lab submission.
   */
  async unsubmitLevel(): Promise<void> {
    await this.runButton.click();
    await this.unsubmitButton.click();
    await expect(this.page.locator('.modal')).toBeVisible({timeout: 15_000});
    await this.clickAndWaitForMainFrameNavigation(() =>
      this.page.locator('#confirm-button').click(),
    );
  }

  /**
   * Open the teacher panel and wait for student rows.
   */
  async openTeacherPanel(): Promise<void> {
    await expect(this.page.locator('.show-handle')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('.show-handle .fa-chevron-left').click();
    await expect(this.teacherPanel.locator('.student-table')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.teacherPanelRows.nth(1)).toBeVisible({timeout: 30_000});
  }

  /**
   * Load a student's project from the teacher panel.
   *
   * @param studentName - visible student name in the panel row
   */
  async loadStudentProjectFromTeacherPanel(studentName: string): Promise<void> {
    await this.openTeacherPanel();
    const row = this.teacherPanelRows.filter({hasText: studentName}).first();
    await expect(row).toBeVisible({timeout: 30_000});
    await Promise.all([
      this.page.waitForURL(/user_id=/, {timeout: 30_000}),
      row.click(),
    ]);
    await expect(this.teacherPanel).toBeVisible({timeout: 30_000});
  }

  /**
   * Wait for the main frame navigation caused by a same-URL reload action.
   *
   * @param click - action that triggers navigation
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
}

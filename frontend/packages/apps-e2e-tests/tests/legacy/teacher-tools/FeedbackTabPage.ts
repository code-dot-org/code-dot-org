import {expect, type Locator, type Page} from '@playwright/test';

import {headerBubble} from '../../shared/progress';
import {expectCodeStudioHeaderReady} from '../shared/visualReadiness';

const LEVEL_URL = '/courses/allthethingscourse/units/1/lessons/38/levels/1';

/**
 * Page object for the allthethingscourse mini-rubric feedback tab.
 */
export class FeedbackTabPage {
  private readonly page: Page;
  private readonly headerProgress: Locator;
  private readonly teacherPanel: Locator;
  private readonly teacherPanelStudentNames: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.headerProgress = page.locator('#lesson_progress_container');
    this.teacherPanel = page.locator('.teacher-panel');
    this.teacherPanelStudentNames = page.locator(
      '#teacher-panel-container .student-table td:first-child',
    );
  }

  /**
   * Completes the level so the feedback tab is available.
   */
  async completeLevel(): Promise<void> {
    await this.page.goto(`${LEVEL_URL}?noautoplay=true`);
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('#runButton').click();
    await expect(this.page.locator('#finishButton')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('#finishButton').click();
  }

  /**
   * Opens the rubric feedback tab and verifies the key concept text.
   */
  async expectStudentKeyConceptFeedbackTab(): Promise<void> {
    await this.page.goto(LEVEL_URL);
    await expectCodeStudioHeaderReady(this.page);
    await expect(this.page.locator('.project_updated_at')).toContainText(
      'Saved',
      {timeout: 30_000},
    );
    await expect(headerBubble(this.page, 1)).toBeVisible();
    await expect(this.page.locator('.uitest-feedback')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('.uitest-feedback').first().click();
    await expect(this.page.locator('.editor-column').first()).toContainText(
      'This is the key concept for this mini rubric.',
      {timeout: 30_000},
    );
    await expect(
      this.page.locator('#ui-test-submit-feedback'),
    ).not.toBeVisible();
  }

  /**
   * The mini-rubric level progress bubble can render either completed or
   * attempted assessment while preserving the feedback-tab state under test.
   */
  studentFeedbackVisualIgnoreRegions(): Locator[] {
    return [headerBubble(this.page, 1)];
  }

  /**
   * Wait for the teacher feedback panel to stop changing before screenshotting.
   * The selected-student summary contains generated names and save timestamps;
   * visual checks mask that panel after it reaches a stable visible state.
   */
  async expectTeacherFeedbackVisualReady(): Promise<void> {
    await expect(this.page.locator('.editor-column').first()).toContainText(
      'This is the key concept for this mini rubric.',
      {timeout: 30_000},
    );
    if (
      await this.teacherPanel.isVisible({timeout: 1_000}).catch(() => false)
    ) {
      await expect(this.teacherPanel).toBeVisible({timeout: 30_000});
    }

    await this.page.waitForFunction(
      async () => {
        const selectors = ['.editor-column', '.teacher-panel'];
        const signature = () =>
          selectors
            .flatMap(selector =>
              [...document.querySelectorAll(selector)].map(element => {
                const rect = element.getBoundingClientRect();
                return [
                  selector,
                  Math.round(rect.x),
                  Math.round(rect.y),
                  Math.round(rect.width),
                  Math.round(rect.height),
                  Math.round(element.scrollHeight),
                  element.textContent?.trim(),
                ].join(':');
              }),
            )
            .join('|');

        let previous = signature();
        for (let i = 0; i < 5; i++) {
          await new Promise<void>(resolve =>
            requestAnimationFrame(() => resolve()),
          );
          const current = signature();
          if (current !== previous) return false;
          previous = current;
        }
        return true;
      },
      undefined,
      {timeout: 30_000, polling: 250},
    );
  }

  /**
   * Dynamic teacher feedback regions for visual checkpoints.
   *
   * @returns stable container locators for generated roster and timestamp data
   */
  teacherFeedbackVisualIgnoreRegions(): Locator[] {
    return [
      this.headerProgress,
      this.teacherPanel,
      this.teacherPanelStudentNames,
    ];
  }
}

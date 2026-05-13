import {expect, type Locator, type Page} from '@playwright/test';

import {
  expectNotTried,
  expectPerfect,
  headerBubble,
} from '../../shared/progress';

const K1_MAZE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'maze_moveWest',
            next: {block: {type: 'maze_moveWest'}},
          },
        },
      },
    ],
  },
};

type ProgressState = 'perfect' | 'not_tried';

/**
 * Page object for unit overview and related lesson-completion flows.
 */
export class ScriptOverviewPage {
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a unit overview and wait for the visible page tabs.
   *
   * @param url - dashboard-relative unit overview URL
   */
  async gotoUnitOverview(url: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(
      this.page.getByRole('tab', {name: /Summary View|Detail View/}).first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Wait for a lesson table cell visible to users.
   *
   * @param text - expected lesson cell text
   */
  async expectLessonCell(text: string): Promise<void> {
    await expect(
      this.page.locator('td').filter({hasText: text}).first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Assert a visible lesson row exists in summary view.
   *
   * @param text - expected row text
   */
  async expectSummaryLessonText(text: string): Promise<void> {
    await expect(
      this.page.locator('td').filter({hasText: text}).first(),
    ).toBeVisible({timeout: 15_000});
  }

  /**
   * Switch from summary to detail view.
   */
  async openDetailView(): Promise<void> {
    await this.page.locator('.uitest-toggle-detail').click();
    await expect(
      this.page.locator('span:visible').filter({hasText: 'Maze'}).first(),
    ).toBeVisible({timeout: 15_000});
  }

  /**
   * Assert detail view uses the full lesson-name format.
   *
   * @param text - expected lesson title text
   */
  async expectDetailLessonText(text: string): Promise<void> {
    await expect(
      this.page.locator('span:visible').filter({hasText: text}).first(),
    ).toBeVisible({timeout: 15_000});
  }

  /**
   * Assert the teacher panel is absent for a student overview visit.
   */
  async expectTeacherPanelHidden(): Promise<void> {
    await expect(this.page.locator('.teacher-panel')).toBeHidden();
  }

  /**
   * Assert a summary progress bubble state.
   *
   * @param lesson - 1-based lesson number
   * @param level - 1-based level number
   * @param state - expected progress state
   */
  async expectSummaryProgress(
    lesson: number,
    level: number,
    state: ProgressState,
  ): Promise<void> {
    await this.expectProgress(
      this.page
        .locator('.uitest-summary-progress-table .uitest-summary-progress-row')
        .nth(lesson - 1)
        .locator('.progress-bubble')
        .nth(level - 1),
      state,
    );
  }

  /**
   * Assert a detail progress bubble state.
   *
   * @param lesson - 1-based lesson number
   * @param level - 1-based level number
   * @param state - expected progress state
   */
  async expectDetailProgress(
    lesson: number,
    level: number,
    state: ProgressState,
  ): Promise<void> {
    await this.expectProgress(
      this.page
        .locator('.uitest-detail-progress-table .uitest-progress-lesson')
        .nth(lesson - 1)
        .locator('.progress-bubble')
        .nth(level - 1),
      state,
    );
  }

  /**
   * Select a student in the teacher's "view as" dropdown.
   *
   * @param studentName - visible student option label
   */
  async selectViewAsStudent(studentName: string): Promise<void> {
    const selector = this.page.locator('#uitest-view-as-student-selector');
    await expect(selector).toBeVisible({timeout: 30_000});
    await selector.selectOption({label: studentName});
    await expect(
      this.page.locator('.uitest-summary-progress-table'),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Complete the K1 maze level used by the student-progress source scenario.
   */
  async completeK1MazeLevel(): Promise<void> {
    await this.completeBlocklyLevel(
      '/courses/allthethingscourse/units/1/lessons/2/levels/1',
      K1_MAZE_BLOCKS,
      1,
    );
  }

  /**
   * Complete the artist level used by the teacher-progress source scenario.
   *
   * @param blocks - serialized Blockly blocks for a winning artist solution
   */
  async completeArtistLevel(blocks: object): Promise<void> {
    await this.completeBlocklyLevel(
      '/courses/allthethingscourse/units/1/lessons/29/levels/4?level_name=2-3%20Artist%201%20new',
      blocks,
      4,
    );
  }

  /**
   * Complete a Blockly level by loading source blocks and running to congrats.
   *
   * @param url - dashboard-relative level URL
   * @param blocks - serialized Blockly workspace
   */
  private async completeBlocklyLevel(
    url: string,
    blocks: object,
    headerLevel: number,
  ): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await this.expectRunButtonReady();
    await this.page.evaluate(workspaceBlocks => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blockly = (window as any).Blockly;
      blockly.serialization.workspaces.load(
        workspaceBlocks,
        blockly.getMainWorkspace(),
      );
    }, blocks);
    await this.dismissLabOverlays();
    await this.page.locator('#runButton').click();
    await expect(this.page.locator('.congrats')).toBeVisible({
      timeout: 30_000,
    });
    await this.expectHeaderProgress(headerLevel, 'perfect');
  }

  /**
   * Complete the one-level App Lab lesson and wait for the unit overview
   * completion banner.
   */
  async completeSingleAppLabLesson(): Promise<void> {
    await this.page.goto(
      '/courses/ui-test-csp-2019/units/1/lessons/1/levels/1',
      {waitUntil: 'domcontentloaded'},
    );
    await this.expectRunButtonReady();
    await this.page.locator('#runButton').click();
    await expect(this.page.getByRole('button', {name: 'Finish'})).toBeVisible({
      timeout: 15_000,
    });
    await this.page.getByRole('button', {name: 'Finish'}).click();
    await expect(this.page.locator('#continue-button')).toBeVisible({
      timeout: 15_000,
    });
    await Promise.all([
      this.page.waitForURL(/\/courses\/ui-test-csp-2019\/units\/1$/, {
        timeout: 30_000,
      }),
      this.page.locator('#continue-button').click(),
    ]);
    await expect(
      this.page
        .locator('.uitest-end-of-lesson-header')
        .filter({hasText: 'You finished Lesson 1!'}),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Assert the end-of-lesson banner is gone after reload.
   */
  async expectEndOfLessonBannerClearsAfterReload(): Promise<void> {
    await this.page.reload({waitUntil: 'domcontentloaded'});
    await expect(this.page.locator('.uitest-end-of-lesson-header')).toBeHidden({
      timeout: 15_000,
    });
  }

  /**
   * Open the lesson plan link in a new tab.
   */
  async openLessonPlanInNewTab(): Promise<void> {
    await this.gotoUnitOverview(
      '/courses/allthelessonplans/units/1?no_redirect=true',
    );
    await expect(this.page.locator('#uitest-lesson-plan').first()).toBeVisible({
      timeout: 30_000,
    });

    const lessonPlanLink = this.page.locator('#uitest-lesson-plan').first();
    const href = await lessonPlanLink.getAttribute('href');
    expect(href).toContain('/courses/allthelessonplans/units/1/lessons/1');

    const targetPage = await this.page.context().newPage();
    await targetPage.goto(href!, {waitUntil: 'domcontentloaded'});
    await expect(targetPage).toHaveURL(
      /\/courses\/allthelessonplans\/units\/1\/lessons\/1/,
      {timeout: 30_000},
    );
  }

  /**
   * Assert a lesson-header progress bubble state.
   *
   * @param level - 1-based level number
   * @param state - expected progress state
   */
  async expectHeaderProgress(
    level: number,
    state: ProgressState,
  ): Promise<void> {
    await this.expectProgress(headerBubble(this.page, level), state);
  }

  /**
   * Assert summary progress, reloading if the overview loaded before progress
   * persistence became visible.
   *
   * @param lesson - 1-based lesson number
   * @param level - 1-based level number
   * @param state - expected progress state
   */
  async expectSummaryProgressAfterReloads(
    lesson: number,
    level: number,
    state: ProgressState,
  ): Promise<void> {
    await expect(async () => {
      try {
        await this.expectSummaryProgress(lesson, level, state);
      } catch (error) {
        await this.page.reload({waitUntil: 'domcontentloaded'});
        await expect(
          this.page.locator('.uitest-summary-progress-table'),
        ).toBeVisible({timeout: 30_000});
        throw error;
      }
    }).toPass({timeout: 120_000, intervals: [1000, 2000, 5000, 10_000]});
  }

  /**
   * Dispatch a progress assertion by state.
   *
   * @param bubble - progress bubble locator
   * @param state - expected state
   */
  private async expectProgress(
    bubble: Locator,
    state: ProgressState,
  ): Promise<void> {
    if (state === 'perfect') {
      await expectPerfect(bubble);
      return;
    }
    await expectNotTried(bubble);
  }

  /**
   * Wait for the lab run button, recovering from the visible slow-load screen.
   */
  private async expectRunButtonReady(): Promise<void> {
    await expect(async () => {
      const reloadLink = this.page.getByRole('link', {
        name: 'Try reloading the page',
      });
      if (await reloadLink.isVisible({timeout: 1_000}).catch(() => false)) {
        await this.page.reload({waitUntil: 'domcontentloaded'});
        throw new Error('long-load recovery triggered');
      }
      await expect(this.page.locator('#runButton')).toBeVisible({
        timeout: 10_000,
      });
    }).toPass({timeout: 120_000, intervals: [1000, 2000, 5000, 10_000]});
    await this.dismissLabOverlays();
  }

  /**
   * Dismiss user-visible lab overlays that block the run button.
   */
  private async dismissLabOverlays(): Promise<void> {
    const videoModal = this.page.locator('.video-modal.in');
    if (await videoModal.isVisible({timeout: 1_000}).catch(() => false)) {
      const closeButton = videoModal.locator('.close, [aria-label="Close"]');
      if (await closeButton.isVisible({timeout: 1_000}).catch(() => false)) {
        await closeButton.evaluate(element => (element as HTMLElement).click());
      } else {
        await this.page.keyboard.press('Escape');
      }
      await videoModal.waitFor({state: 'hidden', timeout: 10_000});
    }

    const okButton = this.page.getByRole('button', {name: 'OK'}).last();
    if (await okButton.isVisible({timeout: 2_000}).catch(() => false)) {
      await okButton.click();
    }

    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 1_000}).catch(() => false)) {
      await overlay.evaluate(element => (element as HTMLElement).click());
    }

    await this.page
      .locator('.modal-backdrop.in')
      .waitFor({state: 'hidden', timeout: 5_000})
      .catch(() => {});
  }
}

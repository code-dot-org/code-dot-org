import {expect, type Page} from '@playwright/test';

import {signIn} from '../../../shared/auth';

const RUBRIC_LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/48/levels/2';

const PROGRESS_COLORS = {
  not_tried: {bg: 'rgb(254, 254, 254)', border: 'rgb(198, 202, 205)'},
  perfect_assessment: {bg: 'rgb(140, 82, 186)', border: 'rgb(140, 82, 186)'},
} as const;

/**
 * Page object for AI evaluation of student code against rubrics.
 */
export class AiEvaluateStudentCodePage {
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Validate seeded rubric AI config through the same test-only endpoint used
   * by the Cucumber step.
   */
  async validateRubricAiConfig(): Promise<void> {
    await expect(async () => {
      const response = await this.page.request.get(
        '/api/test/get_validate_rubric_ai_config',
      );
      expect(response.status(), await response.text()).toBe(200);
    }).toPass({timeout: 30_000, intervals: [500, 1000, 2000]});
  }

  /**
   * Open the student homepage and wait for its visible ready container.
   */
  async gotoStudentHome(): Promise<void> {
    await this.page.goto('/home', {waitUntil: 'domcontentloaded'});
    await expect(this.page.locator('#homepage-container')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Navigate to the rubric level as the current user.
   */
  async gotoRubricLevel(sectionId?: number): Promise<void> {
    const sectionParam = sectionId ? `?section_id=${sectionId}` : '';
    await this.page.goto(`${RUBRIC_LEVEL_URL}${sectionParam}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.expectLabReady();
  }

  /**
   * Wait for the visible lab controls that show the level is interactive.
   */
  async expectLabReady(): Promise<void> {
    await expect(async () => {
      const reloadLink = this.page.getByRole('link', {
        name: 'Try reloading the page',
      });
      if (await reloadLink.isVisible({timeout: 1_000}).catch(() => false)) {
        await reloadLink.click();
        throw new Error('long-load recovery triggered');
      }
      await expect(this.page.locator('#runButton')).toBeVisible({
        timeout: 10_000,
      });
    }).toPass({timeout: 120_000, intervals: [1000, 2000, 5000, 10_000]});
    await expect(this.page.locator('.header_user')).toBeVisible();
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 3_000}).catch(() => false)) {
      await overlay.evaluate(element => (element as HTMLElement).click());
      await expect(overlay).toBeHidden();
    }
  }

  /**
   * Assert lesson-header progress by its visible bubble colors.
   *
   * @param levelNum - 1-based level number in the lesson header
   * @param progressType - expected progress state
   */
  async expectHeaderProgress(
    levelNum: number,
    progressType: keyof typeof PROGRESS_COLORS,
  ): Promise<void> {
    const levelLink = this.page
      .locator('.header_level .react_stage a')
      .nth(levelNum - 1);
    if (progressType === 'perfect_assessment') {
      await expect(levelLink).toContainText('\uf00c', {timeout: 60_000});
      return;
    }

    const bubble = levelLink.locator('.progress-bubble');
    const {bg, border} = PROGRESS_COLORS[progressType];
    await expect(async () => {
      const bgColor = await bubble.evaluate(
        element => getComputedStyle(element).backgroundColor,
      );
      const borderColor = await bubble.evaluate(
        element => getComputedStyle(element).borderTopColor,
      );
      expect(bgColor).toBe(bg);
      expect(borderColor).toBe(border);
    }).toPass({timeout: 30_000});
  }

  /**
   * Ensure Droplet is in text mode.
   */
  async ensureTextMode(): Promise<void> {
    const toggle = this.page.locator('#show-code-header');
    if ((await toggle.textContent()) === 'Show Text') {
      await toggle.evaluate(element => (element as HTMLElement).click());
      await expect(this.page.locator('.ace_editor')).toBeVisible();
    }
  }

  /**
   * Append text at the end of the Droplet/Ace editor.
   *
   * @param text - source text to append
   */
  async appendTextToDroplet(text: string): Promise<void> {
    await this.page.evaluate(source => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const droplet = (window as any).__TestInterface?.getDroplet?.();
      if (droplet) {
        droplet.aceEditor.navigateFileEnd();
        droplet.aceEditor.textInput.focus();
        droplet.aceEditor.onTextInput(source);
      }
    }, text);
  }

  /**
   * Enter the standard source text used by the source Cucumber scenarios.
   */
  async appendRubricSampleCode(): Promise<void> {
    await expect(async () => {
      await this.ensureTextMode();
      await this.appendTextToDroplet(
        '// the quick brown fox jumped over the lazy dog.\n',
      );
      await this.expectProjectSaved();
    }).toPass({timeout: 90_000, intervals: [1000, 2000, 5000]});
  }

  /**
   * Run the project and wait for visible save completion.
   */
  async runAndWaitForSaved(): Promise<void> {
    await this.page.locator('#runButton').click();
    await this.expectProjectSaved();
  }

  /**
   * Wait for the visible project save indicator.
   */
  private async expectProjectSaved(): Promise<void> {
    const saveStatus = this.page.locator('.project_updated_at');
    await expect(async () => {
      const text = (await saveStatus.textContent()) ?? '';
      if (text.includes('Error saving project')) {
        throw new Error(text.trim());
      }
      expect(text).toContain('Saved');
    }).toPass({timeout: 60_000, intervals: [1000, 2000, 5000]});
  }

  /**
   * Run and submit the Game Lab level.
   */
  async submitGamelabLevel(): Promise<void> {
    await this.runAndWaitForSaved();
    await expect(this.page.locator('#submitButton')).toBeVisible({
      timeout: 20_000,
    });
    await Promise.all([
      this.page.waitForURL(/\/lessons\/49\/levels\/1/, {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      }),
      this.page
        .locator('#submitButton')
        .evaluate(element => (element as HTMLElement).click()),
    ]);
  }

  /**
   * Sign in as the teacher and open this student's work from the teacher panel.
   *
   * @param teacherEmail - teacher login email
   * @param teacherPassword - teacher login password
   * @param studentName - visible student name in the teacher panel
   * @param sectionId - section context to load the teacher panel with
   */
  async teacherViewStudentWork(
    teacherEmail: string,
    teacherPassword: string,
    studentName: string,
    sectionId: number,
  ): Promise<void> {
    await signIn(this.page, teacherEmail, teacherPassword);
    await this.page.goto('/teacher_dashboard/home', {
      waitUntil: 'domcontentloaded',
    });
    await expect(
      this.page.getByRole('heading', {name: 'Class Sections'}),
    ).toBeVisible({timeout: 30_000});
    await this.gotoRubricLevel(sectionId);

    const studentRow = this.page
      .locator('.teacher-panel td')
      .filter({hasText: studentName})
      .first();
    await expect(async () => {
      if (!(await studentRow.isVisible({timeout: 10_000}).catch(() => false))) {
        await this.page.reload({waitUntil: 'domcontentloaded'});
        await this.expectLabReady();
        throw new Error('teacher-panel student row not visible yet');
      }
    }).toPass({timeout: 90_000, intervals: [1000, 2000, 5000, 10_000]});
    await Promise.all([
      this.page.waitForURL(/user_id=/, {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      }),
      studentRow.evaluate(element => (element as HTMLElement).click()),
    ]);
    await this.expectTeacherStudentWorkReady();
  }

  /**
   * Wait for the teacher-facing student work view. The rubric FAB is the
   * readiness signal because the following steps operate on the teaching
   * assistant, and the readonly lab can show the long-load message.
   */
  async expectTeacherStudentWorkReady(): Promise<void> {
    await expect(this.page.locator('#ui-floatingActionButton')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Dismiss the AI teaching assistant product tour if this teacher has not
   * seen it before.
   */
  async dismissProductTourIfPresent(): Promise<void> {
    const skipBtn = this.page.locator('.introjs-skipbutton').first();
    const hasSkipButton = await skipBtn
      .waitFor({state: 'attached', timeout: 5_000})
      .then(() => true)
      .catch(() => false);
    if (hasSkipButton) {
      const tourSeen = this.page
        .waitForResponse(
          response => response.url().includes('update_ai_rubrics_tour_seen'),
          {timeout: 15_000},
        )
        .catch(() => {});
      await this.page.evaluate(() => {
        (document.querySelector('.introjs-skipbutton') as HTMLElement)?.click();
      });
      await expect(this.page.locator('.introjs-overlay')).toBeHidden();
      await tourSeen;
    }
    await this.page
      .locator('.congrats')
      .waitFor({state: 'hidden', timeout: 10_000})
      .catch(() => {});
  }

  /**
   * Open the rubric floating action button.
   */
  async openRubricPanel(): Promise<void> {
    await this.dismissProductTourIfPresent();
    await this.page.locator('#ui-floatingActionButton').click();
    await expect(this.page.locator('#uitest-rubric-content')).toBeVisible({
      timeout: 15_000,
    });
    await this.dismissProductTourIfPresent();
  }

  /**
   * Assert automatic AI evaluation is already complete.
   */
  async expectAutomaticEvaluationComplete(): Promise<void> {
    await expect(this.page.locator('.uitest-run-ai-assessment')).toBeDisabled({
      timeout: 10_000,
    });
    await expect(
      this.page.locator(
        '.uitest-rubric-tab-buttons .__react_component_tooltip',
      ),
    ).toContainText('AI analysis already completed for this project.', {
      timeout: 15_000,
    });
  }

  /**
   * Assert the current student is in progress and manual AI evaluation can run.
   */
  async expectManualEvaluationReady(): Promise<void> {
    await expect(this.page.locator('.uitest-run-ai-assessment')).toBeEnabled({
      timeout: 30_000,
    });
    await expect(
      this.page.locator('.uitest-student-progress-status'),
    ).toContainText('In progress', {timeout: 30_000});
  }

  /**
   * Trigger AI evaluation for the selected student.
   */
  async runIndividualAiEvaluation(): Promise<void> {
    await this.dismissProductTourIfPresent();
    await this.page.locator('.uitest-run-ai-assessment').click();
    await expect(
      this.page.locator(
        '.uitest-rubric-tab-buttons .__react_component_tooltip',
      ),
    ).toContainText('AI analysis complete.', {timeout: 120_000});
  }

  /**
   * Trigger AI evaluation for all students in the class.
   */
  async runClassWideAiEvaluation(): Promise<void> {
    await this.dismissProductTourIfPresent();
    await this.page.locator('#class-data-button').click();
    await expect(
      this.page.locator('.uitest-run-ai-assessment-all'),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(this.page.locator('#ui-teacherFeedback')).toBeEnabled({
      timeout: 10_000,
    });
    await expect(
      this.page.locator('.uitest-run-ai-assessment-all'),
    ).toBeEnabled({
      timeout: 10_000,
    });
    await this.page.locator('.uitest-run-ai-assessment-all').click();
    await expect(
      this.page.locator('.uitest-eval-status-all-text'),
    ).toContainText('AI analysis complete.', {timeout: 30_000});
    await this.dismissProductTourIfPresent();
    await this.page.locator('#assess-a-student-button').click();
    await expect(this.page.locator('#uitest-rubric-content')).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * Assert the rubric shows the stubbed AI evaluation result for Sprites.
   *
   * @param studentName - student name expected in the AI result copy
   */
  async expectSpritesEvaluationResult(studentName: string): Promise<void> {
    await expect(this.page.locator('#uitest-next-goal')).toBeVisible({
      timeout: 10_000,
    });
    await this.page.locator('#uitest-next-goal').click();
    await expect(
      this.page.locator('.uitest-learning-goal-title'),
    ).toContainText('Sprites', {timeout: 10_000});
    await expect(
      this.page.locator('.uitest-student-progress-status'),
    ).toContainText('Ready to review', {timeout: 60_000});
    await expect(this.page.locator('.uitest-ai-assessment')).toContainText(
      `${studentName} has achieved Extensive or Convincing Evidence`,
      {timeout: 60_000},
    );
  }

  /**
   * Assert the dismissible AI-score alert appears, dismiss it, and verify it
   * stays absent after reload.
   */
  async dismissAiScoresReadyAlertAndExpectPersistence(): Promise<void> {
    await this.dismissProductTourIfPresent();
    await this.waitForAiScoreBadge();
    await expect(this.page.locator('.uitest-dismissible-alert')).toBeVisible();
    await this.page.locator('.uitest-dismissible-alert .fa-xmark').click();
    await expect(this.page.locator('.uitest-dismiss-confirmed')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      this.page.locator('.uitest-dismissible-alert'),
    ).not.toBeVisible();

    await this.page.reload({waitUntil: 'domcontentloaded'});
    await this.expectTeacherStudentWorkReady();
    await this.waitForAiScoreBadge();
    await expect(
      this.page.locator('.uitest-dismissible-alert'),
    ).not.toBeVisible();
  }

  /**
   * Wait for the visible AI scores badge. The source Cucumber scenario waits on
   * `.uitest-count-bubble`; a reload can be needed while rubric Redux data
   * catches up to freshly submitted student work.
   */
  private async waitForAiScoreBadge(): Promise<void> {
    await expect(async () => {
      await expect(this.page.locator('#ui-floatingActionButton')).toBeVisible({
        timeout: 20_000,
      });
      await this.dismissProductTourIfPresent();
      if (
        !(await this.page
          .locator('.uitest-count-bubble')
          .isVisible({timeout: 10_000})
          .catch(() => false))
      ) {
        await this.page.reload({waitUntil: 'domcontentloaded'});
        await this.expectTeacherStudentWorkReady();
        throw new Error('AI score alert badge not visible yet');
      }
    }).toPass({timeout: 90_000, intervals: [1000, 2000, 5000, 10_000]});
  }
}

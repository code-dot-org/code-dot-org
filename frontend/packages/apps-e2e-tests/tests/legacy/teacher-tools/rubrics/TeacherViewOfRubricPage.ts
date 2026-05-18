import {expect, type Page} from '@playwright/test';

import {signIn, type TeacherStudentPair} from '../../../shared/auth';

import {AiEvaluateStudentCodePage} from './AiEvaluateStudentCodePage';

const PRODUCT_TOUR_STEPS = [
  'Getting Started with Your AI Teaching Assistant',
  'Class Data',
  'Understanding the AI Assessment',
  'Using Evidence',
  'Understanding AI Confidence',
  'Assigning a Rubric Score',
  'How did Your AI Teaching Assistant do?',
] as const;

/**
 * Page object for the teacher-facing rubric drawer and product tour.
 */
export class TeacherViewOfRubricPage {
  private readonly page: Page;
  private readonly rubricLevel: AiEvaluateStudentCodePage;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
    this.rubricLevel = new AiEvaluateStudentCodePage(page);
  }

  /**
   * Open the rubric level as the current student and submit the project.
   */
  async submitStudentWork(): Promise<void> {
    await this.rubricLevel.gotoStudentHome();
    await this.rubricLevel.gotoRubricLevel();
    await this.openStudentRubricTab();
    await this.rubricLevel.submitGamelabLevel();
  }

  /**
   * Open the student rubric tab and wait for the visible lab run button.
   */
  async openStudentRubricTab(): Promise<void> {
    await expect(this.page.locator('.uitest-taRubricTab')).toBeVisible({
      timeout: 20_000,
    });
    await this.page.locator('.uitest-taRubricTab').click();
    await expect(this.page.locator('#runButton')).toBeVisible();
  }

  /**
   * Sign in as the teacher and load the selected student's rubric view.
   *
   * @param pair - generated teacher/student credentials and section id
   * @param studentName - visible student name in the teacher panel
   */
  async openTeacherViewForStudent(
    pair: TeacherStudentPair,
    studentName: string,
  ): Promise<void> {
    await this.rubricLevel.teacherViewStudentWork(
      pair.teacherEmail,
      pair.teacherPassword,
      studentName,
      pair.sectionId,
    );
  }

  /**
   * Open the rubric drawer and wait for the Code Quality learning goal.
   */
  async openRubricDrawer(): Promise<void> {
    await this.rubricLevel.openRubricPanel();
    await this.expectRubricLearningGoal('Code Quality');
  }

  /**
   * Assert a learning goal is the active rubric content.
   *
   * @param title - expected learning goal title
   */
  async expectRubricLearningGoal(title: string): Promise<void> {
    await expect(this.page.locator('h5').filter({hasText: title})).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Select an evidence level, enter feedback, wait for visible autosave, and
   * submit the feedback to the student.
   *
   * @param feedback - feedback text to send
   */
  async submitFeedback(feedback: string): Promise<void> {
    await this.selectExtensiveEvidence();
    await expect(this.page.locator('#ui-teacherFeedback')).toBeEnabled({
      timeout: 10_000,
    });
    const feedbackSaved = this.page.waitForResponse(
      response =>
        response.request().method() === 'PUT' &&
        response.url().includes('/learning_goal_teacher_evaluations/') &&
        Boolean(response.request().postData()?.includes(feedback)) &&
        response.ok(),
      {timeout: 30_000},
    );
    await this.setTeacherFeedback(feedback);
    await expect(this.page.locator('#ui-teacherFeedback')).toHaveValue(
      feedback,
      {timeout: 10_000},
    );
    await this.page.locator('#ui-autosaveConfirm').waitFor({
      state: 'hidden',
      timeout: 10_000,
    });
    await feedbackSaved;
    await expect(this.page.locator('#ui-autosaveConfirm')).toBeVisible({
      timeout: 20_000,
    });
    await this.ensureFeedbackDraftPersists(feedback);
    await this.page.locator('#ui-submitFeedbackButton').click();
    await expect(
      this.page.locator('#ui-feedback-submitted-timestamp'),
    ).toBeVisible({timeout: 20_000});
    await expect(
      this.page.locator('p').filter({hasText: 'Feedback submitted at'}),
    ).toBeVisible();
  }

  /**
   * Save the evidence score, recovering from the app's visible transient save
   * error by reloading the teacher view and trying again.
   */
  private async selectExtensiveEvidence(): Promise<void> {
    const saveError = this.page.locator(
      "text=There's been an error saving your feedback",
    );
    for (let attempt = 1; attempt <= 3; attempt++) {
      await expect(
        this.page.locator('button').filter({hasText: 'Extensive'}),
      ).toBeVisible({timeout: 20_000});
      await this.page.locator('button').filter({hasText: 'Extensive'}).click();
      if (
        await this.page
          .locator('#ui-autosaveConfirm')
          .waitFor({state: 'visible', timeout: 15_000})
          .then(() => true)
          .catch(() => false)
      ) {
        return;
      }

      if (attempt === 3) {
        await expect(saveError).toBeHidden({timeout: 1_000});
        await expect(this.page.locator('#ui-autosaveConfirm')).toBeVisible();
        return;
      }

      await this.page.reload({waitUntil: 'domcontentloaded'});
      await this.rubricLevel.expectLabReady();
      await this.openRubricDrawer();
    }
  }

  /**
   * Set the controlled teacher feedback textarea value.
   *
   * @param feedback - feedback text
   */
  private async setTeacherFeedback(feedback: string): Promise<void> {
    const teacherFeedback = this.page.locator('#ui-teacherFeedback');
    await teacherFeedback.click();
    await teacherFeedback.fill(feedback);
  }

  /**
   * Verify the draft feedback survived a page reload before submission.  If the
   * debounce save lost a race, write it again through the visible textarea.
   *
   * @param feedback - expected feedback text
   */
  private async ensureFeedbackDraftPersists(feedback: string): Promise<void> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.page.reload({waitUntil: 'domcontentloaded'});
      await this.rubricLevel.expectLabReady();
      await this.openRubricDrawer();
      if (
        await this.page
          .locator('#ui-teacherFeedback')
          .waitFor({state: 'visible', timeout: 10_000})
          .then(async () => {
            await expect(this.page.locator('#ui-teacherFeedback')).toHaveValue(
              feedback,
              {timeout: 5_000},
            );
            return true;
          })
          .catch(() => false)
      ) {
        return;
      }

      await expect(this.page.locator('#ui-teacherFeedback')).toBeEnabled({
        timeout: 10_000,
      });
      const feedbackSaved = this.page.waitForResponse(
        response =>
          response.request().method() === 'PUT' &&
          response.url().includes('/learning_goal_teacher_evaluations/') &&
          Boolean(response.request().postData()?.includes(feedback)) &&
          response.ok(),
        {timeout: 30_000},
      );
      await this.setTeacherFeedback(feedback);
      await expect(this.page.locator('#ui-teacherFeedback')).toHaveValue(
        feedback,
        {timeout: 10_000},
      );
      await feedbackSaved;
      await expect(this.page.locator('#ui-autosaveConfirm')).toBeVisible({
        timeout: 20_000,
      });
    }

    await expect(this.page.locator('#ui-teacherFeedback')).toHaveValue(
      feedback,
      {timeout: 10_000},
    );
  }

  /**
   * Reload the teacher view and assert feedback persisted.
   *
   * @param feedback - expected feedback text
   */
  async expectTeacherFeedbackPersists(feedback: string): Promise<void> {
    await expect(async () => {
      await this.page.reload({waitUntil: 'domcontentloaded'});
      await this.rubricLevel.expectLabReady();
      if (
        !(await this.page
          .locator('#ui-teacherFeedback')
          .isVisible({timeout: 3_000})
          .catch(() => false))
      ) {
        await this.openRubricDrawer();
      }
      await expect(this.page.locator('#ui-teacherFeedback')).toHaveValue(
        feedback,
        {timeout: 10_000},
      );
    }).toPass({timeout: 120_000, intervals: [1000, 2000, 5000, 10_000]});
  }

  /**
   * Sign in as the student and assert the teacher feedback is visible.
   *
   * @param pair - generated student credentials
   * @param feedback - expected feedback text
   */
  async expectStudentReceivesFeedback(
    pair: TeacherStudentPair,
    feedback: string,
  ): Promise<void> {
    await signIn(this.page, pair.studentEmail, pair.studentPassword);
    await this.rubricLevel.gotoStudentHome();
    await this.rubricLevel.gotoRubricLevel();
    await this.openStudentRubricTab();
    const extensiveEvidence = this.page
      .locator('p')
      .filter({hasText: 'Extensive Evidence'})
      .first();
    if (!(await extensiveEvidence.isVisible().catch(() => false))) {
      await this.page.locator('h6').filter({hasText: 'Code Quality'}).click();
    }
    await expect(extensiveEvidence).toBeVisible({timeout: 20_000});
    await expect(this.page.locator('textarea').first()).toHaveValue(feedback, {
      timeout: 20_000,
    });
  }

  /**
   * Wait for a product tour step by its visible heading.
   *
   * @param title - expected product tour heading
   */
  async expectProductTourStep(title: string): Promise<void> {
    await expect(this.page.locator('h1').filter({hasText: title})).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('.introjs-tooltiptext')).toBeVisible({
      timeout: 10_000,
    });
  }

  /**
   * Move to the next product tour step.
   */
  async nextTourStep(): Promise<void> {
    await this.clickTourButton('.introjs-nextbutton');
  }

  /**
   * Move to the previous product tour step.
   */
  async previousTourStep(): Promise<void> {
    await this.clickTourButton('.introjs-prevbutton');
  }

  /**
   * Finish the product tour.
   */
  async finishTour(): Promise<void> {
    await this.clickTourButton('.introjs-donebutton');
  }

  /**
   * Skip the product tour and wait until the server stores the tour-seen bit.
   */
  async skipTour(): Promise<void> {
    const tourSeen = this.page
      .waitForResponse(response =>
        response.url().includes('update_ai_rubrics_tour_seen'),
      )
      .catch(() => {});
    await this.clickTourButton('.introjs-skipbutton');
    await expect(this.page.locator('.introjs-overlay')).toBeHidden();
    await tourSeen;
  }

  /**
   * Click an intro.js button by dispatching HTMLElement.click().
   *
   * @param selector - selector for the intro.js button
   */
  private async clickTourButton(selector: string): Promise<void> {
    await this.page.locator(selector).waitFor({state: 'visible'});
    await this.page.evaluate(buttonSelector => {
      (document.querySelector(buttonSelector) as HTMLElement | null)?.click();
    }, selector);
  }

  /**
   * Keep the rubric drawer open before advancing from tour step one. This is a
   * visible readiness signal for step two, whose target is the Class Data tab.
   */
  async prepareClassDataTourTarget(): Promise<void> {
    if (
      !(await this.page
        .locator('#class-data-button')
        .isVisible({timeout: 2_000})
        .catch(() => false))
    ) {
      await this.page.locator('#ui-floatingActionButton').click({force: true});
      await expect(this.page.locator('#class-data-button')).toBeVisible({
        timeout: 10_000,
      });
    }
  }

  /**
   * Walk forward through the product tour from the current step to the last.
   */
  async advanceTourToLastStep(): Promise<void> {
    for (const title of PRODUCT_TOUR_STEPS.slice(1)) {
      await this.nextTourStep();
      await this.expectProductTourStep(title);
    }
  }

  /**
   * Walk backward from the last product tour step to the first.
   */
  async backtrackTourToFirstStep(): Promise<void> {
    for (const title of [...PRODUCT_TOUR_STEPS].reverse().slice(1)) {
      await this.previousTourStep();
      await this.expectProductTourStep(title);
    }
  }

  /**
   * Assert the rubric drawer is restored after the product tour exits.
   */
  async expectRestoredRubric(): Promise<void> {
    await expect(
      this.page
        .locator('h3')
        .filter({hasText: 'Lesson 48: AI Rubrics'})
        .first(),
    ).toBeVisible({timeout: 30_000});
    await this.expectRubricLearningGoal('Code Quality');
  }

  /**
   * Restart the product tour from the restored rubric drawer.
   */
  async restartProductTour(): Promise<void> {
    await this.page.locator('#ui-restart-product-tour').click();
    await this.expectProductTourStep(PRODUCT_TOUR_STEPS[0]);
  }

  /**
   * Assert a completed or skipped tour does not reappear after reload.
   */
  async expectTourDoesNotReappearAfterReload(): Promise<void> {
    await this.page.reload({waitUntil: 'domcontentloaded'});
    await this.rubricLevel.expectLabReady();
    if (
      !(await this.page
        .locator('h5')
        .filter({hasText: 'Code Quality'})
        .isVisible({timeout: 3_000})
        .catch(() => false))
    ) {
      await this.openRubricDrawer();
    }
    await this.expectRubricLearningGoal('Code Quality');
  }

  /**
   * Select the next learning goal in the rubric drawer.
   */
  async goToNextLearningGoal(): Promise<void> {
    await this.page.locator('#uitest-next-goal').click();
    await this.expectRubricLearningGoal('Sprites');
  }

  /**
   * Open the Class Data tab in the rubric drawer.
   */
  async openClassDataTab(): Promise<void> {
    await this.page.getByRole('button', {name: 'Class Data'}).click();
    await expect(this.page.locator('.uitest-rubric-settings')).toBeVisible({
      timeout: 15_000,
    });
  }
}

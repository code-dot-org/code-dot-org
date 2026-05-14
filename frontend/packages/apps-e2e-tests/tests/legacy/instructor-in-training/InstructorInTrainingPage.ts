import {expect, type Locator, type Page} from '@playwright/test';

const COURSE = 'alltheselfpacedplthings';

/**
 * Page Object for Self-Paced PL Instructor in Training level visibility.
 *
 * The visible readiness signals were checked with Agent Browser against
 * test-studio.code.org: App Lab and Dance expose their user-facing lab tabs,
 * while non-lab level types expose their level container and submit UI.
 */
export class InstructorInTrainingPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Instructor mode label shown to non-universal teachers. */
  readonly instructorTag: Locator;

  /** Teacher-only tab in App Lab and Dance lab side panels. */
  readonly teacherOnlyTab: Locator;

  /** Instructions tab visible to all lab users. */
  readonly instructionsTab: Locator;

  /** Teacher-only block on non-lab level types. */
  readonly teacherOnlyContent: Locator;

  /** Free-response level container. */
  readonly freeResponse: Locator;

  /** External level container. */
  readonly externalLevel: Locator;

  /** Bubble-choice level container. */
  readonly bubbleChoice: Locator;

  /** Level-group level container. */
  readonly levelGroup: Locator;

  /** Submit button used as a visible readiness signal on unverified pages. */
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.instructorTag = page.locator('#instructor_in_training_tag');
    this.teacherOnlyTab = page.locator('.uitest-teacherOnlyTab').first();
    this.instructionsTab = page.locator('.uitest-instructionsTab').first();
    this.teacherOnlyContent = page.locator('.teacher.hide-as-student');
    this.freeResponse = page.locator('.free-response');
    this.externalLevel = page.locator('.external');
    this.bubbleChoice = page.locator('.bubble-choice');
    this.levelGroup = page.locator('.level-group');
    this.submitButton = page.locator('.submitButton');
  }

  /**
   * Navigate to an Instructor in Training level.
   *
   * @param lesson - lesson number within alltheselfpacedplthings unit 1
   * @param level - level number within that lesson
   */
  async gotoLevel(lesson: number, level: number): Promise<void> {
    await this.page.goto(
      `/courses/${COURSE}/units/1/lessons/${lesson}/levels/${level}?noautoplay=true`,
    );
  }

  /**
   * Wait for App Lab to be visibly ready.
   * The saved-state text and Run button are user-visible readiness signals.
   */
  async waitForAppLab(): Promise<void> {
    await expect(this.page.getByRole('button', {name: /^Run$/})).toBeVisible({
      timeout: 45_000,
    });
    await expect(this.page.getByText(/Saved|Saving/).first()).toBeVisible();
  }

  /**
   * Wait for Dance to be visibly ready, then dismiss optional overlays.
   * Dance shows the Run button after the lab is interactive.
   */
  async waitForDance(): Promise<void> {
    await expect(this.page.getByRole('button', {name: /^Run$/})).toBeVisible({
      timeout: 45_000,
    });
    await this.dismissOptionalOverlays();
  }

  /**
   * Dismiss modal overlays that can cover Dance/App Lab instructions.
   * Uses DOM click without jQuery for legacy overlays that can intercept
   * pointer clicks while still being valid user-facing close targets.
   */
  async dismissOptionalOverlays(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible()) {
      await overlay.evaluate(element => (element as HTMLElement).click());
    }

    const closeButton = this.page.getByRole('button', {name: 'Close'}).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Open the teacher-only tab and assert its content.
   *
   * @param expectedText - teacher-only markdown expected in the editor column
   * @param expectExampleSolution - whether the example-solution link is shown
   */
  async expectTeacherOnlyLabContent(
    expectedText: string,
    expectExampleSolution: boolean,
  ): Promise<void> {
    await expect(this.teacherOnlyTab).toBeVisible();
    await this.teacherOnlyTab.click();
    const editorColumn = this.page
      .locator('.editor-column')
      .filter({hasText: expectedText})
      .first();
    await expect(editorColumn).toBeVisible();
    await expect(editorColumn).toContainText('For Teachers Only');
    if (expectExampleSolution) {
      await expect(
        this.page.getByRole('link', {name: 'Example Solution 1'}).first(),
      ).toBeVisible();
    }
  }

  /** Assert the user sees the instructor-in-training tag. */
  async expectInstructorTag(): Promise<void> {
    await expect(this.instructorTag).toContainText('Viewing As Instructor');
  }

  /** Assert the instructor-in-training tag is absent for universal instructors. */
  async expectNoInstructorTag(): Promise<void> {
    await expect(this.instructorTag).toBeHidden();
  }

  /** Assert teacher-only lab access is hidden from an unverified teacher. */
  async expectNoTeacherOnlyLabTab(): Promise<void> {
    await expect(this.instructionsTab).toBeVisible();
    await expect(this.teacherOnlyTab).toBeHidden();
  }

  /**
   * Assert visible teacher-only content on a non-lab level.
   *
   * @param readyLocator - visible level container used as readiness signal
   * @param expectedTexts - teacher-only texts that must render
   */
  async expectTeacherOnlyLevelContent(
    readyLocator: Locator,
    expectedTexts: string[],
  ): Promise<void> {
    await expect(readyLocator).toBeVisible({timeout: 45_000});
    await expect(
      this.teacherOnlyContent.filter({hasText: 'For Teachers Only'}).first(),
    ).toBeVisible();
    for (const text of expectedTexts) {
      await expect(
        this.teacherOnlyContent.filter({hasText: text}).first(),
      ).toBeVisible();
    }
  }

  /**
   * Assert teacher-only content is hidden on a non-lab level.
   *
   * @param readyLocator - visible level container used as readiness signal
   */
  async expectNoTeacherOnlyLevelContent(readyLocator: Locator): Promise<void> {
    await expect(readyLocator).toBeVisible({timeout: 45_000});
    await expect(this.teacherOnlyContent).toBeHidden();
  }
}

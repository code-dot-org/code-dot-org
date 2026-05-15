import {type Locator, type Page} from '@playwright/test';

import {expect} from '../../shared/fixtures';

/**
 * Page object for teacher lesson plan pages.
 */
export class TeacherLessonPlanPage {
  readonly page: Page;
  readonly showContainer: Locator;
  readonly progressPills: Locator;
  readonly lessonDropdown: Locator;
  readonly modal: Locator;
  readonly modalBackdrop: Locator;
  readonly discussionGoalTab: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.showContainer = page.locator('#show-container');
    this.progressPills = page.locator('.uitest-ProgressPill');
    this.lessonDropdown = page.locator('.uitest-lesson-dropdown-nav');
    this.modal = page.locator('.modal');
    this.modalBackdrop = page.locator('.modal-backdrop');
    this.discussionGoalTab = page.locator('.unit-test-tip-tab');
  }

  /**
   * Opens a teacher lesson plan.
   *
   * @param lessonNumber - lesson number in allthelessonplans unit 1
   */
  async openLesson(lessonNumber: number): Promise<void> {
    await this.page.goto(
      `/courses/allthelessonplans/units/1/lessons/${lessonNumber}`,
    );
    await this.expectReady();
  }

  /**
   * Waits for the main lesson-plan container visible to users.
   */
  async expectReady(): Promise<void> {
    await expect(this.showContainer).toBeVisible({timeout: 30_000});
  }

  /**
   * Verifies the lesson title.
   *
   * @param title - visible heading text
   */
  async expectLessonTitle(title: string): Promise<void> {
    await expect(this.page.getByRole('heading', {name: title})).toBeVisible();
  }

  /**
   * Verifies the first-lesson content sections.
   */
  async expectFirstLessonSections(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {name: 'Overview'}),
    ).toBeVisible();
    await expect(
      this.page.getByText('Teacher overview of the lesson'),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: 'Purpose'}),
    ).toBeVisible();
    await expect(
      this.page.getByText('Purpose of this lesson is learning'),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: 'Assessment Opportunities'}),
    ).toBeVisible();
    await expect(
      this.page.getByText('Assessment opportunities are everywhere'),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: 'Objectives'}),
    ).toBeVisible();
    await expect(this.page.getByText('Learn lots of stuff')).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: /Prep|Preparation/}),
    ).toBeVisible();
    await expect(this.page.getByText('Do this', {exact: true})).toBeVisible();
    await expect(this.page.getByRole('heading', {name: 'Links'})).toBeVisible();
    await expect(
      this.page.getByRole('link', {name: 'Student Resource'}),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: 'Vocabulary'}),
    ).toBeVisible();
    await expect(
      this.page.getByText('Word - This is a definition of the word word'),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: 'Introduced Code'}),
    ).toBeVisible();
    await expect(
      this.page.getByRole('link', {name: /playSound/}),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: 'Teaching Guide'}),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', {name: 'Activity 1'}),
    ).toBeVisible();
    await expect(this.progressPills.first()).toBeVisible();
  }

  /**
   * Verifies announcement notification content.
   */
  async expectAnnouncements(): Promise<void> {
    const announcements = this.page.locator('.announcement-notification');
    await expect(announcements.first()).toContainText(
      'Information for Teachers',
    );
    await expect(announcements.nth(1)).toContainText(
      'Information for Students and Teachers',
    );
  }

  /**
   * Collapses the discussion goal and verifies it is no longer visible.
   */
  async collapseDiscussionGoal(): Promise<void> {
    const discussionGoal = this.page.getByText('Get students to talk');
    await expect(this.discussionGoalTab).toBeVisible();
    await expect(discussionGoal).toBeVisible();
    await this.discussionGoalTab.click();
    await expect(discussionGoal).toBeHidden();
  }

  /**
   * Opens a level details dialog by progress pill index.
   *
   * @param index - zero-based progress pill index
   */
  async openLevelDetails(index: number): Promise<void> {
    await this.progressPills.nth(index).click();
    await expect(this.modal).toBeVisible({timeout: 30_000});
    await expect(this.modalBackdrop).toBeVisible();
    await expect(
      this.modal.getByRole('button', {name: 'Dismiss'}),
    ).toBeVisible();
  }

  /**
   * Dismisses the visible level details dialog.
   */
  async dismissLevelDetails(): Promise<void> {
    await this.modal.getByRole('button', {name: 'Dismiss'}).click();
    await expect(this.modalBackdrop).toBeHidden({timeout: 30_000});
  }

  /**
   * Navigates from lesson 1 to lesson 2 using the lesson dropdown.
   */
  async navigateToSecondLesson(): Promise<void> {
    await expect(this.lessonDropdown).toBeVisible();
    await this.lessonDropdown.click();
    await expect(this.page.locator('a.no-navigation').nth(1)).toBeVisible();
    await this.page.locator('a.no-navigation').nth(1).click();
    await expect(
      this.page.locator('a.navigate', {hasText: '2 - Second Lesson'}),
    ).toBeVisible();

    await Promise.all([
      this.page.waitForURL(
        /\/courses\/allthelessonplans\/units\/1\/lessons\/2$/,
        {
          timeout: 30_000,
          waitUntil: 'domcontentloaded',
        },
      ),
      this.page.locator('a.navigate', {hasText: '2 - Second Lesson'}).click(),
    ]);
    await this.expectReady();
    await this.expectLessonTitle('Lesson 2: Second Lesson');
  }

  /**
   * Navigates from a lesson page back to the unit overview.
   */
  async navigateToUnitOverview(): Promise<void> {
    await Promise.all([
      this.page.waitForURL(/\/courses\/allthelessonplans\/units\/1$/, {
        timeout: 30_000,
        waitUntil: 'domcontentloaded',
      }),
      this.page
        .getByRole('link', {name: /All The Lesson Plans/})
        .first()
        .click(),
    ]);
  }
}

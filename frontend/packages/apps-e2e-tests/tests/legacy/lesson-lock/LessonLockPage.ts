import {expect, type Locator, type Page} from '@playwright/test';

interface LockStatusStudent {
  user_level_data: Record<string, unknown>;
  locked: boolean;
  readonly_answers: boolean;
}

interface LockStatusSection {
  lessons?: Record<string, LockStatusStudent[]>;
}

interface LockStatusResponse {
  [sectionId: string]: LockStatusSection;
}

/**
 * Page object for lockable lessons on allthethingscourse unit 1.
 */
export class LessonLockPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Unit overview progress table. */
  readonly progressTable: Locator;

  /** Lesson lock dialog body. */
  readonly modalBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.progressTable = page.locator('.uitest-summary-progress-table');
    this.modalBody = page.locator('.modal-body');
  }

  /**
   * Opens allthethingscourse unit 1 for a specific section.
   *
   * @param sectionId - section id from the test section setup
   */
  async gotoUnitOverview(
    sectionId: number,
    options: {teacherControls?: boolean} = {},
  ): Promise<void> {
    await this.page.goto(
      `/courses/allthethingscourse/units/1?section_id=${sectionId}`,
    );
    await expect(
      this.page.getByRole('heading', {name: 'All the Things!'}),
    ).toBeVisible({
      timeout: 30_000,
    });
    if (options.teacherControls) {
      await expect(
        this.page.locator('.uitest-locksettings').first(),
      ).toBeVisible({timeout: 30_000});
      await expect(this.page.getByText('Lesson 1: Jigsaw')).toBeVisible({
        timeout: 30_000,
      });
    } else {
      await expect(this.page.locator('table:visible').first()).toBeVisible({
        timeout: 30_000,
      });
    }
  }

  /**
   * Asserts the visible lock icon for a lesson row.
   *
   * @param lessonName - visible lesson row text
   * @param status - expected lock status
   */
  async expectLessonStatus(
    lessonName: string,
    status: 'locked' | 'unlocked',
  ): Promise<void> {
    const iconClass = status === 'locked' ? 'fa-lock' : 'fa-unlock';
    const lessonCell = this.page
      .locator('td:visible')
      .filter({hasText: lessonName})
      .first();
    await lessonCell.scrollIntoViewIfNeeded();
    await expect(lessonCell.locator(`.${iconClass}:visible`)).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the visible lesson-lock dialog.
   *
   * @param lockableLessonIndex - zero-based index in `.uitest-locksettings`
   */
  async openLockDialog(lockableLessonIndex = 0): Promise<void> {
    await this.page
      .locator('.uitest-locksettings')
      .nth(lockableLessonIndex)
      .evaluate(element => (element.firstElementChild as HTMLElement).click());
    await expect(this.modalBody).toBeVisible({timeout: 30_000});
  }

  /**
   * Unlock the currently open lesson through the user-visible dialog controls.
   */
  async unlockLessonForStudents(): Promise<void> {
    await this.modalBody.getByRole('button', {name: 'Allow editing'}).click();
    await this.modalBody.getByRole('button', {name: 'Save'}).click();
    await this.waitForLockDialogClosed();
  }

  /**
   * Close the lesson-lock dialog and wait for the modal overlay to leave.
   */
  async closeLockDialog(): Promise<void> {
    await this.modalBody.getByRole('button', {name: 'Cancel'}).click();
    await this.waitForLockDialogClosed();
  }

  /**
   * Updates a lockable lesson through the same lock-status endpoint used by
   * the dialog after opening the dialog and reading its payload.
   *
   * The modal body is the user-visible readiness signal.  The direct POST
   * avoids Cucumber's old fixed sleep around the dialog controls, which is
   * documented as LP-2194 in the Selenium steps.
   *
   * @param sectionId - section id from the test setup
   * @param lockableLessonIndex - zero-based lockable lesson index
   * @param locked - whether students should be locked out
   * @param readonlyAnswers - whether students should see readonly answers
   */
  async setLessonLockStatus(
    sectionId: number,
    lockableLessonIndex: number,
    locked: boolean,
    readonlyAnswers: boolean,
  ): Promise<void> {
    const lockStatusResponse = this.page.waitForResponse(
      response =>
        response.url().includes('/api/lock_status?script_id=') &&
        response.request().method() === 'GET',
      {timeout: 30_000},
    );
    await this.openLockDialog(lockableLessonIndex);
    const lockStatus = (await (
      await lockStatusResponse
    ).json()) as LockStatusResponse;
    const lessons = Object.values(lockStatus[String(sectionId)]?.lessons ?? {});
    const lessonStudents = lessons[lockableLessonIndex];
    if (!lessonStudents) {
      throw new Error(`No lockable lesson at index ${lockableLessonIndex}`);
    }

    const csrf = await this.page
      .locator('meta[name="csrf-token"]')
      .getAttribute('content');
    const response = await this.page.request.post('/api/lock_status', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
      data: {
        updates: lessonStudents.map(student => ({
          user_level_data: student.user_level_data,
          locked,
          readonly_answers: readonlyAnswers,
        })),
      },
    });
    if (!response.ok()) {
      throw new Error(
        `lock_status save failed: ${response.status()} - ${await response.text()}`,
      );
    }

    await this.closeLockDialog();
  }

  /**
   * Wait for the dialog and backdrop to be gone.  This is the visible
   * readiness signal used by the Cucumber source after saving lock settings.
   */
  private async waitForLockDialogClosed(): Promise<void> {
    await expect(this.modalBody).toBeHidden({timeout: 30_000});
    await expect(this.page.locator('.modal-backdrop')).toHaveCount(0, {
      timeout: 30_000,
    });
  }

  /**
   * Opens a locked level and asserts the visible locked-lesson message.
   *
   * @param path - lockable level path
   */
  async expectLockedLevel(path: string): Promise<void> {
    await this.page.goto(path);
    await expect(this.page.locator('#level-body')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('#locked-lesson')).toContainText(
      /lesson is currently locked/i,
      {timeout: 30_000},
    );
  }

  /**
   * Opens a readonly lockable page and checks the student-facing answer area.
   *
   * @param path - lockable level path
   * @param heading - heading that identifies the readonly page
   */
  async expectReadonlyAnswers(path: string, heading: RegExp): Promise<void> {
    await this.page.goto(path);
    await expect(this.page.getByRole('heading', {name: heading})).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      this.page.locator('h3', {hasText: 'Answer'}).first(),
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      this.page.locator('h3:visible', {hasText: 'For Teacher Only'}),
    ).toHaveCount(0);
    await expect(this.page.locator('.previousPageButton')).toBeVisible();
  }

  /**
   * Submits the last page of the anonymous student survey.
   */
  async submitSurvey(): Promise<void> {
    await this.page.goto(
      '/courses/allthethingscourse/units/1/lockable/1/levels/1/page/4',
    );
    await expect(this.page.locator('.submitButton')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('.submitButton').click();
    await expect(this.page.getByText('Submit your survey')).toBeVisible({
      timeout: 30_000,
    });
    await Promise.all([
      this.page.waitForURL(/\/lessons\/31\/levels\/1/, {timeout: 30_000}),
      this.page.getByRole('button', {name: 'Okay'}).click(),
    ]);
  }
}

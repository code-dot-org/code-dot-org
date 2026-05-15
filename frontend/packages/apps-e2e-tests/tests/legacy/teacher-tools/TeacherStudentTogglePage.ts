import {type Locator, type Page} from '@playwright/test';

import {expect} from '../../shared/fixtures';

interface LockStatusStudent {
  user_level_data: Record<string, unknown>;
  locked: boolean;
  readonly_answers: boolean;
}

interface LockStatusLessonMap {
  [lessonId: string]: LockStatusStudent[];
}

interface LockStatusSection {
  lessons?: LockStatusLessonMap;
}

interface LockStatusResponse {
  [sectionId: string]: LockStatusSection;
}

/**
 * Page object for teacher/student view toggle scenarios.
 */
export class TeacherStudentTogglePage {
  readonly page: Page;
  readonly viewAsStudent: Locator;
  readonly viewAsTeacher: Locator;
  readonly teacherPanelRows: Locator;
  readonly progressDropdown: Locator;
  readonly progressTable: Locator;
  readonly lockedLesson: Locator;
  readonly levelGroup: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.viewAsStudent = page
      .locator('.uitest-viewAsStudent')
      .or(page.getByRole('tab', {name: 'Student'}));
    this.viewAsTeacher = page
      .locator('.uitest-viewAsTeacher')
      .or(page.getByRole('tab', {name: 'Teacher'}));
    this.teacherPanelRows = page.locator('#teacher-panel-container tr');
    this.progressDropdown = page.locator('.header_popup_link');
    this.progressTable = page.locator('.uitest-summary-progress-table');
    this.lockedLesson = page.locator('#locked-lesson');
    this.levelGroup = page.locator('.level-group');
  }

  /**
   * Opens the multi level used by the toggle test.
   */
  async openMultiLevel(sectionId: number): Promise<void> {
    await this.page.goto(
      `/courses/allthethingscourse/units/1/lessons/9/levels/1?section_id=${sectionId}&viewAs=Instructor`,
    );
    await expect(this.page.locator('.submitButton')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the allthethings unit overview.
   */
  async openUnitOverview(sectionId: number): Promise<void> {
    await this.page.goto(
      `/courses/allthethingscourse/units/1?section_id=${sectionId}&viewAs=Instructor`,
    );
    await expect(this.page.locator('.uitest-togglehidden').first()).toBeVisible(
      {
        timeout: 30_000,
      },
    );
  }

  /**
   * Opens the hidden maze level after exposing the hidden lesson.
   */
  async openHiddenMazeLevel(sectionId: number): Promise<void> {
    await this.openUnitOverview(sectionId);
    await this.page
      .locator('.uitest-togglehidden')
      .nth(1)
      .locator('div', {hasText: 'Hidden'})
      .click();
    await this.page.goto(
      `/courses/allthethingscourse/units/1/lessons/2/levels/1?noautoplay=true&section_id=${sectionId}&viewAs=Instructor`,
    );
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the lockable level.
   */
  async openLockableLevel(sectionId: number): Promise<void> {
    await this.page.goto(
      `/courses/allthethingscourse/units/1/lockable/1/levels/1/page/1?noautoplay=true&section_id=${sectionId}&viewAs=Instructor`,
    );
    await expect(this.levelGroup).toBeVisible({timeout: 30_000});
    await expect(this.lockedLesson).toBeHidden();
  }

  /**
   * Opens the teacher panel if it is collapsed.
   */
  async openTeacherPanel(): Promise<void> {
    const firstStudentRow = this.teacherPanelRows.nth(1);
    try {
      await expect(firstStudentRow).toBeVisible({timeout: 30_000});
      return;
    } catch {
      // The panel can be collapsed on some legacy levels.  If the panel is
      // already open, the row wait above is the readiness signal and this
      // handle is hidden.
    }

    const showHandle = this.page.locator('.show-handle');
    await expect(showHandle).toBeVisible({timeout: 30_000});
    await showHandle.click();
    await expect(firstStudentRow).toBeVisible({timeout: 30_000});
  }

  /**
   * Switches to student view and waits for its visible toggle state.
   */
  async switchToStudentView(): Promise<void> {
    await expect(this.viewAsStudent).toBeVisible({timeout: 30_000});
    await this.viewAsStudent.click();
    await expect(this.viewAsTeacher).toBeVisible({timeout: 30_000});
  }

  /**
   * Switches to teacher view and waits for its visible toggle state.
   */
  async switchToTeacherView(): Promise<void> {
    await expect(this.viewAsTeacher).toBeVisible({timeout: 30_000});
    await this.viewAsTeacher.click();
    await expect(this.viewAsStudent).toBeVisible({timeout: 30_000});
  }

  /**
   * Opens the progress dropdown in the header.
   */
  async openProgressDropdown(): Promise<void> {
    await expect(this.progressDropdown).toBeVisible({timeout: 30_000});
    await this.progressDropdown.click();
    await expect(
      this.page.getByRole('link', {name: 'View Unit Overview'}),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Opens the first student from the teacher panel.
   */
  async openFirstStudentFromPanel(): Promise<void> {
    await this.openTeacherPanel();
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.teacherPanelRows.nth(1).click(),
    ]);
    await expect(this.progressDropdown).toBeVisible({timeout: 30_000});
  }

  /**
   * Unlocks the lockable lesson from the unit page.
   */
  async unlockLessonForStudents(sectionId: number): Promise<void> {
    await this.openUnitOverview(sectionId);
    const lockStatusResponsePromise = this.page.waitForResponse(
      response =>
        response.url().includes('/api/lock_status?script_id=') &&
        response.request().method() === 'GET',
    );
    await this.page.locator('.uitest-locksettings').first().click();
    const modal = this.page.locator('.modal-body');
    await expect(modal).toBeVisible({timeout: 30_000});

    const lockStatus = (await (
      await lockStatusResponsePromise
    ).json()) as LockStatusResponse;
    const sectionLessons = lockStatus[String(sectionId)]?.lessons ?? {};
    const lockableLesson = Object.values(sectionLessons).find(students =>
      students.some(student => student.locked),
    );
    if (!lockableLesson) {
      throw new Error('No locked students found in lesson lock dialog data');
    }

    const csrf = await this.page
      .locator('meta[name="csrf-token"]')
      .getAttribute('content');
    const saveResponse = await this.page.request.post('/api/lock_status', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
      data: {
        updates: lockableLesson.map(student => ({
          user_level_data: student.user_level_data,
          locked: false,
          readonly_answers: false,
        })),
      },
    });
    if (!saveResponse.ok()) {
      throw new Error(`lock_status save failed: ${saveResponse.status()}`);
    }

    await modal.getByRole('button', {name: 'Cancel'}).click();
    await expect(this.page.locator('.modal-backdrop')).toBeHidden();
  }
}

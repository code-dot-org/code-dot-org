import {expect, type Page} from '@playwright/test';

/**
 * Page object for teacher-panel student-work readiness on lab levels.
 */
export class StudentNotStartedPage {
  private readonly page: Page;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens a level as teacher and selects the first student from the teacher
   * panel.  The section selector and student table are visible readiness
   * signals, matching the Cucumber flow without the jQuery row selector.
   *
   * @param path - level path to open
   * @param sectionId - teacher section id to select in instructor view
   */
  async openFirstStudentWork(path: string, sectionId: number): Promise<void> {
    await this.page.goto(`${path}?section_id=${sectionId}&viewAs=Instructor`, {
      waitUntil: 'domcontentloaded',
    });
    const panelHandle = this.page.locator('.show-handle .fa-chevron-left');
    if (await panelHandle.isVisible({timeout: 5_000}).catch(() => false)) {
      await panelHandle.click();
    }
    await expect(this.page.locator('#teacher-panel-container')).toBeVisible({
      timeout: 60_000,
    });
    await expect(this.page.locator('.uitest-sectionselect')).toContainText(
      'Untitled Section',
      {timeout: 60_000},
    );
    await expect(this.page.locator('.student-table')).toBeVisible({
      timeout: 60_000,
    });
    await this.page.locator('#teacher-panel-container tr').nth(1).click();
    await expect(this.page.locator('.editor-column').first()).toBeVisible({
      timeout: 60_000,
    });
  }

  /**
   * Expects the visible not-started warning in the level editor column.
   */
  async expectWarningVisible(): Promise<void> {
    await expect(this.page.locator('.editor-column').first()).toContainText(
      'This student has not started the level.',
      {timeout: 60_000},
    );
  }

  /**
   * Expects no visible not-started warning in the level editor column.
   */
  async expectWarningHidden(): Promise<void> {
    await expect(this.page.locator('.editor-column').first()).not.toContainText(
      'This student has not started the level.',
    );
  }
}

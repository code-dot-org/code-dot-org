import {expect, type Page} from '@playwright/test';

import {dismissTeacherPanel} from '../../shared/ui';

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
   * Opens a level as teacher and selects a student from the visible teacher
   * panel. The panel heading, section selector, student table, and student row
   * link are the visible readiness signals found with Agent Browser.
   *
   * @param path - level path to open
   * @param studentName - visible student name in the teacher panel table
   */
  async openStudentWork(path: string, studentName: string): Promise<void> {
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
    });
    await expect(
      this.page.getByRole('heading', {name: 'Teacher Panel'}),
    ).toBeVisible({
      timeout: 60_000,
    });
    await expect(this.page.locator('.uitest-sectionselect')).toContainText(
      'Untitled Section',
      {timeout: 60_000},
    );
    await expect(this.page.locator('.student-table')).toBeVisible({
      timeout: 60_000,
    });
    const studentRow = this.page
      .locator('.student-table tr')
      .filter({hasText: studentName})
      .first();
    await expect(studentRow).toBeVisible({timeout: 60_000});

    await Promise.all([
      this.page.waitForEvent('framenavigated', {
        predicate: frame => frame === this.page.mainFrame(),
        timeout: 30_000,
      }),
      studentRow.evaluate(row => (row as HTMLElement).click()),
    ]);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/[?&]user_id=\d+/, {timeout: 30_000});
    await expect(studentRow).toBeVisible({timeout: 60_000});
    await expect(this.page.locator('.uitest-feedback')).toBeVisible({
      timeout: 60_000,
    });
    await dismissTeacherPanel(this.page);
  }

  /**
   * Expects the visible not-started banner in the workspace.
   */
  async expectWarningVisible(): Promise<void> {
    await expect(this.page.locator('#notStartedBanner')).toContainText(
      'This student has not started the level.',
      {timeout: 60_000},
    );
  }

  /**
   * Expects no visible not-started banner after the student view is ready.
   */
  async expectWarningHidden(): Promise<void> {
    await expect(this.page.getByRole('button', {name: /Run/})).toBeVisible({
      timeout: 60_000,
    });
    await expect(this.page.locator('#notStartedBanner')).toHaveCount(0);
  }

  /**
   * Waits for the lab body and teacher panel boxes to stop moving before a
   * visual checkpoint.
   */
  async expectVisualLayoutReady(): Promise<void> {
    await this.page.waitForFunction(
      async () => {
        const selectors = [
          '#level-body',
          '#instructions',
          '#codeWorkspace',
          '#visualization',
          '.teacher-panel',
        ];
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
                ].join(':');
              }),
            )
            .join('|');

        let previous = signature();
        for (let index = 0; index < 5; index++) {
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
}

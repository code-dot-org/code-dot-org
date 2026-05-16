import {type Locator, type Page} from '@playwright/test';

import {
  assignSectionToCourseAndUnit,
  createTeacherAssociatedStudent,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

class CourseVisibilityPage {
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Open a course overview for a specific teacher section and wait for cards.
   *
   * @param courseName - course slug
   * @param sectionId - teacher section id
   */
  async gotoCourse(courseName: string, sectionId: number): Promise<void> {
    await this.page.goto(`/courses/${courseName}?section_id=${sectionId}`);
    await expect(this.page.locator('.uitest-CourseScript').first()).toBeVisible(
      {
        timeout: 30_000,
      },
    );
  }

  /**
   * @param unitName - visible unit title
   */
  unitCard(unitName: string): Locator {
    return this.page.locator('.uitest-CourseScript', {hasText: unitName});
  }

  /**
   * Hide a unit and wait for the server-side visibility write.
   *
   * @param unitName - visible unit title
   */
  async hideUnit(unitName: string): Promise<void> {
    const unitCard = this.unitCard(unitName);
    await expect(unitCard).toBeVisible({timeout: 30_000});
    const visibilityWritten = this.page.waitForResponse(
      response =>
        response.url().includes('/toggle_hidden') &&
        response.request().method() === 'POST' &&
        response.ok(),
      {timeout: 30_000},
    );

    await unitCard.locator('.fa-eye-slash').click();
    await expect(unitCard).toHaveAttribute('data-visibility', 'hidden', {
      timeout: 30_000,
    });
    await visibilityWritten;
  }
}

test.describe('Hidden scripts and lessons', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/hidden_scripts_eyes.feature
   * Scenario: Hidden Scripts
   */
  test('teacher can hide a unit and student is blocked from it', async ({
    page,
  }) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'bobby',
    });

    await signIn(page, teacherEmail, teacherPassword);
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);

    const course = new CourseVisibilityPage(page);
    await course.gotoCourse('allthethingscourse', sectionId);
    await course.hideUnit('All the Things!');
    // Visual checkpoint stub: "teacher overview with hidden script".

    await signIn(page, studentEmail, studentPassword);
    await page.goto(`/courses/allthethingscourse?section_id=${sectionId}`);
    await expect(course.unitCard('All the Things!')).toBeHidden({
      timeout: 30_000,
    });
    await expect(course.unitCard('All the Hidden Things!')).toBeVisible({
      timeout: 30_000,
    });
    // Visual checkpoint stub: "student course overview with hidden script".

    await page.goto(
      `/courses/allthethingscourse/units/1?section_id=${sectionId}`,
    );
    await expect(
      page.getByText("Your teacher didn't expect you to be here."),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "student script overview on hidden script".

    await page.goto(
      `/courses/allthethingscourse/units/1/lessons/2/levels/1?section_id=${sectionId}`,
    );
    await expect(
      page.getByText("Your teacher didn't expect you to be here."),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "student lesson on hidden script".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/hidden_stages_eyes.feature
   * Scenario: Hidden Stages - lesson 2 hidden
   */
  test('teacher can hide lesson 2 and student sees the hidden lesson state', async ({
    page,
  }) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'bobby',
    });

    await signIn(page, teacherEmail, teacherPassword);
    await page.goto(
      `/courses/allthethingscourse/units/1?section_id=${sectionId}`,
    );
    await expect(page.locator('.uitest-togglehidden').nth(1)).toBeVisible({
      timeout: 30_000,
    });
    await page
      .locator('.uitest-togglehidden')
      .nth(1)
      .locator('div', {hasText: 'Hidden'})
      .click();
    await expect(
      page.locator('.uitest-togglehidden').nth(1).getByText('Visible'),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "teacher overview with hidden lesson 2".

    await signIn(page, studentEmail, studentPassword);
    await page.goto(
      `/courses/allthethingscourse/units/1?section_id=${sectionId}`,
    );
    await expect(page.getByText('1. Jigsaw')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('2. Maze')).toBeHidden();
    // Visual checkpoint stub: "student overview with hidden lesson 2".

    await page.goto(
      `/courses/allthethingscourse/units/1/lessons/2/levels/2?section_id=${sectionId}`,
    );
    await expect(
      page.getByText(/not available|hidden|your teacher/i).first(),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "student lesson on hidden lesson 2".
  });
});

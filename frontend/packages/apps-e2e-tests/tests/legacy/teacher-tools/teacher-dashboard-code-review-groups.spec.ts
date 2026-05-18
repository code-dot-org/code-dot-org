import type {Page} from '@playwright/test';

import {
  createSectionWithCourse,
  createStudent,
  createTeacher,
  getLevelbuilderAccess,
  joinSection,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Teacher Dashboard Code Review Groups — roster dialog management.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_code_review_groups.feature
 */

/**
 * Creates the CSA section and one enrolled student used by the source
 * feature, then opens the teacher's roster page.
 *
 * @param page - Playwright page
 */
async function openCodeReviewRoster(page: Page): Promise<void> {
  const teacher = await createTeacher(page, {name: 'Dumbledore'});
  await getLevelbuilderAccess(page);
  const {sectionCode, sectionId} = await createSectionWithCourse(
    page,
    'ui-test-csa-family-script',
    1,
  );

  await createStudent(page, {name: 'Hermione'});
  await joinSection(page, sectionCode);
  await signIn(page, teacher.email, teacher.password);

  await page.goto(`/teacher_dashboard/sections/${sectionId}/roster`);
  await expect(page.locator('#uitest-manage-students-table')).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('#uitest-manage-students-table')).toContainText(
    'Hermione',
  );
}

/**
 * Opens the code-review groups management dialog from the roster page.
 *
 * @param page - Playwright page on a teacher-dashboard roster route
 */
async function openCodeReviewGroupsDialog(page: Page): Promise<void> {
  await page.locator('#uitest-code-review-groups-button').click();
  await expect(page.locator('#uitest-create-code-review-group')).toBeVisible({
    timeout: 15_000,
  });
}

test.describe(
  'Teacher Dashboard Code Review Groups',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_code_review_groups.feature
     * Scenario: Create a code review group, add a student to it, save it, and unassign all from group
     */
    test('teacher creates, saves, and unassigns a code review group', async ({
      page,
    }) => {
      await openCodeReviewRoster(page);
      await openCodeReviewGroupsDialog(page);

      await page.locator('#uitest-create-code-review-group').click();
      await expect(page.locator('.uitest-code-review-group')).toBeVisible({
        timeout: 15_000,
      });

      await page.locator('#uitest-unassign-all-button').focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Space');
      await expect(
        page.locator('.uitest-code-review-group').first(),
      ).toContainText('Hermione', {timeout: 15_000});

      const confirmChanges = page.getByRole('button', {
        name: 'Confirm Changes',
      });

      await confirmChanges.click();
      await expect(page.locator('.uitest-base-dialog-footer')).toContainText(
        'Changes have been saved',
        {timeout: 15_000},
      );
      await expect(confirmChanges).toBeDisabled();

      await page.locator('#uitest-unassign-all-button').click();
      await expect(
        page.locator('#uitest-code-review-group-unassigned'),
      ).toContainText('Hermione', {timeout: 15_000});
      await expect(confirmChanges).toBeEnabled();
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_code_review_groups.feature
     * Scenario: Enable code review for a section
     */
    test('teacher enables code review for a section', async ({page}) => {
      await openCodeReviewRoster(page);
      await openCodeReviewGroupsDialog(page);

      await page.locator('#uitest-code-review-groups-toggle').click();
      await expect(
        page.locator('#uitest-code-review-groups-status-message'),
      ).toContainText('Code review will be automatically disabled', {
        timeout: 15_000,
      });
    });
  },
);

import {createTeacher, createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Header navigation bar — link counts and text for student and teacher.
 *
 * Source:
 *   dashboard/test/ui/features/platform/header.feature
 *
 * Tagged @no_mobile. Spanish/i18n scenarios are omitted — they require
 * translation key lookups not yet supported in this suite.
 */

test.describe('Header navigation', () => {
  test(
    'student in English sees 4 header links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      await page.goto('/home');
      await page
        .locator('.headerlinks')
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('#header-student-home')).toContainText(
        'My Dashboard',
      );
      await expect(page.locator('#header-student-courses')).toContainText(
        'Course Catalog',
      );
      await expect(page.locator('#header-student-projects')).toContainText(
        'Projects',
      );
      await expect(page.locator('#header-incubator')).toContainText(
        'Incubator',
      );
    },
  );

  test(
    'teacher in English sees 5 header links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page);
      await page.goto('/home');
      await page
        .locator('.headerlinks')
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('#header-teacher-home')).toContainText(
        'My Dashboard',
      );
      await expect(page.locator('#header-teacher-courses')).toContainText(
        'Course Catalog',
      );
      await expect(page.locator('#header-teacher-projects')).toContainText(
        'Projects',
      );
      await expect(
        page.locator('#header-teacher-professional-learning'),
      ).toContainText('Professional Learning');
      await expect(page.locator('#header-teacher-incubator')).toContainText(
        'Incubator',
      );
    },
  );

  // Spanish/i18n scenarios require translation key lookups — skipped.
  test.fixme('student in Spanish sees localized header links', async () => {});
  test.fixme('teacher in Spanish sees localized header links', async () => {});
});

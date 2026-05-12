import {type Page} from '@playwright/test';

import {createTeacher, createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Header navigation bar — link counts and text for student and teacher.
 *
 * Source:
 *   dashboard/test/ui/features/platform/header.feature
 *
 * Tagged @no_mobile.
 */

/**
 * Wait for the signed-in dashboard header to render.
 *
 * @param page - Playwright page
 */
async function waitForHeaderLinks(page: Page): Promise<void> {
  await page
    .locator('.headerlinks')
    .waitFor({state: 'visible', timeout: 30_000});
}

/**
 * Assert a localized header link contains the expected text.
 *
 * The Cucumber step compares against Rails i18n keys.  Test-studio may resolve
 * `es` through es-MX or es-ES; those strings differ only in capitalization for
 * these labels, so the Playwright assertion is case-insensitive.
 *
 * @param page - Playwright page
 * @param selector - header link selector
 * @param expectedText - localized text from nav.header.*
 */
async function expectSpanishHeaderLink(
  page: Page,
  selector: string,
  expectedText: string,
): Promise<void> {
  await expect(page.locator(selector)).toContainText(
    new RegExp(expectedText, 'i'),
  );
}

test.describe('Header navigation', () => {
  test(
    'student in English sees 4 header links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      await page.goto('/home');
      await waitForHeaderLinks(page);

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
      await waitForHeaderLinks(page);

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

  /**
   * Migration status: COMPLETED
   * Source: header.feature
   * Scenario: Student in Spanish should see 4 header links
   */
  test(
    'student in Spanish sees localized header links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      await page.goto('/home/lang/es');
      await page.waitForURL(/\/home\?lang=es/, {timeout: 30_000});
      await waitForHeaderLinks(page);

      await expectSpanishHeaderLink(
        page,
        '#header-student-home',
        'Mi panel de control',
      );
      await expectSpanishHeaderLink(
        page,
        '#header-student-courses',
        'Catálogo de cursos',
      );
      await expectSpanishHeaderLink(
        page,
        '#header-student-projects',
        'Proyectos',
      );
      await expectSpanishHeaderLink(page, '#header-incubator', 'Incubadora');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: header.feature
   * Scenario: Teacher in Spanish should see 5 header links
   */
  test(
    'teacher in Spanish sees localized header links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page);
      await page.goto('/teacher_dashboard/home/lang/es');
      await page.waitForURL(/\/teacher_dashboard\/home\?lang=es/, {
        timeout: 30_000,
      });
      await waitForHeaderLinks(page);

      await expectSpanishHeaderLink(
        page,
        '#header-teacher-home',
        'Mi panel de control',
      );
      await expectSpanishHeaderLink(
        page,
        '#header-teacher-courses',
        'Catálogo de cursos',
      );
      await expectSpanishHeaderLink(
        page,
        '#header-teacher-projects',
        'Proyectos',
      );
      await expectSpanishHeaderLink(
        page,
        '#header-teacher-professional-learning',
        'Aprendizaje Profesional',
      );
      await expectSpanishHeaderLink(
        page,
        '#header-teacher-incubator',
        'Incubadora',
      );
    },
  );
});

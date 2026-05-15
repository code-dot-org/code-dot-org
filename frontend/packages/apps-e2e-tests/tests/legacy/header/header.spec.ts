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
 * Set cookies used by the Cucumber click-through scenarios to pin English and
 * suppress the localization notice.
 *
 * @param page - Playwright page
 */
async function setHeaderClickCookies(page: Page): Promise<void> {
  const {hostname} = new URL(page.url());
  await page.context().addCookies([
    {name: '_language', value: 'en', domain: hostname, path: '/'},
    {name: '_loc_notice', value: '1', domain: hostname, path: '/'},
  ]);
}

/**
 * Click a header link and assert the resulting route.
 *
 * @param page - Playwright page
 * @param selector - header link selector
 * @param expectedUrl - expected URL pattern after navigation
 */
async function clickHeaderLinkAndExpectUrl(
  page: Page,
  selector: string,
  expectedUrl: RegExp,
): Promise<void> {
  await page.locator(selector).click();
  await expect(page).toHaveURL(expectedUrl, {timeout: 30_000});
  await waitForHeaderLinks(page);
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
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/header.feature
   * Scenario: Student in English should see 4 header links
   */
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/header.feature
   * Scenario: Teacher in English should see 5 header links
   */
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
   * Source: dashboard/test/ui/features/platform/header.feature
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
   * Source: dashboard/test/ui/features/platform/header.feature
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/header.feature
   * Scenario: Teacher can click on the header links
   */
  test(
    'teacher can click on the header links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'Sir Clicks-A-Lot Teacher'});
      await setHeaderClickCookies(page);
      await page.goto('/teacher_dashboard/home');
      await waitForHeaderLinks(page);

      await clickHeaderLinkAndExpectUrl(
        page,
        '#header-teacher-home',
        /\/teacher_dashboard\/home$/,
      );
      await clickHeaderLinkAndExpectUrl(
        page,
        '#header-teacher-courses',
        /\/catalog$/,
      );
      await clickHeaderLinkAndExpectUrl(
        page,
        '#header-teacher-projects',
        /\/projects$/,
      );
      await clickHeaderLinkAndExpectUrl(
        page,
        '#header-teacher-professional-learning',
        /\/my-professional-learning$/,
      );
      await clickHeaderLinkAndExpectUrl(
        page,
        '#logo_home_link',
        /\/teacher_dashboard\/home$/,
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/header.feature
   * Scenario: Student can click on the header links
   */
  test(
    'student can click on the header links',
    {tag: ['@no_mobile', '@chrome']},
    async ({page}) => {
      await createStudent(page, {name: 'Squire Clicks-A-Lot Student'});
      await setHeaderClickCookies(page);
      await page.goto('/home');
      await waitForHeaderLinks(page);

      await clickHeaderLinkAndExpectUrl(
        page,
        '#header-student-home',
        /\/home$/,
      );

      await expect(page.locator('#header-student-courses')).toHaveAttribute(
        'href',
        /code\.org\/students|code\.org\/en-US\/students/,
      );

      await page.goto('/home');
      await waitForHeaderLinks(page);
      await clickHeaderLinkAndExpectUrl(
        page,
        '#header-student-projects',
        /\/projects$/,
      );
      await clickHeaderLinkAndExpectUrl(page, '#logo_home_link', /\/home$/);
    },
  );
});

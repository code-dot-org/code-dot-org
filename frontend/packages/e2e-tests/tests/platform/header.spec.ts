import {expect, test} from '../fixtures';
import {HomePage} from '../pages/home-page';
import {TeacherDashboardPage} from '../pages/teacher-dashboard';
import {createStudent, createUser, resetSession, signOut} from '../shared/auth';
import {suppressCookieConsentOverlay} from '../shared/consent';
import {setCookie} from '../shared/cookies';
import {expectElementHasI18nText} from '../shared/i18n';

test.describe('Header navigation bar', () => {
  /** Migration status: COMPLETED  Source: platform/header.feature "Student in English should see 4 header links" */
  test(
    'Student in English should see 4 header links',
    {tag: ['@no_mobile']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Sally Student'});
      // ge_region=us pins the US region regardless of the runner's IP.
      await page.goto('/home?ge_region=us');
      const home = new HomePage(page);
      const header = home.header;
      await header.waitForVisible();

      await expect(header.myDashboardLink).toBeVisible();
      await expect(header.courseCatalogLink).toBeVisible();
      await expect(header.projectsLink).toBeVisible();
      await expect(header.incubatorLink).toBeVisible();

      await signOut(page);
    },
  );

  /** Migration status: COMPLETED  Source: platform/header.feature "Teacher in English should see 5 header links" */
  test(
    'Teacher in English should see 5 header links',
    {tag: ['@no_mobile']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createUser(page, {type: 'teacher', name: 'Tessa Teacher'});
      // /teacher_dashboard/home bypasses the root GE redirect and reliably lands
      // in the us region regardless of the runner's IP.
      await page.goto('/teacher_dashboard/home');
      const dashboard = new TeacherDashboardPage(page);
      const header = dashboard.header;
      await header.waitForVisible();

      await expect(header.myDashboardLink).toBeVisible();
      await expect(header.courseCatalogLink).toBeVisible();
      await expect(header.projectsLink).toBeVisible();
      await expect(header.professionalLearningLink).toBeVisible();
      await expect(header.incubatorLink).toBeVisible();

      await signOut(page);
    },
  );

  /** Migration status: COMPLETED  Source: platform/header.feature "Student in Spanish should see 2 header links" */
  test(
    'Student in Spanish should see 2 header links',
    {tag: ['@no_mobile']},
    async ({page}) => {
      // Spanish GE scenarios require chromium: firefox/webkit hit a redirect-cookie
      // race that drops the ge_region cookie on the 302 follow.
      test.skip(
        test.info().project.name !== 'chromium',
        'chromium-only: firefox/webkit hit a GE redirect-cookie race on /lang/es',
      );

      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Eva Estudiante'});

      const home = new HomePage(page);
      const header = home.header;
      // Activate the es GE region via the Rails set_locale redirect.
      await page.goto('/home/lang/es');
      await expect(page).toHaveURL(
        url => url.pathname + url.search === '/es/home?lang=es',
      );
      // Authoritative signal that the es region applied server-side.
      await expect(home.globalEditionRegionHtml('es')).toBeVisible();
      await header.waitForVisible();

      await expect(header.linkById('header-student-home')).toBeVisible();
      await expectElementHasI18nText({
        locator: header.linkById('header-student-home'),
        locale: 'es',
        key: 'nav.header.my_dashboard',
      });

      await expect(header.linkById('header-student-courses')).toBeVisible();
      await expectElementHasI18nText({
        locator: header.linkById('header-student-courses'),
        locale: 'es',
        key: 'nav.header.course_catalog',
      });

      // Projects and Incubator are absent from the DOM in the es GE region.
      await expect(
        header.linkById('header-student-projects'),
      ).not.toBeVisible();
      await expect(header.linkById('header-incubator')).not.toBeVisible();

      await signOut(page);
    },
  );

  /** Migration status: COMPLETED  Source: platform/header.feature "Teacher in Spanish should see 3 header links" */
  test(
    'Teacher in Spanish should see 3 header links',
    {tag: ['@no_mobile']},
    async ({page}) => {
      // Spanish GE scenarios require chromium: firefox/webkit hit a redirect-cookie
      // race that drops the ge_region cookie on the 302 follow.
      test.skip(
        test.info().project.name !== 'chromium',
        'chromium-only: firefox/webkit hit a GE redirect-cookie race on /lang/es',
      );

      await resetSession(page);
      await page.goto('/');
      await createUser(page, {type: 'teacher', name: 'Pabla Profesora'});

      const dashboard = new TeacherDashboardPage(page);
      const header = dashboard.header;
      await page.goto('/teacher_dashboard/home/lang/es');
      await expect(page).toHaveURL(
        url =>
          url.pathname + url.search === '/es/teacher_dashboard/home?lang=es',
      );
      await expect(dashboard.globalEditionRegionHtml('es')).toBeVisible();
      await header.waitForVisible();

      await expect(header.linkById('header-teacher-home')).toBeVisible();
      await expectElementHasI18nText({
        locator: header.linkById('header-teacher-home'),
        locale: 'es',
        key: 'nav.header.my_dashboard',
      });

      await expect(header.linkById('header-teacher-courses')).toBeVisible();
      await expectElementHasI18nText({
        locator: header.linkById('header-teacher-courses'),
        locale: 'es',
        key: 'nav.header.course_catalog',
      });

      // Projects and Incubator are absent in es GE.
      await expect(
        header.linkById('header-teacher-projects'),
      ).not.toBeVisible();

      await expect(
        header.linkById('header-teacher-professional-learning'),
      ).toBeVisible();
      await expectElementHasI18nText({
        locator: header.linkById('header-teacher-professional-learning'),
        locale: 'es',
        key: 'nav.header.professional_learning',
      });

      await expect(
        header.linkById('header-teacher-incubator'),
      ).not.toBeVisible();

      await signOut(page);
    },
  );

  /** Migration status: COMPLETED  Source: platform/header.feature "Teacher can click on the header links" */
  test(
    'Teacher can click on the header links',
    {tag: ['@no_mobile', '@chrome']},
    async ({page}) => {
      test.skip(
        test.info().project.name !== 'chromium',
        'chromium-only (@chrome scenario)',
      );

      await resetSession(page);
      await page.goto('/');
      await createUser(page, {
        type: 'teacher',
        name: 'Sir Clicks-A-Lot Teacher',
      });

      const dashboard = new TeacherDashboardPage(page);
      const header = dashboard.header;
      // Suppress the OneTrust consent overlay before navigation — it intercepts
      // all pointer events and would block every header click.
      await suppressCookieConsentOverlay(page);
      // _language pins the locale to English.
      await setCookie(page, '_language', 'en');
      // _loc_notice=1 suppresses the location-notice modal.
      await setCookie(page, '_loc_notice', '1');

      await page.goto('/teacher_dashboard/home');
      await header.waitForVisible();

      await header.clickLink(header.myDashboardLink);
      await expect(page).toHaveURL(
        url => url.pathname === '/teacher_dashboard/home',
      );

      await header.clickLink(header.courseCatalogLink);
      await expect(page).toHaveURL(url => url.pathname === '/catalog');

      await header.clickLink(header.projectsLink);
      await expect(page).toHaveURL(url => url.pathname === '/projects');

      await header.clickLink(header.professionalLearningLink);
      await expect(page).toHaveURL(
        url => url.pathname === '/my-professional-learning',
      );

      await header.clickLink(header.logoLink);
      await expect(page).toHaveURL(
        url => url.pathname === '/teacher_dashboard/home',
      );

      await signOut(page);
    },
  );
});

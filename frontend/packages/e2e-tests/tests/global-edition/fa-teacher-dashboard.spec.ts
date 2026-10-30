import {expect, test} from '../fixtures';
import {TeacherDashboardPage} from '../pages/teacher-dashboard/teacher-dashboard';

test.describe('Global Edition - Farsi MVP - Teacher Dashboard', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'Source feature is @chrome-only; firefox/webkit hit a GE-redirect cookie race (ge_region cookie not applied on the 302 follow, so the server renders /fa as root)',
  );

  /**
   * Ported from platform/global_edition/fa/teacher_dashboard.feature. The
   * promotions panel renders in the root region but is removed in the fa region
   * via config/global_editions/fa.yml (TeacherPromotions: false).
   */
  test(
    'Teacher does not see Teacher Promotion right panel',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'New Teacher'});
      const dashboard = new TeacherDashboardPage(page);

      // Fresh context carries no ge_region cookie, so this is the root region.
      await dashboard.goto();
      await expect(dashboard.promotionsPanel).toBeVisible();

      await dashboard.switchToGlobalEditionRegion('fa');
      await expect(dashboard.homeHeader).toBeVisible();
      await expect(dashboard.promotionsPanel).not.toBeVisible();
    },
  );
});

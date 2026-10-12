import {expect, test} from '../../fixtures';
import {PlLandingPage} from '../../pages/pl-landing-page';
import {analyze, WCAG_AA_TAGS} from '../../shared/axe';
import {grantPermission} from '../../shared/permissions';
import {waitForVisualStability} from '../../shared/stability';

test.describe('Global Edition - Farsi MVP - Professional Learning landing page', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'chromium-only: firefox/webkit hit a Global Edition redirect cookie race — the ge_region cookie is not applied on the 302 follow, so the server renders the root region instead of /fa',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * "New teacher without PL history sees relevant content sections for Farsi MVP"
   */
  test(
    'New teacher without PL history sees relevant content sections for Farsi MVP',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'New Teacher'});
      const pl = new PlLandingPage(page);

      await pl.gotoFarsi();

      await expect(pl.learnAboutProfessionalLearningLink).not.toBeVisible();
      await expect(pl.joinSectionButton).toBeVisible();
      await expect(pl.workshopsLink).not.toBeVisible();
      await expect(
        pl.startCoursesLink('دوره‌های آموزش حرفه‌ای را شروع کنید'),
      ).toHaveAttribute('href', /\/fa\/professional-learning\/courses/);

      expect(
        await analyze(page, {
          include: pl.mainContentSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual({});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * "New teacher without PL history sees relevant content sections for Farsi MVP" — visual snapshot
   */
  test(
    'New teacher without PL history sees relevant content sections for Farsi MVP — visual snapshot',
    {tag: ['@no_mobile', '@visual']},
    async ({page, signInAsNewUser, visualCheck}) => {
      await signInAsNewUser({type: 'teacher', name: 'New Teacher'});
      const pl = new PlLandingPage(page);

      await pl.gotoFarsi();
      await expect(pl.joinSectionButton).toBeVisible();

      // Cucumber's "I see no difference for "Full page"" (no "within" clause)
      // is a full-page screenshot, not scoped to a region — see eyes_steps.rb.
      await waitForVisualStability(page, pl.container);
      await visualCheck('Full page');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * "Facilitator sees Facilitator Center in Farsi MVP"
   *
   * The source scenario provisions a facilitator via started/completed
   * workshops (@dashboard_db_access), then deletes the workshop afterward.
   * LandingPage.jsx's getAvailableTabs() gates the tab purely on
   * userPermissions.includes('facilitator') — no workshop is required for the
   * tab to render, so this grants the permission directly and skips workshop
   * setup/teardown entirely.
   */
  test(
    'Facilitator sees Facilitator Center in Farsi MVP',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'Facilitator'});
      await grantPermission(page, 'facilitator');
      const pl = new PlLandingPage(page);

      await pl.goto();
      await expect(pl.tab('myFacilitatorCenter')).toBeVisible();

      await pl.gotoFarsi();
      await expect(pl.tab('myFacilitatorCenter')).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * "Universal Instructor sees Instructor Center in Farsi MVP"
   */
  test(
    'Universal Instructor sees Instructor Center in Farsi MVP',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'PL Instructor'});
      await grantPermission(page, 'universal_instructor');
      const pl = new PlLandingPage(page);

      await pl.goto();
      await expect(pl.tab('instructorCenter')).toBeVisible();

      await pl.gotoFarsi();
      await expect(pl.tab('instructorCenter')).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * "Regional Partner sees Regional Partner Center in Farsi MVP"
   *
   * The source scenario provisions a program manager tied to a regional
   * partner with a started workshop. As with the facilitator scenario, the
   * RPCenter tab is gated only on userPermissions.includes('program_manager'),
   * so this grants the permission directly.
   */
  test(
    'Regional Partner sees Regional Partner Center in Farsi MVP',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'Program Manager'});
      await grantPermission(page, 'program_manager');
      const pl = new PlLandingPage(page);

      await pl.goto();
      await expect(pl.tab('RPCenter')).toBeVisible();

      await pl.gotoFarsi();
      await expect(pl.tab('RPCenter')).toBeVisible();
    },
  );

  /**
   * Migration status: FIXME
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * "Workshop Organizer sees Workshop Organizer Tab in Farsi MVP"
   *
   * Depends on TestController#workshop_organizer_access, added alongside this
   * port. The endpoint 404s on test-studio until the backend change deploys.
   * Remove fixme once TestController#workshop_organizer_access is on test-studio.
   */
  test.fixme(
    'Workshop Organizer sees Workshop Organizer Tab in Farsi MVP',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'Workshop Organizer'});
      await grantPermission(page, 'workshop_organizer');
      const pl = new PlLandingPage(page);

      await pl.goto();
      await expect(pl.tab('workshopOrganizerCenter')).toBeVisible();

      await pl.gotoFarsi();
      await expect(pl.tab('workshopOrganizerCenter')).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * "Teacher with Self-paced PL courses sees Continue course button in Farsi MVP"
   */
  test(
    'Teacher with Self-paced PL courses sees Continue course button in Farsi MVP',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'teacher', name: 'Self-paced Teacher'});
      const pl = new PlLandingPage(page);
      await pl.startSelfPacedCourse();

      await pl.goto();
      await expect(pl.continueCourseLink('Continue course')).toBeVisible();

      await pl.gotoFarsi();
      await expect(pl.continueCourseLink('ادامه دوره')).toBeVisible();
    },
  );
});

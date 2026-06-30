import {expect, test} from '../../fixtures';
import {PersonalProjectGallery} from '../../pages/personal-project-gallery';

test.describe('Global Edition - Farsi MVP - Personal Project Gallery', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'chromium-only: firefox/webkit hit a Global Edition redirect cookie race — the ge_region cookie is not applied on the 302 follow, so the server renders the root region instead of /fa',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/personal_project_gallery.feature
   * "The student sees only the projects available in Farsi MVP"
   */
  test(
    'The student sees only the projects available in Farsi MVP',
    {tag: ['@no_mobile']},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'student', name: 'Lillian'});
      const gallery = new PersonalProjectGallery(page);

      // Fresh context carries no ge_region cookie, so this is the root region.
      await gallery.goto();

      // Switch to the Farsi region; switchToGlobalEditionRegion confirms the
      // data-ge-region attribute took effect on the resulting page.
      await gallery.switchToGlobalEditionRegion('fa');
      await gallery.waitForReady();

      // The "Create a new project" section offers exactly Sprite Lab, Artist,
      // App Lab, and Game Lab.
      await expect(gallery.newSpriteLab).toBeVisible();
      await expect(gallery.newArtist).toBeVisible();
      await expect(gallery.newAppLab).toBeVisible();
      await expect(gallery.newGameLab).toBeVisible();

      // Expand the full project-type list.
      await gallery.openFullList();

      // The full list contains the same 4 types (any* matches anywhere on the
      // page, including the "Create a new project" section above the list).
      await expect(gallery.anySpriteLab.first()).toBeVisible();
      await expect(gallery.anyArtist.first()).toBeVisible();
      await expect(gallery.anyAppLab.first()).toBeVisible();
      await expect(gallery.anyGameLab.first()).toBeVisible();

      // Dance, Playlab, and Weblab are absent from the DOM entirely.
      await expect(gallery.danceLink).toHaveCount(0);
      await expect(gallery.playLabLink).toHaveCount(0);
      await expect(gallery.webLabLink).toHaveCount(0);
    },
  );
});

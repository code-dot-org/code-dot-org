import {expect, test} from '../../../shared/fixtures';

import {Dance} from './Dance';

/**
 * Dance Party — PG-13 song-selector age filter.
 *
 * Sources:
 *   dashboard/test/ui/features/star_labs/dance/age_filter.feature
 *   dashboard/test/ui/features/star_labs/dance/age_filter2.feature
 *
 * The song selector shows PG-13 songs only for users aged ≥ 13. The filter
 * is applied via three paths: logged-in user age, the in-page age dialog
 * (anonymous users), and the `?songfilter=on` teacher override.
 *
 * PG-13 option values: `synthesize` (local) and `badhabit_stevelacy` (test-studio).
 */

// ─── age_filter.feature ─────────────────────────────────────────────────────

test.describe('Dance Party age filter — young student (age 10)', () => {
  test.use({studentAge: 10});

  test(
    'song selector omits PG-13 songs for age-10 student',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const dance = new Dance(studentPage);
      await dance.gotoLevel(1);
      await expect(dance.runButton).toBeVisible();
      await expect(dance.songSelector).toBeVisible();
      await dance.expectPg13SongsFiltered();
    },
  );
});

test.describe('Dance Party age filter — adult student (age 16) + teacher flag', () => {
  test(
    'PG-13 songs visible for age-16 student, then filtered by ?songfilter=on',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const dance = new Dance(studentPage);
      await dance.gotoLevel(1);
      await expect(dance.runButton).toBeVisible();
      await expect(dance.songSelector).toBeVisible();
      await dance.expectPg13SongsAvailable();

      // Reload same level with teacher filter, preserving session.
      await studentPage.goto(
        '/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true&songfilter=on',
      );
      await dance.waitForDancePage();
      await dance.waitForSongSelector();
      await dance.expectPg13SongsFiltered();
    },
  );
});

test.describe('Dance Party age filter — anonymous user, age dialog', () => {
  // Scenario 3 of age_filter.feature and scenarios 1–3 of age_filter2.feature
  // all navigate as anonymous, relying on the age-gate dialog or ?songfilter=on.

  test(
    'selecting age 10 in dialog filters PG-13 songs',
    {tag: '@no_mobile'},
    async ({page}) => {
      const dance = new Dance(page);
      await dance.gotoLevelAnonymous(1);
      await dance.selectAgeInDialog(10);
      await dance.dismissInstructions();
      await expect(dance.runButton).toBeVisible();
      await expect(dance.songSelector).toBeVisible();
      await dance.expectPg13SongsFiltered();
    },
  );

  test(
    'selecting age 13 keeps PG-13 songs and setting persists to the next dance level',
    {tag: '@no_mobile'},
    async ({page}) => {
      const dance = new Dance(page);
      await dance.gotoLevelAnonymous(1);
      await dance.selectAgeInDialog(13);
      await dance.dismissInstructions();
      await expect(dance.runButton).toBeVisible();
      await expect(dance.songSelector).toBeVisible();
      await dance.expectPg13SongsAvailable();

      // Session cookie persists — dialog absent on next dance course level.
      await page.goto(
        '/courses/dance/units/1/lessons/1/levels/9?noautoplay=true',
      );
      await dance.waitForDancePage();
      await expect(page.locator('.age-dialog')).toBeHidden();
      await expect(dance.runButton).toBeVisible();
      await expect(dance.songSelector).toBeVisible();
      await dance.expectPg13SongsAvailable();
    },
  );

  test(
    '?songfilter=on suppresses PG-13 songs without showing the age dialog',
    {tag: '@no_mobile'},
    async ({page}) => {
      const dance = new Dance(page);
      await page.goto('/reset_session');
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true&songfilter=on',
      );
      await dance.waitForDancePage();
      await expect(page.locator('.age-dialog')).toBeHidden();
      await dance.expectPg13SongsFiltered();
    },
  );

  test(
    '?songfilter=on persists through level completion to the next level',
    {tag: '@no_mobile'},
    async ({page}) => {
      const dance = new Dance(page);
      await page.goto('/reset_session');
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true&songfilter=on',
      );
      await dance.waitForDancePage();
      await expect(page.locator('.age-dialog')).toBeHidden();
      await dance.expectPg13SongsFiltered();

      // Run until level success, then follow the continue link.
      await dance.run();
      await expect(dance.congratsMessage).toBeVisible();
      await dance.continueButton.click();
      await page.waitForURL('**/lessons/37/levels/2**');
      await dance.waitForDancePage();
      await dance.waitForSongSelector();
      await dance.expectPg13SongsFiltered();
    },
  );
});

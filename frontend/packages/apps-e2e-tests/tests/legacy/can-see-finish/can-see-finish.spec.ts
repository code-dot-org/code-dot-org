import {expect, test} from '../../shared/fixtures';
import {Artist} from '../activities/artist/Artist';
import {Bounce} from '../activities/bounce/Bounce';
import {Dance} from '../activities/dance/Dance';
import {Flappy} from '../activities/flappy/Flappy';
import {SpriteLab} from '../activities/spritelab/SpriteLab';

/**
 * Verify #finishButton is in-viewport on small (1366×727) screens after pressing Run
 * on each lab's free-play level.
 *
 * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
 * Background: I create a student named "Sally" — uses studentPage fixture.
 * @no_mobile — resize tests; mobile variants need a separate Playwright project.
 *
 * Game Lab (Droplet POM not implemented) and Minecraft (heavy load / cross-runner issues)
 * are omitted. Bounce mobile variant omitted (known issue: not in-viewport on iPhone).
 */

/** Small-screen viewport matching "1366 by 727" step in the Cucumber suite. */
const SMALL_SCREEN = {width: 1366, height: 727} as const;

/**
 * Free-play level URLs from check_finish_button.rb.
 * All include no_redirect=true to prevent redirect for a fresh student.
 */
const FREE_PLAY_URLS = {
  dance:
    '/courses/allthethingscourse/units/1/lessons/37/levels/3?noautoplay=true&no_redirect=true',
  artist:
    '/courses/allthethingscourse/units/1/lessons/3/levels/10?noautoplay=true&no_redirect=true',
  bounce:
    '/courses/allthethingscourse/units/1/lessons/8/levels/2?noautoplay=true&no_redirect=true',
  flappy:
    '/courses/allthethingscourse/units/1/lessons/7/levels/2?noautoplay=true&no_redirect=true',
  spritelab:
    '/courses/allthethingscourse/units/1/lessons/36/levels/4?noautoplay=true&no_redirect=true',
} as const;

test.describe('can see finish button — small screen', () => {
  test(
    'Dance Party free-play level shows finish button at 1366×727',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const dance = new Dance(studentPage);
      await studentPage.goto(FREE_PLAY_URLS.dance);
      await dance.waitForLabPage();
      await studentPage.setViewportSize(SMALL_SCREEN);
      await dance.run();
      await expect(dance.finishButton).toBeInViewport();
    },
  );

  test(
    'Artist free-play level shows finish button at 1366×727',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const artist = new Artist(studentPage);
      await studentPage.goto(FREE_PLAY_URLS.artist);
      await artist.waitForLabPage();
      await studentPage.setViewportSize(SMALL_SCREEN);
      await artist.run();
      await expect(artist.finishButton).toBeInViewport();
    },
  );

  test(
    'Bounce free-play level shows finish button at 1366×727',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const bounce = new Bounce(studentPage);
      await studentPage.goto(FREE_PLAY_URLS.bounce);
      await bounce.waitForLabPage();
      await studentPage.setViewportSize(SMALL_SCREEN);
      await bounce.run();
      await expect(bounce.finishButton).toBeInViewport();
    },
  );

  test(
    'Flappy free-play level shows finish button at 1366×727',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const flappy = new Flappy(studentPage);
      await studentPage.goto(FREE_PLAY_URLS.flappy);
      await flappy.waitForLabPage();
      await studentPage.setViewportSize(SMALL_SCREEN);
      await flappy.run();
      // Flappy uses #rightButton (text "Finish") — no #finishButton on this lab.
      // Cucumber step: button:contains('Finish').
      await expect(flappy.rightButton).toBeInViewport();
    },
  );

  test(
    'Sprite Lab free-play level shows finish button at 1366×727',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const spritelab = new SpriteLab(studentPage);
      await studentPage.goto(FREE_PLAY_URLS.spritelab);
      await spritelab.waitForLabPage();
      await studentPage.setViewportSize(SMALL_SCREEN);
      await spritelab.run();
      await expect(spritelab.finishButton).toBeInViewport();
    },
  );
});

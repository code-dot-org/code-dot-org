import {expect, test} from '../../shared/fixtures';
import {Artist} from '../activities/artist/Artist';
import {Bounce} from '../activities/bounce/Bounce';
import {Craft} from '../activities/craft/Craft';
import {Dance} from '../activities/dance/Dance';
import {Flappy} from '../activities/flappy/Flappy';
import {GameLab} from '../activities/gamelab/GameLab';
import {SpriteLab} from '../activities/spritelab/SpriteLab';

/**
 * Verify #finishButton is in-viewport on small (1366×727) screens after pressing Run
 * on each lab's free-play level.
 *
 * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
 * Background: I create a student named "Sally" — uses studentPage fixture.
 * @no_mobile — resize tests; mobile variants need a separate Playwright project.
 *
 * Mobile variants need a separate Playwright project. Bounce mobile variant
 * omitted (known issue: not in-viewport on iPhone).
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
  gamelab:
    '/courses/allthethingscourse/units/1/lessons/19/levels/4?noautoplay=true&no_redirect=true',
  minecraftAdventurer:
    '/courses/allthethingscourse/units/1/lessons/25/levels/5?noautoplay=true&no_redirect=true',
} as const;

test.describe('can see finish button — small screen', () => {
  /**
   * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
   * Scenario: can see finish button on "Dance Party"
   * Migration status: COMPLETED
   */
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

  /**
   * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
   * Scenario: can see finish button on "Artist"
   * Migration status: COMPLETED
   */
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

  /**
   * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
   * Scenario: can see finish button on "Bounce"
   * Migration status: COMPLETED
   */
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

  /**
   * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
   * Scenario: can see finish button on "Flappy"
   * Migration status: COMPLETED
   */
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

  /**
   * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
   * Scenario: can see finish button on "Sprite Lab"
   * Migration status: COMPLETED
   */
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

  /**
   * Source: dashboard/test/ui/features/star_labs/can_see_finish.feature
   * Scenario: can see finish button on "Game Lab"
   * Migration status: COMPLETED
   */
  test(
    'Game Lab free-play level shows finish button at 1366×727',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      await studentPage.goto(FREE_PLAY_URLS.gamelab);
      await gamelab.waitForLabPage();
      await studentPage.setViewportSize(SMALL_SCREEN);
      await gamelab.run();
      await expect(
        studentPage.getByRole('button', {name: 'Finish'}),
      ).toBeInViewport();
    },
  );

  /**
   * Source: dashboard/test/ui/features/star_labs/craft/can_see_finish.feature
   * Scenario: can see finish button on "Minecraft Adventurer"
   * Migration status: COMPLETED
   */
  test(
    'Minecraft Adventurer free-play level shows finish button at 1366×727',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const craft = new Craft(studentPage);
      await studentPage.goto(FREE_PLAY_URLS.minecraftAdventurer);
      await craft.waitForLabPage();
      await studentPage.setViewportSize(SMALL_SCREEN);
      await craft.run();
      await expect(craft.finishButton).toBeInViewport();
    },
  );
});

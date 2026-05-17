import {expect, test} from '../../shared/fixtures';

import {WINNING_MUSIC_LEVEL_2_BLOCKS} from './blocks';
import {MusicLab} from './MusicLab';

/**
 * Music Lab — drag play-sound block and change sound.
 *
 * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_drag_block.feature
 * Scenario Outline: Dragging play sound block
 *
 * The source feature is tagged @skip, @no_mobile, and @no_safari. The
 * Playwright port uses Blockly workspace serialization for the drag step and
 * still verifies the user-visible outcomes: no timeline before the block is
 * attached, timeline after attach, sounds panel opens, sound can be changed,
 * and the panel closes.
 */
test.describe('Music Lab — play-sound block', () => {
  let music: MusicLab;

  async function expectPlaySoundBlockCanChangeSound(): Promise<void> {
    await expect(music.whenRunBlock).toBeVisible();
    await expect(music.timelineElement).not.toBeVisible();

    await music.loadBlocks(WINNING_MUSIC_LEVEL_2_BLOCKS);
    await expect(music.timelineElement).toBeVisible();

    await music.clickBlockField(
      "[data-id='when-run-block'] > [data-id='play_sound_at_current_location_simple2'] > .blocklyEditableField",
    );
    await music.selectSound(1, 1);
    await music.dismissSoundsPanel();

    await expect(music.timelineElement).toBeVisible();
  }

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_drag_block.feature
   * Scenario: Dragging play sound block
   * Example: <url> = http://studio.code.org/courses/allthethingscourse/units/1/lessons/46/levels/4
   */
  test(
    'script level: attaching play-sound block opens timeline and allows sound change',
    {tag: ['@no_mobile', '@no_safari']},
    async ({page, browserName}) => {
      test.skip(browserName === 'webkit', '@no_safari');
      music = new MusicLab(page);
      await music.gotoLevel(4);
      await expectPlaySoundBlockCanChangeSound();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_drag_block.feature
   * Scenario: Dragging play sound block
   * Example: <url> = http://studio.code.org/projects/music/new
   */
  test(
    'new project: attaching play-sound block opens timeline and allows sound change',
    {tag: ['@no_mobile', '@no_safari']},
    async ({page, browserName}) => {
      test.skip(browserName === 'webkit', '@no_safari');
      music = new MusicLab(page);
      await music.gotoNewProject();
      await expectPlaySoundBlockCanChangeSound();
    },
  );
});

/**
 * Music Lab — lesson 46, levels 4 → 5 (level switching).
 *
 * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_switching_levels.feature
 * Scenario: Load a level and load the next
 */
test.describe('Music Lab — level switching', () => {
  let music: MusicLab;

  test.beforeEach(async ({page}) => {
    music = new MusicLab(page);
    await music.gotoLevel(4);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_switching_levels.feature
   * Scenario: Load a level and load the next
   */
  test(
    'clicking level 5 bubble loads level 5 workspace',
    {tag: '@visual'},
    async ({eyes}) => {
      await eyes.open('levelLoading');
      await music.page.locator("[title='Level 5 Lesson Music']").click();
      await expect(music.runButton).toBeVisible();
      await eyes.check('new level loading');
    },
  );
});

/**
 * Music Lab — lesson 46, level 6 (timeline keyboard navigation).
 *
 * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_timeline_nav.feature
 * Scenario: Ensure users can navigate into and out of timeline, and between elements with arrows
 */
test.describe('Music Lab — level 6 — timeline keyboard navigation', () => {
  let music: MusicLab;

  test.beforeEach(async ({page}) => {
    music = new MusicLab(page);
    await music.gotoLevel(6);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_timeline_nav.feature
   * Scenario: Ensure users can navigate into and out of timeline, and between elements with arrows
   */
  test('Enter enters timeline, ArrowRight moves focus, Escape exits to container', async ({
    browserName,
  }) => {
    test.skip(browserName === 'webkit', '@no_safari');

    await music.timeline.focus();
    await music.page.keyboard.press('Enter');

    // First .timeline-element button receives focus on Enter.
    await expect(music.timelineElement).toBeFocused();

    await music.page.keyboard.press('ArrowRight');
    // Focus moves to the next element; first element is no longer focused.
    await expect(music.timelineElement).not.toBeFocused();

    await music.page.keyboard.press('Escape');
    await expect(music.timeline).toBeFocused();
  });
});

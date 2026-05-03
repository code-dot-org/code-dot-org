import {expect, test} from '@playwright/test';

import {WINNING_MUSIC_LEVEL_2_BLOCKS} from './blocks';
import {MusicLab} from './MusicLab';

/**
 * Music Lab — lesson 46, level 2 ("Music Level 1": play one sound).
 *
 * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_drag_block.feature
 * The feature is tagged @skip in the Cucumber suite; these tests port its intent.
 */
test.describe('Music Lab — level 2', () => {
  let music: MusicLab;

  test.beforeEach(async ({page}) => {
    music = new MusicLab(page);
    await music.gotoLevel(2);
  });

  test('workspace loads with when-run block and no timeline entries', async () => {
    await expect(music.whenRunBlock).toBeVisible();
    await expect(music.timelineElement).not.toBeVisible();
  });

  test('attaching a play-sound block auto-previews in the timeline', async () => {
    await expect(music.timelineElement).not.toBeVisible();
    await music.loadBlocks(WINNING_MUSIC_LEVEL_2_BLOCKS);
    await expect(music.timelineElement).toBeVisible();
  });

  test('running with one sound plays and shows Nice work. feedback', async () => {
    await music.loadBlocks(WINNING_MUSIC_LEVEL_2_BLOCKS);
    await expect(music.timelineElement).toBeVisible();
    await music.run();
    // #instructions-feedback-message contains the feedback text and the continue
    // button label; use toContainText to match the message portion only.
    await expect(music.feedbackMessage).toContainText('Nice work.');
  });
});

/**
 * Music Lab — lesson 46, level 6 (timeline keyboard navigation).
 *
 * Source: dashboard/test/ui/features/star_labs/musiclab/musiclab_timeline_nav.feature
 * Tagged @no_safari in the Cucumber suite — skipped on webkit.
 */
test.describe('Music Lab — level 6 — timeline keyboard navigation', () => {
  let music: MusicLab;

  test.beforeEach(async ({page}) => {
    music = new MusicLab(page);
    await music.gotoLevel(6);
  });

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

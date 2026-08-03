import {expect, test} from '@playwright/test';

import {LegacyBlocklyLab} from '../../pages/legacy-blockly-lab';
import {analyze, WCAG_AA_TAGS} from '../../shared/axe';

import {LOSING_ARTIST_BLOCKS, WINNING_ARTIST_BLOCKS} from './blocks';

// Pre-existing WCAG AA debt on the loaded artist lab, locked as a regression
// baseline (rule id -> failing node count), scoped to the main content landmark
// so shared header/footer chrome does not count:
//   aria-required-children: the Blockly block canvas (g[role="listbox"],
//     aria-label "blocks") holds role="figure" block children, which are not
//     valid children of a listbox.
//   color-contrast: the Run button's label — white (#ffffff) on orange
//     (#ffa400) is 1.98:1, under the 4.5:1 AA minimum.
// settle() makes the counts deterministic across chromium/firefox/webkit. A new
// violation, or a fixed one, breaks the test: re-baseline it.
const EXPECTED_VIOLATIONS: Record<string, number> = {
  'aria-required-children': 1,
  'color-contrast': 1,
};

test.describe('Playing the Artist Game', () => {
  let artist: LegacyBlocklyLab;

  test.beforeEach(async ({page}) => {
    artist = new LegacyBlocklyLab(page);
    await artist.gotoLevel({lesson: 3, level: 2});
    await artist.dismissLoginReminder();
    await expect(artist.runButton).toBeVisible();
    await expect(artist.resetButton).toBeHidden();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist.feature "Loading the first level"
   */
  test('Loading the first level', async ({page}) => {
    // On load the lab renders its intro-video thumbnail and the turtle avatar,
    // matched by asset path. Presence in the DOM is the signal, so assert the
    // image is attached rather than checking an exact count.
    await expect(
      page.locator('img[src*="video_thumbnails/C2_artist_intro"]').first(),
    ).toBeAttached();
    await expect(
      page.locator('img[src*="artist/small_static_avatar"]').first(),
    ).toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist.feature "Winning the first level"
   */
  test('Winning the first level', async ({page}) => {
    await artist.loadBlocks(WINNING_ARTIST_BLOCKS);
    await artist.run();

    await expect(artist.resetButton).toBeVisible();
    await expect(artist.congratsMessage).toBeVisible();

    await artist.continue();
    await expect(page).toHaveURL(
      url =>
        url.pathname ===
        '/courses/allthethingscourse/units/1/lessons/3/levels/3',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist.feature "Losing the first level"
   */
  test('Losing the first level', async () => {
    await artist.loadBlocks(LOSING_ARTIST_BLOCKS);
    await artist.run();

    await expect(artist.resetButton).toBeVisible();
    await expect(artist.inlineFeedback).toBeVisible();
    // U+2019 RIGHT SINGLE QUOTATION MARK in "aren’t", verified live against studio.code.org.
    await expect(artist.inlineFeedback).toHaveText(
      'Not quite. Try using a block you aren’t using yet.',
    );

    await artist.reset();
    await expect(artist.runButton).toBeVisible();
    await expect(artist.resetButton).toBeHidden();
  });

  test(
    'Artist lab has no unexpected accessibility violations',
    {tag: '@no_mobile'},
    async ({page}) => {
      // #main_content is the <main> landmark every page carries (BasePage
      // scopes mainContent to it too); it excludes shared header/footer chrome.
      expect(
        await analyze(page, {include: '#main_content', tags: WCAG_AA_TAGS}),
      ).toEqual(EXPECTED_VIOLATIONS);
    },
  );
});

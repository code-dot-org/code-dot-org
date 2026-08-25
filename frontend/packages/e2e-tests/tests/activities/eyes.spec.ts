import {expect, test} from '../fixtures';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {MatchLevel} from '../pages/match-level';
import {MultiLevel} from '../pages/multi-level';
import {PixelationLevel} from '../pages/pixelation-level';
import {TextCompressionLevel} from '../pages/text-compression-level';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {waitForVisualStability} from '../shared/stability';

// Measured against test-studio; identical on chromium, firefox, and webkit.
// RTL surfaces are absent: axe verdicts differ per engine on identical styles.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  // image-alt: the answer and question images.
  multi: {'image-alt': 5},
  // image-alt: the puzzle and block match tiles.
  match: {'image-alt': 8},
  textOnlyMatch: {},
  // Both rules land on the dictionary CodeMirror textarea.
  textCompressionLevelLoad: {
    'aria-input-field-name': 1,
    'scrollable-region-focusable': 1,
  },
  // Entries add color-contrast: symbol glyphs on the editor background.
  textCompressionSimpleSubstitution: {
    'aria-input-field-name': 1,
    'color-contrast': 1,
    'scrollable-region-focusable': 1,
  },
  // color-contrast: #start_over. label: the 3 range sliders and #pixel_data.
  pixelationWithRange: {'color-contrast': 1, label: 4},
  // aria-required-children: Blockly's listbox canvas holds role="figure".
  mazeFeedback: {'aria-required-children': 1},
};

test.describe('Looking at a few things with Applitools Eyes', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature "multi"
   */
  test('multi', {tag: '@visual'}, async ({page, visualCheck}) => {
    const multi = new MultiLevel(page);
    await multi.gotoLevel({lesson: 9, level: 1});
    await multi.header.waitForFadeIn();
    await expect(multi.submitButton).toBeVisible();

    await waitForVisualStability(page);
    await visualCheck('multi');
  });

  test('multi: no unexpected accessibility violations', async ({page}) => {
    const multi = new MultiLevel(page);
    await multi.gotoLevel({lesson: 9, level: 1});
    await multi.header.waitForFadeIn();

    expect(
      await analyze(page, {include: multi.rootSelector, tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.multi);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature "match"
   */
  test('match', {tag: '@visual'}, async ({page, visualCheck}) => {
    const match = new MatchLevel(page);
    await match.gotoLevel({lesson: 11, level: 1});
    await match.header.waitForFadeIn();
    await expect(match.submitButton).toBeVisible();

    await match.dialog.waitForTitled('Instructions');
    await match.dialog.close();
    // Stands in for a flat 3s sleep in the source; no DOM condition gated it.
    await waitForVisualStability(page);
    await visualCheck('match', {mask: [match.answers]});
  });

  test('match: no unexpected accessibility violations', async ({page}) => {
    const match = new MatchLevel(page);
    await match.gotoLevel({lesson: 11, level: 1});
    await match.header.waitForFadeIn();
    await match.dialog.waitForTitled('Instructions');
    await match.dialog.close();

    expect(
      await analyze(page, {include: match.rootSelector, tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.match);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature "text-only match"
   */
  test('text-only match', {tag: '@visual'}, async ({page, visualCheck}) => {
    const match = new MatchLevel(page);
    await match.gotoLevel({lesson: 11, level: 2});
    await match.header.waitForFadeIn();
    await expect(match.submitButton).toBeVisible();

    await waitForVisualStability(page);
    await visualCheck('text-only-match', {mask: [match.answers]});
  });

  test('text-only match: no unexpected accessibility violations', async ({
    page,
  }) => {
    const match = new MatchLevel(page);
    await match.gotoLevel({lesson: 11, level: 2});
    await match.header.waitForFadeIn();

    expect(
      await analyze(page, {include: match.rootSelector, tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.textOnlyMatch);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature "text compression"
   */
  test('text compression', {tag: '@visual'}, async ({page, visualCheck}) => {
    const textCompression = new TextCompressionLevel(page);
    await textCompression.gotoLevel({lesson: 16, level: 1});
    await textCompression.header.waitForFadeIn();

    await waitForVisualStability(page);
    await visualCheck('text-compression-level-load');

    await textCompression.setDictionaryText('pitter\npatter\n');

    await waitForVisualStability(page);
    await visualCheck('text-compression-simple-substitution');
  });

  test('text compression: no unexpected accessibility violations', async ({
    page,
  }) => {
    const textCompression = new TextCompressionLevel(page);
    await textCompression.gotoLevel({lesson: 16, level: 1});
    await textCompression.header.waitForFadeIn();

    expect(
      await analyze(page, {
        include: textCompression.rootSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.textCompressionLevelLoad);

    await textCompression.setDictionaryText('pitter\npatter\n');

    expect(
      await analyze(page, {
        include: textCompression.rootSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.textCompressionSimpleSubstitution);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature "pixelation with range"
   */
  test(
    'pixelation with range',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const pixelation = new PixelationLevel(page);
      await pixelation.gotoLevel({lesson: 17, level: 2});
      await pixelation.header.waitForFadeIn();

      await waitForVisualStability(page);
      await visualCheck('pixelation-with-range');
    },
  );

  test('pixelation with range: no unexpected accessibility violations', async ({
    page,
  }) => {
    const pixelation = new PixelationLevel(page);
    await pixelation.gotoLevel({lesson: 17, level: 2});
    await pixelation.header.waitForFadeIn();

    expect(
      await analyze(page, {
        include: pixelation.mainContentSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.pixelationWithRange);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature "maze (incl. RTL revisit)"
   */
  test('maze', {tag: '@visual'}, async ({page, visualCheck}) => {
    const maze = new LegacyBlocklyLab(page);
    await maze.gotoLevel({lesson: 2, level: 1});
    await maze.run();
    await expect(maze.inlineFeedback).toBeVisible();

    await waitForVisualStability(page);
    await visualCheck('maze-feedback-with-blocks', {
      mask: [maze.visualization],
    });

    // The /lang/ redirect drops noautoplay, so the source omits it here too.
    await maze.gotoLevel({
      lesson: 2,
      level: 1,
      lang: 'ar-sa',
      noautoplay: false,
    });

    await waitForVisualStability(page);
    await visualCheck('maze-rtl', {mask: [maze.visualization]});

    // Source's trailing reset_session cleanup is moot: fresh context per test.
  });

  // The RTL revisit is not scanned: axe verdicts are not engine-portable.
  test('maze: no unexpected accessibility violations', async ({page}) => {
    const maze = new LegacyBlocklyLab(page);
    await maze.gotoLevel({lesson: 2, level: 1});
    await maze.run();
    await expect(maze.inlineFeedback).toBeVisible();

    expect(
      await analyze(page, {
        include: maze.mainContentSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.mazeFeedback);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature "star wars RTL"
   */
  test('star wars RTL', {tag: '@visual'}, async ({page, visualCheck}) => {
    const starWars = new LegacyBlocklyLab(page);
    // waitForReady() covers the source's manual waits, including x-close.
    await starWars.gotoLevel({lesson: 24, level: 9, lang: 'ar-sa'});

    await waitForVisualStability(page);
    await visualCheck('star-wars-rtl-blocks', {
      mask: [starWars.visualization],
    });

    await starWars.showCodeHeader.click();

    await waitForVisualStability(page);
    await visualCheck('star-wars-rtl-text-mode', {
      mask: [starWars.visualization],
    });
  });
});

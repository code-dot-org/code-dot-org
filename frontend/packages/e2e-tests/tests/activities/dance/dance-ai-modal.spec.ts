import {expect, test} from '@playwright/test';

import {DanceLab} from '../../pages/dance-lab';
import {analyze, WCAG_AA_TAGS} from '../../shared/axe';

// Measured against test-studio.code.org (chromium/firefox/webkit all agreed).
// A new or larger violation is a regression; a fixed or smaller one needs a
// re-baseline — either way toEqual should fail so it gets noticed.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  // Before adding any block, age dialog already answered. Same pre-existing
  // debt as artist.spec.ts's baseline (shared Blockly lab chrome):
  //   aria-required-children: the Blockly block canvas (g[role="listbox"],
  //     aria-label "blocks") holds role="figure" block children, which are
  //     not valid children of a listbox.
  //   color-contrast: the Run button's label — white (#ffffff) on orange
  //     (#ffa400) is 1.98:1, under the 4.5:1 AA minimum.
  initialLoad: {
    'aria-required-children': 1,
    'color-contrast': 1,
  },
  // AI modal open, emoji picker populated.
  //   aria-command-name: a <div role="button"> between the "generate"/
  //     "effect" mode labels (apps/src/dance/ai/DanceAiModalHeader.tsx) has
  //     no accessible name — its content is decorative dots, not text.
  aiModalOpen: {
    'aria-command-name': 1,
  },
};

const PARENT_BLOCK_ID = 'setup';
const AI_BLOCK_ID = 'dance_ai';

test.describe('Dance Party', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_ai_modal.feature "Dance AI Modal"
   */
  test('Dance AI Modal', async ({page}) => {
    const dance = new DanceLab(page);
    // The feature's literal URL carries no query string (unlike labLevelUrl's
    // noautoplay:true default), which likely lets the level's song autoplay;
    // this scenario never asserts on the player, so match the literal URL.
    await dance.gotoLevel({lesson: 37, level: 3, noautoplay: false});
    await dance.ageDialog.selectAge(10);

    expect(
      await analyze(page, {
        include: dance.mainContentSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.initialLoad);

    await dance.appendBlock('Dancelab_ai', AI_BLOCK_ID);
    await dance.connectBlockInside(AI_BLOCK_ID, PARENT_BLOCK_ID);

    const aiFieldSelector = dance.danceAiFieldSelector(
      PARENT_BLOCK_ID,
      AI_BLOCK_ID,
    );
    await dance.clickBlockField(aiFieldSelector);
    await dance.aiModal.waitForEmojiPicker();

    expect(
      await analyze(page, {
        include: dance.aiModal.modalSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.aiModalOpen);

    // First time choosing emojis.
    await dance.aiModal.selectEmoji('🎉');
    await dance.aiModal.selectEmoji('🤖');
    await dance.aiModal.selectEmoji('🪩');
    await dance.aiModal.generate();
    await dance.aiModal.waitForResults();

    // Toggle to code and back.
    await dance.aiModal.toggleCode();
    await dance.aiModal.toggleEffect();

    // Go to explanation and back.
    await dance.aiModal.openExplanation();
    await dance.aiModal.leaveExplanation();

    // Regenerate.
    await dance.aiModal.regenerate();
    await dance.aiModal.waitForResults();

    // Start over.
    await dance.aiModal.startOver();

    // Second time choosing emojis.
    await dance.aiModal.waitForEmojiPicker();
    await dance.aiModal.selectEmoji('💎');
    await dance.aiModal.selectEmoji('🌊');
    await dance.aiModal.selectEmoji('🚀');
    await dance.aiModal.generate();
    await dance.aiModal.waitForResults();

    // Use effects.
    await dance.aiModal.use();

    // Run.
    await dance.run();
    await dance.reset();

    // Reopen modal.
    await dance.clickBlockField(aiFieldSelector);

    // Toggle to code and use it.
    await dance.aiModal.toggleCode();
    await dance.aiModal.convert();

    // Setup now has two blocks.
    await expect(
      dance.convertedEffectBlockPaths(PARENT_BLOCK_ID).first(),
    ).toBeVisible();

    // Run.
    await dance.run();
    await dance.reset();
  });
});

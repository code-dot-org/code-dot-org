import {expect, test} from '../../../shared/fixtures';

import {WINNING_DANCE_LEVEL_8_BLOCKS} from './blocks';
import {Dance} from './Dance';

/**
 * Blockly re-generates variable IDs on each workspace deserialization.
 * Strip all id="..." attributes before comparing saved vs reloaded XML.
 */
const stripVarIds = (xml: string) => xml.replace(/ id="[^"]+"/g, '');

/**
 * Open the Dance Party share dialog and return the copied share URL.
 *
 * @param dance - Dance Party page object on an editable project level
 * @returns project share URL from #sharing-dialog-copy-button
 */
async function getDanceShareUrl(dance: Dance): Promise<string> {
  await dance.projectShareButton.click();
  const copyButton = dance.page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 30_000});
  const shareUrl = await copyButton.getAttribute('value');
  if (!shareUrl) {
    throw new Error('Dance Party share URL not found');
  }
  return shareUrl;
}

/**
 * Wait for the Dance Party share page run button.
 *
 * @param dance - Dance Party page object after navigating to a share URL
 */
async function waitForDanceSharePage(dance: Dance): Promise<void> {
  await expect(dance.runButton).toBeVisible({timeout: 60_000});
  await expect(dance.page.locator('#p5_loading')).toBeHidden({
    timeout: 60_000,
  });
}

/**
 * Dance Party — lesson 37, level 2 (run/reset toggle).
 *
 * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
 * Scenario: Can toggle run/reset in Dance Party. @no_mobile.
 */
test.describe('Dance Party — lesson 37 — run/reset toggle (level 2)', () => {
  let dance: Dance;

  test.beforeEach(async ({page}) => {
    dance = new Dance(page);
    await dance.gotoLevel(2);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
   * Scenario: Can toggle run/reset in Dance Party
   */
  test(
    'run/reset buttons and song selector toggle state on run and reset',
    {tag: '@no_mobile'},
    async () => {
      await expect(dance.runButton).toBeVisible();
      await expect(dance.resetButton).toBeHidden();
      await expect(dance.songSelector).toBeEnabled();

      await dance.run();
      await expect(dance.runButton).toBeHidden();
      await expect(dance.resetButton).toBeVisible();
      await expect(dance.songSelector).toBeDisabled();

      await dance.reset();
      await expect(dance.runButton).toBeVisible();
      await expect(dance.resetButton).toBeHidden();
      await expect(dance.songSelector).toBeEnabled();
    },
  );
});

/**
 * Dance Party — lesson 37, level 1 (level success).
 *
 * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
 * Scenario: Can get to level success in Dance Party. @no_mobile.
 */
test.describe('Dance Party — lesson 37 — level success (level 1)', () => {
  let dance: Dance;

  test.beforeEach(async ({page}) => {
    dance = new Dance(page);
    await dance.gotoLevel(1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
   * Scenario: Can get to level success in Dance Party
   */
  test(
    'running the default program completes the level',
    {tag: '@no_mobile'},
    async () => {
      await dance.run();
      await expect(dance.congratsMessage).toBeVisible();
    },
  );
});

/**
 * Dance Party — dance course, level 12 (page load).
 *
 * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
 * Scenario: Dance Party 12 loads. @no_mobile.
 */
test.describe('Dance Party — dance course — level 12 loads', () => {
  let dance: Dance;

  test.beforeEach(async ({page}) => {
    dance = new Dance(page);
    await dance.gotoDanceCourseLevel(12);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
   * Scenario: Dance Party 12 loads
   */
  test(
    'level 12 loads and shows the run button',
    {tag: '@no_mobile'},
    async () => {
      await expect(dance.runButton).toBeVisible();
    },
  );
});

/**
 * Dance Party — dance course, level 8 (set tint block).
 *
 * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
 * Scenario: Dance Party 8 runs new set tint block.
 */
test.describe('Dance Party — dance course — set tint block (level 8)', () => {
  let dance: Dance;

  test.beforeEach(async ({page}) => {
    dance = new Dance(page);
    await dance.gotoDanceCourseLevel(8);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
   * Scenario: Dance Party 8 runs new set tint block
   */
  test('winning blocks with set tint pass the level', async () => {
    await dance.loadBlocks(WINNING_DANCE_LEVEL_8_BLOCKS);
    await dance.run();
    // Level 8 fires at timestamp 4 measures (~17s at the default song BPM).
    // Override the global 15s expect timeout for this assertion only.
    await expect(dance.congratsMessage).toBeVisible({timeout: 30_000});
  });
});

/**
 * Dance Party — restricted audio and share-page flows.
 *
 * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
 */
test.describe('Dance Party — restricted media and sharing', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
   * Scenario: Restricted audio content is protected
   */
  test('restricted audio content is unlocked only after Dance Party load', async ({
    page,
  }) => {
    const blockedResponse = await page.goto('/restricted/placeholder.txt');
    expect(await blockedResponse?.text()).not.toContain(
      'placeholder for testing',
    );

    const dance = new Dance(page);
    await dance.gotoDanceCourseLevel(1);

    const allowedResponse = await page.goto('/restricted/placeholder.txt');
    expect(await allowedResponse?.text()).toContain('placeholder for testing');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
   * Scenario: Dance Party Share
   */
  test(
    'signed-in student share page runs and links back to workspace',
    {tag: ['@no_mobile', '@no_safari']},
    async ({browserName, studentPage}) => {
      test.skip(browserName === 'webkit', '@no_safari');

      const dance = new Dance(studentPage);
      await dance.gotoDanceCourseLevel(13);
      await expect(dance.songSelector).toHaveValue('cheapthrills_sia', {
        timeout: 30_000,
      });

      const shareUrl = await getDanceShareUrl(dance);
      await studentPage.goto(shareUrl, {waitUntil: 'domcontentloaded'});
      await expect(studentPage.locator('.signInOrAgeDialog')).toBeHidden();
      await waitForDanceSharePage(dance);

      await dance.run();
      await expect(dance.resetButton).toBeVisible({timeout: 30_000});
      await dance.reset();
      await expect(dance.runButton).toBeVisible();
      await expect(dance.resetButton).toBeHidden();

      await dance.run();
      await expect
        .poll(
          () =>
            studentPage.evaluate(
              () =>
                (
                  window as Window & {
                    __DanceTestInterface?: {getSprites: () => unknown[]};
                  }
                ).__DanceTestInterface?.getSprites().length ?? 0,
            ),
          {timeout: 30_000},
        )
        .toBe(10);

      await studentPage.locator('button.more-link').click();
      await studentPage
        .locator('ul#more-menu')
        .getByText('How it Works (View Code)')
        .click();
      await expect(dance.songSelector).toHaveValue('cheapthrills_sia', {
        timeout: 30_000,
      });

      await studentPage.goto(`${shareUrl}?testid=99999999`, {
        waitUntil: 'domcontentloaded',
      });
      await expect(studentPage.locator('#open-workspace')).toBeVisible({
        timeout: 30_000,
      });
      await expect(studentPage.locator('#codeWorkspace')).not.toBeVisible();
      await studentPage.locator('#open-workspace').click();
      await expect(dance.songSelector).toHaveValue('cheapthrills_sia', {
        timeout: 30_000,
      });
      await expect(studentPage.locator('#codeWorkspace')).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_party.feature
   * Scenario: Dance Party can share while logged out
   */
  test(
    'signed-out Dance Party project share page loads',
    {tag: '@no_mobile'},
    async ({page}) => {
      const dance = new Dance(page);
      await dance.gotoDanceCourseLevel(13);

      const shareUrl = await getDanceShareUrl(dance);
      await page.goto(shareUrl, {waitUntil: 'domcontentloaded'});
      await waitForDanceSharePage(dance);
    },
  );
});

/**
 * Dance Party — lesson 37, level 3 (AI Modal).
 *
 * Source: dashboard/test/ui/features/star_labs/dance/dance_ai_modal.feature
 * Scenario: Dance AI Modal. Exercises the full generate → toggle → explain
 * → regenerate → start-over → use → convert-to-blocks flow.
 */
test.describe('Dance Party — lesson 37 — AI Modal (level 3)', () => {
  let dance: Dance;

  test.beforeEach(async ({page}) => {
    dance = new Dance(page);
    await dance.gotoLevel(3);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_ai_modal.feature
   * Scenario: Dance AI Modal
   */
  test('AI modal generates, toggles, explains, regenerates, and converts to blocks', async () => {
    await dance.appendBlock('Dancelab_ai', 'dance_ai');
    await dance.connectBlockInside('dance_ai', 'setup');
    await dance.openAiModal();
    await expect(dance.aiModalHeader).toBeVisible();

    // First emoji selection and generate.
    await dance.selectAiEmojis('🎉', '🤖', '🪩');
    await dance.generateAiEffects();

    // Toggle between code view and effects view.
    await dance.toggleAiCodeView();
    await dance.toggleAiEffectView();

    // Open explanation panel and close it.
    await dance.openAiExplanation();
    await dance.closeAiExplanation();

    // Regenerate.
    await dance.regenerateAiEffects();

    // Start over and second emoji selection.
    await dance.startOverAi();
    await dance.selectAiEmojis('💎', '🌊', '🚀');
    await dance.generateAiEffects();

    // Use the generated effects — modal closes.
    await dance.useAiEffects();

    // Run and reset.
    await dance.pressRunAndReset();

    // Reopen modal — after useAiEffects() the block stores generated effects;
    // effects view (Use button visible) is shown, not the empty emoji picker.
    await dance.openAiModal();
    await expect(dance.aiUseButton).toBeVisible();
    await dance.toggleAiCodeView();
    await dance.convertAiToBlocks();

    // Setup block now contains two child blocks.
    await expect(
      dance.page.locator("[data-id='setup'] > g > g > .blocklyPath"),
    ).toBeVisible();

    // Final run and reset.
    await dance.pressRunAndReset();
  });
});

/**
 * Dance Party — lesson 37, level 4 (AI Modal eyes — visual checkpoints).
 *
 * Source: dashboard/test/ui/features/star_labs/dance/dance_ai_modal_eyes.feature
 * @no_mobile @eyes — visual checkpoints annotated; snapshot assertions pending.
 * Level 4 has the Dancelab_ai block pre-loaded with prior AI results, so
 * clicking the field opens the modal with results already visible.
 */
test.describe('Dance Party — lesson 37 — AI Modal eyes (level 4)', () => {
  let dance: Dance;

  test.beforeEach(async ({page}) => {
    dance = new Dance(page);
    await dance.gotoLevel(4);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/dance_ai_modal_eyes.feature
   * Scenario: Dance AI Modal
   */
  test(
    'AI modal code toggle and emoji picker render in LTR and RTL',
    {tag: ['@no_mobile', '@visual']},
    async () => {
      // LTR: open modal (pre-generated results already visible).
      await dance.openAiModal();
      await expect(dance.aiUseButton).toBeVisible();
      await dance.toggleAiCodeView();
      // visual checkpoint: "toggle to code"
      await dance.toggleAiEffectView();

      // Start over and select new emojis in LTR.
      await dance.startOverAi();
      await dance.selectAiEmojis('💎', '🌊', '🚀');
      // visual checkpoint: "selecting new emojis"

      // RTL: navigate to Arabic locale of the same level.
      await dance.page.goto(
        '/courses/allthethingscourse/units/1/lessons/37/levels/4/lang/ar-sa',
      );
      await dance.waitForDancePage();

      // RTL: open modal, toggle to code view.
      await dance.openAiModal();
      await expect(dance.aiUseButton).toBeVisible();
      await dance.toggleAiCodeView();
      // visual checkpoint: "toggle to code in RTL"
      await dance.toggleAiEffectView();

      // RTL: start over.
      await dance.startOverAi();
      // visual checkpoint: "starting over in Dance AI modal in RTL"

      // RTL: select new emojis.
      await dance.selectAiEmojis('💎', '🌊', '🚀');
      // visual checkpoint: "selecting new emojis in RTL"
    },
  );
});

/**
 * Dance Party — dance course, level 13 (free-play project save).
 *
 * Source: dashboard/test/ui/features/star_labs/dance/save_for_share.feature
 * Non-@as_student scenarios: Share and Finish triggers.
 *
 * Background: block "5" (data-id="5") in the free-play default code is
 * "make a new cat" (Dancelab_makeNewDanceSprite, 3rd sprite). Disposing it
 * creates a non-default code state to verify the save round-trip.
 */
test.describe('Dance Party — dance course — free play save (level 13)', () => {
  let dance: Dance;

  test.beforeEach(async ({page}) => {
    dance = new Dance(page);
    await dance.gotoDanceCourseLevel(13);
    await expect(dance.clearPuzzleHeader).toBeVisible();
    await dance.clearPuzzleHeader.click();
    await dance.confirmStartOver();
    // Remove block "5" (make a new cat) to create a code state distinct from default.
    await dance.disposeBlock('5');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/save_for_share.feature
   * Scenario: Free play level saves when Share is clicked
   */
  test('saves when Share is clicked', {tag: '@no_mobile'}, async () => {
    const memorizedCode = stripVarIds(await dance.getBlockXML());
    await dance.projectShareButton.click();
    await dance.waitForProjectSave();
    await dance.page.reload();
    await expect(dance.runButton).toBeVisible();
    expect(stripVarIds(await dance.getBlockXML())).toBe(memorizedCode);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/dance/save_for_share.feature
   * Scenario: Free play level saves when Finish is clicked
   */
  test('saves when Finish is clicked', {tag: '@no_mobile'}, async () => {
    const memorizedCode = stripVarIds(await dance.getBlockXML());
    await dance.finishButton.click();
    await expect(dance.projectUpdatedAt).toContainText('Saved');
    await dance.page.reload();
    await expect(dance.runButton).toBeVisible();
    expect(stripVarIds(await dance.getBlockXML())).toBe(memorizedCode);
  });
});

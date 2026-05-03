import {test} from '@playwright/test';

import {MixMoveAI} from './MixMoveAI';

/**
 * Mix & Move with AI — full dancer, music, and dance generation flow.
 *
 * Source: dashboard/test/ui/features/star_labs/mix_move_ai.feature
 * @no_mobile @no_safari @no_device_farm
 *
 * One end-to-end scenario covering three AI generation phases:
 *   Phase 1 (level 3) — dancer creation: generate, back, regenerate, continue.
 *   Phase 2 (level 13) — music generation: pack select, generate, use code, modify sound, continue.
 *   Phase 3 (level 14) — dance generation: generate, use code, delete block, tab nav, continue.
 */

/** Skip WebKit — @no_safari. */
const skipSafari = ({browserName}: {browserName: string}) =>
  test.skip(browserName === 'webkit', '@no_safari');

const LESSON_NAME = 'Mix & Move with AI';

test.describe('Mix & Move with AI', () => {
  test('dancer, music, dance AI generation flow', async ({
    page,
    browserName,
  }) => {
    // Nine sequential AI generation calls; 90s global is insufficient.
    test.setTimeout(300_000);
    skipSafari({browserName});

    const lab = new MixMoveAI(page);

    // ── Phase 1: Create a dancer (level 3) ──────────────────────────────────

    await lab.gotoLevel(3);

    // First generation pass (koala).
    await lab.creature.waitFor({state: 'visible'});
    await lab.selectOption('creature', 'koala');
    await lab.generateDancerButton.click();

    // Go back and regenerate with a different animal (axolotl).
    await lab.goBack();
    await lab.creature.waitFor({state: 'visible'});
    await lab.selectOption('creature', 'axolotl');
    await lab.generateDancerButton.click();

    // Regenerate with the same selection.
    await lab.regenerate();

    // Advance to the next phase.
    await lab.waitForContinueButton();
    await lab.continue();
    // Wait for continue-button navigation to settle before clicking the header.
    // Selenium implicitly awaits page load after each action; Playwright does not.
    await page.waitForURL(url => !url.pathname.endsWith('/levels/3'), {
      timeout: 30_000,
    });

    // ── Phase 2: Create music (level 13) ────────────────────────────────────

    await lab.clickHeaderLevel(13, LESSON_NAME);
    await page.waitForURL(/\/levels\/13/, {timeout: 30_000});

    await lab.selectFirstPack();

    // First generation pass.
    await lab.mood.waitFor({state: 'visible'});
    await lab.selectOption('mood', 'simple');
    await lab.selectOption('length', 'short');
    await lab.selectOption('drums', 'original');
    await lab.generateCodeButton.click();

    // Go back and regenerate with different settings.
    await lab.goBack();
    await lab.mood.waitFor({state: 'visible'});
    await lab.selectOption('mood', 'creative');
    await lab.selectOption('length', 'medium');
    await lab.selectOption('drums', 'electro');
    await lab.generateCodeButton.click();

    await lab.regenerate();
    await lab.useCode();

    // Modify code: click the field inside the first "play sound" block to open
    // the sounds panel, then select a pack and sound.
    await lab.clickBlockField(
      '.when_run_simple2 .play_sound_at_current_location_simple2 > .blocklyEditableField',
    );
    await lab.soundsPanel.waitFor({state: 'visible'});
    await lab.soundsFolderRow(1).click();
    await lab.soundsSoundRow(1).click();

    await lab.dismissSoundsPanel();

    await lab.continue();
    await page.waitForURL(url => !url.pathname.endsWith('/levels/13'), {
      timeout: 30_000,
    });

    // ── Phase 3: Create a dance (level 14) ──────────────────────────────────

    await lab.clickHeaderLevel(14, LESSON_NAME);
    await page.waitForURL(/\/levels\/14/, {timeout: 30_000});

    // First generation pass.
    await lab.complexity.waitFor({state: 'visible'});
    await lab.selectOption('complexity', 'basic');
    await lab.selectOption('energy', 'chill');
    await lab.selectOption('dancers', 'robots');
    await lab.generateDanceButton.click();

    // Go back and regenerate with different settings.
    await lab.goBack();
    await lab.complexity.waitFor({state: 'visible'});
    await lab.selectOption('complexity', 'complex');
    await lab.selectOption('energy', 'high energy');
    await lab.selectOption('dancers', 'moose');
    await lab.generateDanceButton.click();

    await lab.regenerate();
    await lab.useCode();

    // Modify code: select the last block inside the when-run block and delete it.
    await lab.clickLastBlockIn('.Dancelab_whenRun');
    await page.keyboard.press('Delete');

    // Verify tab navigation across all three phases.
    await lab.clickDancerTab();
    await lab.creature.waitFor({state: 'visible'});

    await lab.clickMusicTab();
    await lab.backToPromptButton.waitFor({state: 'visible'});

    await lab.clickDanceTab();

    // Continue button visible confirms dance-phase completion.
    await lab.waitForContinueButton();
    await lab.continue();

    // On the last level, continue() calls shareLab2Project() which mounts
    // Lab2ShareDialogWrapper inside #project-share-dialog.
    await lab.waitForShareDialog();
  });
});

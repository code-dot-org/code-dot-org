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
    await page.locator('#creature').waitFor({state: 'visible'});
    await lab.selectOption('creature', 'koala');
    await page.locator('#generate-dancer-button').click();

    // Go back and regenerate with a different animal (axolotl).
    await page
      .locator('#back-to-prompt-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#back-to-prompt-button').click();
    await page.locator('#creature').waitFor({state: 'visible'});
    await lab.selectOption('creature', 'axolotl');
    await page.locator('#generate-dancer-button').click();

    // Regenerate with the same selection.
    await page
      .locator('#regenerate-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#regenerate-button').click();

    // Advance to the next phase.
    await page
      .locator('#instructions-continue-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await lab.continue();
    // Wait for continue-button navigation to settle before clicking the header.
    // Selenium implicitly awaits page load after each action; Playwright does not.
    await page.waitForURL(url => !url.pathname.endsWith('/levels/3'), {
      timeout: 30_000,
    });

    // ── Phase 2: Create music (level 13) ────────────────────────────────────

    await lab.clickHeaderLevel(13, LESSON_NAME);
    await page.waitForURL(/\/levels\/13/, {timeout: 30_000});

    // Select the first music pack from the pack dialog.
    await page
      .locator('.pack-dialog-entry')
      .first()
      .waitFor({state: 'visible'});
    await page.locator('.pack-dialog-entry').first().click();
    await page.locator('#pack-dialog-select-button').click();

    // First generation pass.
    await page.locator('#mood').waitFor({state: 'visible'});
    await lab.selectOption('mood', 'simple');
    await lab.selectOption('length', 'short');
    await lab.selectOption('drums', 'original');
    await page.locator('#generate-code-button').click();

    // Go back and regenerate with different settings.
    await page
      .locator('#back-to-prompt-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#back-to-prompt-button').click();
    await page.locator('#mood').waitFor({state: 'visible'});
    await lab.selectOption('mood', 'creative');
    await lab.selectOption('length', 'medium');
    await lab.selectOption('drums', 'electro');
    await page.locator('#generate-code-button').click();

    await page
      .locator('#regenerate-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#regenerate-button').click();

    await page
      .locator('#use-code-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#use-code-button').click();

    // Modify code: click the field inside the first "play sound" block to open
    // the sounds panel, then select a pack and sound.
    await lab.clickBlockField(
      '.when_run_simple2 .play_sound_at_current_location_simple2 > .blocklyEditableField',
    );
    await page.locator('#sounds-panel').waitFor({state: 'visible'});
    await page.locator('#sounds-panel .sounds-panel-folder-row').nth(1).click();
    await page.locator('#sounds-panel .sounds-panel-sound-row').nth(1).click();

    // Dismiss the sounds panel with ESC.
    await page.keyboard.press('Escape');
    await page.locator('#sounds-panel').waitFor({state: 'hidden'});

    await lab.continue();
    await page.waitForURL(url => !url.pathname.endsWith('/levels/13'), {
      timeout: 30_000,
    });

    // ── Phase 3: Create a dance (level 14) ──────────────────────────────────

    await lab.clickHeaderLevel(14, LESSON_NAME);
    await page.waitForURL(/\/levels\/14/, {timeout: 30_000});

    // First generation pass.
    await page.locator('#complexity').waitFor({state: 'visible'});
    await lab.selectOption('complexity', 'basic');
    await lab.selectOption('energy', 'chill');
    await lab.selectOption('dancers', 'robots');
    await page.locator('#generate-dance-button').click();

    // Go back and regenerate with different settings.
    await page
      .locator('#back-to-prompt-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#back-to-prompt-button').click();
    await page.locator('#complexity').waitFor({state: 'visible'});
    await lab.selectOption('complexity', 'complex');
    await lab.selectOption('energy', 'high energy');
    await lab.selectOption('dancers', 'moose');
    await page.locator('#generate-dance-button').click();

    await page
      .locator('#regenerate-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#regenerate-button').click();

    await page
      .locator('#use-code-button')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('#use-code-button').click();

    // Modify code: select the last block inside the when-run block and delete it.
    await lab.clickLastBlockIn('.Dancelab_whenRun');
    await page.keyboard.press('Delete');

    // Verify tab navigation across all three phases.
    await page.locator('#tab-button-Dancer').click();
    await page.locator('#creature').waitFor({state: 'visible'});

    await page.locator('#tab-button-Music').click();
    await page.locator('#back-to-prompt-button').waitFor({state: 'visible'});

    await page.locator('#tab-button-Dance').click();

    // Continue button visible confirms dance-phase completion.
    await page
      .locator('#instructions-continue-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await lab.continue();

    // On the last level, continue() calls shareLab2Project() which mounts
    // Lab2ShareDialogWrapper inside #project-share-dialog.  The visible
    // overlay (role="presentation") confirms the share dialog opened.
    await page.locator('#project-share-dialog [role="presentation"]').waitFor({
      state: 'visible',
      timeout: 30_000,
    });
  });
});

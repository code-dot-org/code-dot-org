import {expect, test} from '../fixtures';
import {ExternalLevel} from '../pages/external-level';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {
  waitForEmbeddedBlocklyStable,
  waitForVisualStability,
} from '../shared/stability';

test.describe('Markdown rendering across the website', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature "Visiting an external markdown level with details tag"
   */
  test('Visiting an external markdown level with details tag', async ({
    page,
  }) => {
    const level = new ExternalLevel(page);

    await level.gotoLevel({lesson: 21, level: 1});

    // extraDetailsTag lives inside the collapsed #cool-list <details>, so it
    // is attached but not visible until the list is expanded below.
    await expect(level.extraDetailsTag).toBeAttached();
    await expect(level.coolList).not.toHaveAttribute('open');

    await level.toggleCoolList();

    await expect(level.coolList).toHaveAttribute('open', '');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature "Viewing a level with blockly embedded in instructions"
   */
  test(
    'Viewing a level with blockly embedded in instructions',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const lab = new LegacyBlocklyLab(page);

      // Mask the lesson header: its save-status timestamp and progress
      // bubbles vary between runs but carry no signal for this check
      // (blockly-in-instructions rendering).
      await lab.gotoLevel({lesson: 21, level: 2});
      await waitForEmbeddedBlocklyStable(page);
      await waitForVisualStability(page);
      await visualCheck('basic embedded blockly', {
        mask: [lab.lessonHeaderInfo],
      });

      await lab.gotoLevel({lesson: 21, level: 3});
      await waitForEmbeddedBlocklyStable(page);
      await waitForVisualStability(page);
      // Mask the maze playfield too: this level's sprite art idle-animates,
      // so its rendered frame is not deterministic across runs (see
      // apps/src/maze/Visualization.jsx) even though it carries no signal
      // for this check (markdown-in-instructions rendering).
      await visualCheck('K1 embedded blockly', {
        mask: [lab.lessonHeaderInfo, lab.visualization],
      });
    },
  );

  /**
   * Regression test for a real race: convertXmlToBlockly() (see
   * apps/src/templates/instructions/utils.js) gates embedded-workspace
   * creation on a GET /user_preference/theme round-trip that its caller
   * never awaits, so the embedded block can still be 0x0 well after
   * waitForVisualStability resolves. Delaying that request reproduces it
   * deterministically; without waitForEmbeddedBlocklyStable this fails.
   */
  test('embedded Blockly blocks in instructions render before checkpointing', async ({
    page,
  }) => {
    const lab = new LegacyBlocklyLab(page);
    await page.route('**/user_preference/theme', async route => {
      await new Promise(resolve => setTimeout(resolve, 2_000));
      await route.continue();
    });

    await lab.gotoLevel({lesson: 21, level: 3});
    await waitForEmbeddedBlocklyStable(page);
    await waitForVisualStability(page);

    const container = page.locator('.readonly-block-space-container').first();
    const box = await container.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });
});

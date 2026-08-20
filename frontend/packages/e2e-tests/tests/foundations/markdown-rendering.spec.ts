import {expect, test} from '../fixtures';
import {ExternalLevel} from '../pages/external-level';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {waitForVisualStability} from '../shared/stability';

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
      await lab.waitForEmbeddedInstructionsStable();
      await waitForVisualStability(page);
      await visualCheck('basic embedded blockly', {
        mask: [lab.lessonHeaderInfo],
      });

      await lab.gotoLevel({lesson: 21, level: 3});
      await lab.waitForEmbeddedInstructionsStable();
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
});

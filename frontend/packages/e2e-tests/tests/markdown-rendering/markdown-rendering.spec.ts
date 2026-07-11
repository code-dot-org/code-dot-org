import {expect, test} from '../fixtures';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {labLevelUrl} from '../shared/routes';

test.describe('Markdown rendering across the website', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature "Visiting an external markdown level with details tag"
   */
  test('Visiting an external markdown level with details tag', async ({
    page,
  }) => {
    await page.goto(labLevelUrl({lesson: 21, level: 1}));

    // IDs authored into this level's markdown content as test hooks (not
    // accessible-role targets) — matches the level's own literal selectors.
    const extraDetailsTag = page.locator('#extra-details-tag');
    const coolList = page.locator('#cool-list');
    const summaryTag = page.locator('#summary-tag');
    await expect(extraDetailsTag).toBeAttached();
    await expect(coolList).not.toHaveAttribute('open');

    await summaryTag.click();
    await expect(coolList).toHaveAttribute('open');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature "Viewing a level with blockly embedded in instructions" (@eyes)
   */
  test(
    'Blockly in instructions',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const lab = new LegacyBlocklyLab(page);
      await lab.gotoLevel({lesson: 21, level: 2});

      // Level 2 is the turtle/artist lab (#visualization canvas); its initial
      // state renders deterministically, so no mask is needed here.
      await lab.waitForVisualStability();
      await visualCheck('basic embedded blockly');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature "Viewing a level with blockly embedded in instructions" (@eyes)
   */
  test(
    'Blockly in K1 instructions',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const lab = new LegacyBlocklyLab(page);
      await lab.gotoLevel({lesson: 21, level: 3});

      await lab.waitForVisualStability();
      // Maze skin scatters background decorations via Math.random() (apps/src/maze/maze.js)
      // with no fixed seed — static within a load but different across loads, so
      // the visualization region is masked from the comparison.
      await visualCheck('K1 embedded blockly', {mask: [lab.visualization]});
    },
  );
});

import {expect, test} from '@playwright/test';

/**
 * Markdown rendering — HTML details/summary tag behavior in a level page.
 *
 * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature
 */
test.describe('Markdown rendering — details/summary tag', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature
   * Scenario: Visiting an external markdown level with details tag
   */
  test('details element is closed on load and opens on click', async ({
    page,
  }) => {
    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/21/levels/1?noautoplay=true',
    );
    await expect(page.locator('#extra-details-tag')).toHaveCount(1);
    await expect(page.locator('#cool-list')).not.toHaveAttribute('open', '');

    await page.locator('#summary-tag').click();

    await expect(page.locator('#cool-list')).toHaveAttribute('open', '');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature
   * Scenario: Viewing a level with blockly embedded in instructions
   */
  test('blockly embedded in instructions renders on both markdown levels', async ({
    page,
  }) => {
    for (const level of [2, 3]) {
      await page.goto(
        `/courses/allthethingscourse/units/1/lessons/21/levels/${level}?noautoplay=true`,
      );
      await expect(page.locator('#runButton')).toBeVisible({timeout: 30_000});
      await expect(page.locator('.blocklySvg')).not.toHaveCount(0);
      await expect(
        page.locator('.blocklySvg .blocklyText').first(),
      ).toContainText(/when\s+run/);
    }
  });
});

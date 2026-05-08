import {expect, test} from '../../shared/fixtures';
import {
  expectHintCount,
  expectNoHintCount,
  hintPanel,
  viewNextHint,
} from '../../shared/hints';

/**
 * Authored hints — lesson 6 level 2 of allthethingscourse.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/authored_hints.feature
 *
 * Anonymous; no authentication required.
 * The level has exactly three authored hints.
 */

const LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/6/levels/2?noautoplay=true';

test.describe('Authored hints', () => {
  test('cycling through all three authored hints', async ({page}) => {
    await page.goto(LEVEL_URL);
    await page
      .locator('#lightbulb')
      .waitFor({state: 'visible', timeout: 30_000});

    // Three hints available initially.
    await expectHintCount(page, 3);

    // First hint: plain text with basic markup.
    await viewNextHint(page);
    await expect(hintPanel(page)).toContainText('This is the first hint.');
    await expect(hintPanel(page)).toContainText('It has some basic markup');
    await expectHintCount(page, 2);

    // Second hint: includes an image.
    await viewNextHint(page);
    await expect(hintPanel(page)).toContainText(
      'This is the second hint. It has a hint video.',
    );
    await expect(hintPanel(page).locator('a img')).toBeVisible();
    await expectHintCount(page, 1);

    // Wait for the hint image to fully decode before advancing.
    // Use 'a img' to avoid strict-mode violation (Immersive Reader also adds an img).
    await hintPanel(page)
      .locator('a img')
      .evaluate(
        img =>
          new Promise<void>(resolve => {
            if ((img as HTMLImageElement).complete) {
              resolve();
              return;
            }
            img.addEventListener('load', () => resolve(), {once: true});
            img.addEventListener('error', () => resolve(), {once: true});
          }),
      );

    // Third (final) hint: no remaining hints badge.
    await viewNextHint(page);
    await expect(hintPanel(page)).toContainText(
      "This is the third and final hint. It doesn't have anything special.",
    );
    await expectNoHintCount(page);

    // Further lightbulb clicks produce no confirmation prompt.
    await page.locator('#lightbulb').click();
    await expect(
      page.locator('.csf-top-instructions button:text("Yes")'),
    ).not.toBeVisible();
  });
});

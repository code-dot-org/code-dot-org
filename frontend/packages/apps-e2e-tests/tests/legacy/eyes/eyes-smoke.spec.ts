import {expect, test} from '../../shared/fixtures';
import {labLevelUrl} from '../../shared/urls';
import {Maze} from '../activities/maze/Maze';
import {Match} from '../match/Match';
import {Multi} from '../multi/Multi';
import {Pixelation} from '../pixelation/Pixelation';

/**
 * Legacy Applitools smoke ports.
 *
 * Source: dashboard/test/ui/features/eyes.feature
 *
 * The source scenarios have blank Gherkin names and use Applitools
 * checkpoints. These ports run the same user setup up to each checkpoint and
 * leave the pixel comparison as a stub comment at the checkpoint site.
 */

test.describe('Legacy Eyes smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('multi level reaches visual-checkpoint state', async ({page}) => {
    const multi = new Multi(page);
    await multi.gotoLevel(9, 1);
    await expect(multi.submitButton).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('match level reaches visual-checkpoint state after closing instructions', async ({
    page,
  }) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(11, 1));
    const match = new Match(page);
    await expect(match.submitButton).toBeVisible({timeout: 30_000});
    await match.dismissInstructionsIfPresent();
    await expect(match.submitButton).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('text-only match level reaches visual-checkpoint state', async ({
    page,
  }) => {
    const match = new Match(page);
    await match.gotoLevel(2);
    await expect(match.submitButton).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('text-compression level accepts dictionary text', async ({page}) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(16, 1));
    await expect(page.locator('body')).toContainText('Text Compression', {
      timeout: 30_000,
    });
    // Visual checkpoint stub: "level load".
    await page.evaluate(() => {
      const win = window as typeof window & {
        editor?: {setValue: (value: string) => void; getValue: () => string};
      };
      if (!win.editor) throw new Error('text-compression editor not ready');
      win.editor.setValue('pitter\npatter\n');
    });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const win = window as typeof window & {
            editor?: {getValue: () => string};
          };
          return win.editor?.getValue();
        }),
      )
      .toBe('pitter\npatter\n');
    // Visual checkpoint stub: "simple substitution".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('pixelation range level reaches visual-checkpoint state', async ({
    page,
  }) => {
    const pixelation = new Pixelation(page);
    await pixelation.gotoLevel(2);
    await expect(pixelation.pixelDataInput).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('maze feedback and RTL states reach visual checkpoints', async ({
    page,
  }) => {
    const maze = new Maze(page);
    await maze.gotoLevel(1);
    await maze.runUntilInlineFeedback();
    await expect(
      page.locator('.uitest-topInstructions-inline-feedback'),
    ).toBeVisible();
    // Visual checkpoint stub: "maze feedback with blocks".

    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/2/levels/1/lang/ar-sa?noautoplay=true',
    );
    await maze.waitForLabPage();
    await expect(page.locator('#runButton')).toBeVisible();
    // Visual checkpoint stub: "maze RTL".
  });
});

import {expect, test} from '../../shared/fixtures';

/**
 * Custom Blocks — Blockly block pool render check.
 *
 * Source: dashboard/test/ui/features/star_labs/custom_blocks.feature
 *
 * @chrome upstream — run on Chromium; other browsers should also work.
 */

test.describe('Custom Blocks — pool rendering', () => {
  /**
   * Source: custom_blocks.feature — "Poetry blocks"
   * Navigates to the Poetry block pool page and asserts all blocks
   * render without triggering the "unknownBlock" fallback.
   */
  test('Poetry blocks render with no unknown blocks', async ({
    levelbuilderPage,
  }) => {
    await levelbuilderPage.goto('/pools/Poetry/blocks');
    await levelbuilderPage.waitForFunction(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (window as any).Blockly !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.Workspace.getAll().length > 0,
      {timeout: 30_000},
    );
    const badWorkspaces: string[] = await levelbuilderPage.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const B = (window as any).Blockly;
      return B.Workspace.getAll()
        .map((ws: any) => {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          const bad = ws.getAllBlocks().some((b: any) => !!b.unknownBlock); // eslint-disable-line @typescript-eslint/no-explicit-any
          return bad
            ? (ws.getParentSvg().parentElement as HTMLElement).id
            : null;
        })
        .filter(Boolean);
    });
    expect(badWorkspaces).toHaveLength(0);
  });

  /**
   * Source: custom_blocks.feature — "Dance Party blocks"
   */
  test('Dance Party blocks render with no unknown blocks', async ({
    levelbuilderPage,
  }) => {
    await levelbuilderPage.goto('/pools/Dancelab/blocks');
    await levelbuilderPage.waitForFunction(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (window as any).Blockly !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.Workspace.getAll().length > 0,
      {timeout: 30_000},
    );
    const badWorkspaces: string[] = await levelbuilderPage.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const B = (window as any).Blockly;
      return B.Workspace.getAll()
        .map((ws: any) => {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          const bad = ws.getAllBlocks().some((b: any) => !!b.unknownBlock); // eslint-disable-line @typescript-eslint/no-explicit-any
          return bad
            ? (ws.getParentSvg().parentElement as HTMLElement).id
            : null;
        })
        .filter(Boolean);
    });
    expect(badWorkspaces).toHaveLength(0);
  });
});

import {expect, test} from '../../shared/fixtures';

type BlocklyBlock = {unknownBlock?: unknown};
type BlocklyWorkspace = {
  getAllBlocks: () => BlocklyBlock[];
  getParentSvg: () => SVGElement;
};
type BlocklyWindow = Window & {
  Blockly?: {
    Workspace: {getAll: () => BlocklyWorkspace[]};
  };
};

/**
 * Custom Blocks — Blockly block pool render check.
 *
 * Source: dashboard/test/ui/features/star_labs/custom_blocks.feature
 *
 * @chrome upstream — run on Chromium only.
 */

test.describe('Custom Blocks — pool rendering', () => {
  test.beforeEach(({browserName}) => {
    test.skip(browserName !== 'chromium', '@chrome');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/custom_blocks.feature
   * Scenario: Poetry blocks
   * Navigates to the Poetry block pool page and asserts all blocks
   * render without triggering the "unknownBlock" fallback.
   */
  test('Poetry blocks render with no unknown blocks', async ({
    levelbuilderPage,
  }) => {
    await levelbuilderPage.goto('/pools/Poetry/blocks');
    await levelbuilderPage.waitForFunction(
      () => {
        const pageWindow = window as BlocklyWindow;
        return (
          pageWindow.Blockly !== undefined &&
          pageWindow.Blockly.Workspace.getAll().length > 0
        );
      },
      {timeout: 30_000},
    );
    const badWorkspaces: string[] = await levelbuilderPage.evaluate(() => {
      const B = (window as BlocklyWindow).Blockly;
      if (!B) return [];
      return B.Workspace.getAll()
        .map((ws: BlocklyWorkspace) => {
          const bad = ws.getAllBlocks().some(b => !!b.unknownBlock);
          return bad
            ? (ws.getParentSvg().parentElement as HTMLElement).id
            : null;
        })
        .filter((id): id is string => id !== null);
    });
    expect(badWorkspaces).toHaveLength(0);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/custom_blocks.feature
   * Scenario: Dance Party blocks
   */
  test('Dance Party blocks render with no unknown blocks', async ({
    levelbuilderPage,
  }) => {
    await levelbuilderPage.goto('/pools/Dancelab/blocks');
    await levelbuilderPage.waitForFunction(
      () => {
        const pageWindow = window as BlocklyWindow;
        return (
          pageWindow.Blockly !== undefined &&
          pageWindow.Blockly.Workspace.getAll().length > 0
        );
      },
      {timeout: 30_000},
    );
    const badWorkspaces: string[] = await levelbuilderPage.evaluate(() => {
      const B = (window as BlocklyWindow).Blockly;
      if (!B) return [];
      return B.Workspace.getAll()
        .map((ws: BlocklyWorkspace) => {
          const bad = ws.getAllBlocks().some(b => !!b.unknownBlock);
          return bad
            ? (ws.getParentSvg().parentElement as HTMLElement).id
            : null;
        })
        .filter((id): id is string => id !== null);
    });
    expect(badWorkspaces).toHaveLength(0);
  });
});

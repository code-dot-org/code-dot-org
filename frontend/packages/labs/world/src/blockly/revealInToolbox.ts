// "Show me" for a block or a drawer: open the drawer, and give the block
// Blockly's own focus (specs/SHOW_ME_PLAN.md).
//
// A block in the flyout is not markup the lab owns, so the lab's ring cannot
// go on it. It does not need to. Blockly 13 has keyboard navigation and a
// focus manager built in, a block is a focusable node, and focusing one draws
// Blockly's focus ring and is what a screen reader follows
// (`.agents/skills/accessibility/blockly.md`). So pointing at a block is:
// select the drawer that holds it, then focus it in the flyout.
//
// WRITTEN AGAINST THE FEW METHODS IT USES, not against `WorkspaceSvg`, so
// that it can be tested with stand-ins: what is pinned is which drawer is
// chosen and which block is focused. Whether Blockly then draws and announces
// what is hoped is a thing only a browser says.
//
// Answers the words to add to what Show me announces — which drawer — or
// `false` when the toolbox has no such drawer or block, which is what a
// gated lab's toolbox says about a block not earned yet. The place's own
// words are still said.

interface FlyoutBlock {
  type: string;
  /** Where the block is in its workspace, without what is chained under it. */
  getBoundingRectangleWithoutChildren?: () => unknown;
}

interface Drawer {
  isSelectable?: () => boolean;
  getName?: () => string;
  /** A list of flyout items, or a string for a drawer filled at run time. */
  getContents?: () => unknown;
}

export interface ToolboxHost {
  getToolbox(): {
    getToolboxItems(): Drawer[];
    setSelectedItem(item: Drawer | null): void;
    getFlyout?: () => FlyoutHost | null;
  } | null;
  getFlyout?: () => FlyoutHost | null;
}

interface FlyoutHost {
  getWorkspace(): {
    getTopBlocks(ordered: boolean): FlyoutBlock[];
    /** Blockly's own: scroll a rectangle of this workspace into view. */
    scrollBoundsIntoView?: (bounds: never) => void;
  };
}

/** Whether a drawer's static contents list a block of this type. */
const lists = (drawer: Drawer, type: string): boolean => {
  const contents = drawer.getContents?.();
  return (
    Array.isArray(contents) &&
    contents.some(
      item =>
        typeof item === 'object' &&
        item !== null &&
        (item as {kind?: string}).kind?.toLowerCase() === 'block' &&
        (item as {type?: string}).type === type,
    )
  );
};

export function revealInToolbox(
  workspace: ToolboxHost,
  wanted: {block?: string; drawer?: string},
  focus: (node: unknown) => void,
  /**
   * Run something once Blockly has drawn what it has queued. The flyout has
   * only just been filled when this asks where a block is, and a block not
   * yet laid out is at the origin. In a test, at once.
   */
  afterRender: (act: () => void) => void = act => act(),
): string | false {
  const toolbox = workspace.getToolbox();
  if (!toolbox) {
    return false;
  }
  const drawers = toolbox
    .getToolboxItems()
    .filter(item => item.isSelectable?.() !== false && item.getName);
  const named = wanted.drawer?.toLowerCase();
  const drawer = wanted.block
    ? drawers.find(item => lists(item, wanted.block!))
    : drawers.find(item => item.getName!().toLowerCase() === named);
  if (!drawer) {
    return false;
  }
  toolbox.setSelectedItem(drawer);
  if (!wanted.block) {
    focus(drawer);
    return `It is the ${drawer.getName!()} drawer.`;
  }
  const flyout = workspace.getFlyout?.() ?? toolbox.getFlyout?.() ?? null;
  const block = flyout
    ?.getWorkspace()
    .getTopBlocks(true)
    .find(each => each.type === wanted.block);
  if (block) {
    focus(block);
    // …AND SCROLL THE FLYOUT TO IT, which focusing from here does not do.
    // Blockly scrolls a block into view when it takes focus, but only when
    // focus came from another Blockly node (`BlockSvg.onNodeFocus`): arriving
    // from a link in the instructions, it is skipped, and a block low in a
    // long drawer was focused and out of sight. Seen in the browser, which is
    // the only place it could be. The call is the one Blockly makes itself.
    const flyoutWorkspace = flyout!.getWorkspace();
    afterRender(() => {
      try {
        const bounds = block.getBoundingRectangleWithoutChildren?.();
        if (bounds !== undefined) {
          flyoutWorkspace.scrollBoundsIntoView?.(bounds as never);
        }
      } catch {
        // Later than the caller's own guard can reach. Pointing is a second
        // channel: a flyout that has gone by now costs the scroll, nothing
        // else.
      }
    });
  }
  return `It is in the ${drawer.getName!()} drawer.`;
}

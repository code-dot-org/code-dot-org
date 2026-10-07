// A workspace laid out as sections (specs/LAZY_WORKSPACE_PLAN.md): its top
// blocks in one column, each collapsible to its header, reordered by dragging
// a header, a "+" in every gap to add one, and the file's own definition held
// first.
//
// SHARED by the two editors that show a file's code: the file editor
// (`BlocklyFileEditor`), and the map editor's editor for one actor's or the
// map's own code (`mapEditor/PlacementScriptEditor`). What is here is the
// part of an editor that is about sections; what the file is, how it is saved
// and what else the editor shows stay with each editor.
//
// An editor hands its documents through `prepareFirst` (the one it opens on)
// and `prepare` (every one it loads after), saves through `toFile`, binds
// `onInject` and `handleEvent` to the workspace, calls `layOut` after every
// load, and renders `menu` and, where the sections are showing,
// `outlineButton`.

import {Button, ListSubheader, Menu, MenuItem} from '@mui/material';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

import {
  Blockly,
  type BlocklySerialization,
  type Toolbox,
} from '@code-dot-org/blockly';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {clearAddButtons, drawAddButtons} from './addSectionButtons';
import {syncBodyToggles} from './bodyToggle';
import {eventChoicesIn, type EventChoice} from './eventChoices';
import {
  bodyWithoutVariable,
  collapsedByFile,
  collapseTop,
  COLLAPSE_ABOVE,
  documentSize,
  expandHolding,
  expandTop,
  hasBuiltBody,
  putBody,
  spliceBodies,
  statementInputsOf,
  stripBodies,
  type Document as LazyDocument,
} from './lazyBodies';
import {isPinnedRoot, pinRoots, withoutPins} from './pinnedRoots';
import {sectionsOf, type SectionEntry} from './sectionOutline';
import styles from './sectionWorkspace.module.css';
import {
  arrangeTopBlocks,
  COLUMN_GAP,
  COLUMN_X,
  gapCenters,
  gapIndexFor,
  headerPlaces,
  isFreeFloating,
  orderKeys,
  placesOfDocument,
} from './tidyLayout';
import {
  bindUnbuiltBodies,
  type SerializedBlock,
  type UnbuiltBodies,
} from './workspaceIndex';

/**
 * The add-a-section menu's rows: each event under the drawer it is in.
 *
 * Flat, headings and items side by side, because a menu's children have to
 * be its rows — a fragment around a group is one child to it.
 */
const eventMenuItems = (
  choices: readonly EventChoice[],
  onPick: (type: string) => void,
) => {
  const rows: JSX.Element[] = [];
  let drawer = '';
  for (const choice of choices) {
    if (choice.drawer !== drawer) {
      drawer = choice.drawer;
      rows.push(
        <ListSubheader key={`drawer:${drawer}`}>{drawer}</ListSubheader>,
      );
    }
    rows.push(
      <MenuItem key={choice.type} dense onClick={() => onPick(choice.type)}>
        {choice.label}
      </MenuItem>,
    );
  }
  return rows;
};

/** How far below the view's top edge a section jumped to is put. */
const JUMP_MARGIN = 12;

/** Where the layout put each top block, and which the learner has moved. */
interface LayoutMemory {
  placed: Map<string, number>;
  moved: Set<string>;
}

/**
 * Put every top block where the column layout says, using sizes only the
 * renderer knows (`blockly/tidyLayout`, specs/LAZY_WORKSPACE_PLAN.md).
 *
 * ALWAYS, and after every edit. The workspace is its top blocks in a column,
 * and where a block sits is the layout's to say: a handler dropped between two
 * others is put between them and the rest move down, and a stack that grows
 * pushes down what is below it. Only the ORDER is the learner's, read off
 * where they put things.
 *
 * WITH EVENTS OFF. A `BLOCK_MOVE` is an edit: it dirties the project, rewrites
 * the file and restarts the running world, and it is an undo step. Opening a
 * file is not editing it, and neither is the layout catching up with an edit
 * — so the moves are silent, and the file keeps its positions until the
 * learner's next edit saves the workspace as it stands. The order those
 * positions read in is the order the layout made, so a file reopens as it
 * was left.
 */
const tidyTopBlocks = (
  workspace: Blockly.WorkspaceSvg,
  memory: LayoutMemory,
): void => {
  const tops = workspace.getTopBlocks(false);
  if (tops.length === 0) {
    return;
  }
  const boxes = tops.map(block => {
    const corner = block.getRelativeToSurfaceXY();
    // The block AND the stack under it: a handler is one top block and a dozen
    // rows, and it is the dozen rows that decide where the next one goes.
    const size = block.getHeightWidth();
    return {x: corner.x, y: corner.y, width: size.width, height: size.height};
  });
  // Each block keeps its place; only one the learner moved is placed by where
  // it now is (`tidyLayout.orderKeys`).
  const places = arrangeTopBlocks(
    boxes,
    orderKeys(
      tops.map(block => block.id),
      boxes,
      memory.placed,
      memory.moved,
      new Set(
        tops.filter(block => isPinnedRoot(block.type)).map(block => block.id),
      ),
    ),
  );
  memory.placed = new Map(
    tops.map((block, index) => [block.id, places[index].y]),
  );
  memory.moved.clear();
  if (
    places.every(
      (place, index) =>
        place.x === boxes[index].x && place.y === boxes[index].y,
    )
  ) {
    return;
  }
  Blockly.Events.disable();
  try {
    tops.forEach((block, index) => {
      block.moveBy(
        places[index].x - boxes[index].x,
        places[index].y - boxes[index].y,
      );
    });
  } finally {
    Blockly.Events.enable();
  }
};

export interface SectionWorkspaceOptions {
  /**
   * What the session remembers this workspace's collapsed sections under: a
   * file's id, or whatever names one actor's code in the map editor.
   */
  memoryKey: string;
  /** The palette's block definitions: statement mouths, and hat wording. */
  definitions: ReadonlyArray<object>;
  /**
   * The toolbox the add-a-section menu offers the events of, asked when the
   * menu opens: the file editor's changes with the surface it shows.
   */
  getToolbox: () => Toolbox;
  isReadOnly: boolean;
  workspaceRef: MutableRefObject<Blockly.WorkspaceSvg | null>;
  /**
   * Whether the workspace is showing the file's sections now. The file
   * editor also shows one member's body on the same workspace, which is not
   * a list of sections and gets none of this.
   */
  isShowingSections?: () => boolean;
}

export function useSectionWorkspace({
  memoryKey,
  definitions,
  getToolbox,
  isReadOnly,
  workspaceRef,
  isShowingSections = () => true,
}: SectionWorkspaceOptions) {
  const showingRef = useRef(isShowingSections);
  showingRef.current = isShowingSections;
  const toolboxRef = useRef(getToolbox);
  toolboxRef.current = getToolbox;

  /**
   * Where the layout put each top block, and which the learner has moved
   * since (`tidyLayout.orderKeys`). Seeded from the file as it was saved, and
   * kept across the editor's reloads — a font arriving or the way Back from
   * a body surface reloads the blocks, and the order must not come from
   * positions Blockly has had its hands on in between.
   */
  const layoutMemory = useRef<LayoutMemory>({
    placed: new Map(),
    moved: new Set(),
  });
  /** Remember a document's order, unless every top block in it is known. */
  const rememberOrder = useCallback((document: LazyDocument) => {
    const tops = (document.blocks?.blocks ?? []) as Array<{
      id?: string;
      x?: number;
      y?: number;
    }>;
    const memory = layoutMemory.current;
    if (tops.every(top => top.id && memory.placed.has(top.id))) {
      return;
    }
    memory.placed = placesOfDocument(tops);
    memory.moved.clear();
  }, []);

  // THE BODIES HELD UNBUILT, by top block id (`lazyBodies`). The editor's own
  // store, bound to the workspace as it is injected — before the file is
  // loaded, since loading builds dropdowns that ask the index what the file
  // declares.
  const [bodies] = useState<UnbuiltBodies>(() => new Map());
  /** Bodies of top blocks deleted while collapsed, so undo can return them. */
  const deletedBodies = useRef<UnbuiltBodies>(new Map());
  /** Which inputs of each type are mouths: what a body is, besides `next`. */
  const statementInputs = useMemo(
    () => statementInputsOf(definitions),
    [definitions],
  );
  const rememberCollapsed = useCallback(
    () => collapsedByFile.set(memoryKey, new Set(bodies.keys())),
    [bodies, memoryKey],
  );

  /**
   * The document an editor opens on, as the workspace should show it: as it
   * was left this session, or — not yet opened — collapsed when it is too big
   * to read at once.
   */
  const prepareFirst = useCallback(
    (document: BlocklySerialization): BlocklySerialization => {
      const remembered = collapsedByFile.get(memoryKey);
      const big =
        documentSize(document as unknown as LazyDocument) > COLLAPSE_ABOVE;
      const {document: stripped, bodies: taken} = stripBodies(
        document as unknown as LazyDocument,
        top => (remembered ? remembered.has(top.id ?? '') : big),
        statementInputs,
      );
      taken.forEach((body, id) => bodies.set(id, body));
      rememberOrder(stripped);
      return stripped as unknown as BlocklySerialization;
    },
    [bodies, memoryKey, statementInputs, rememberOrder],
  );

  /**
   * A document as the workspace should show it: the bodies of the top blocks
   * held collapsed taken out, and the store brought up to date with what the
   * document says they hold. A collapsed block whose body the document does
   * not carry — one already taken out — keeps the body the store has.
   */
  const prepare = useCallback(
    (document: BlocklySerialization): BlocklySerialization => {
      const {document: stripped, bodies: taken} = stripBodies(
        document as unknown as LazyDocument,
        top => bodies.has(top.id ?? ''),
        statementInputs,
      );
      taken.forEach((body, id) => bodies.set(id, body));
      // …and nothing held for a top block this document does not have: its
      // body's declarations would otherwise still answer the index.
      const tops = new Set(
        (stripped.blocks?.blocks ?? []).map(top => top.id ?? ''),
      );
      for (const id of [...bodies.keys()]) {
        if (!tops.has(id)) {
          bodies.delete(id);
        }
      }
      rememberOrder(stripped);
      return stripped as unknown as BlocklySerialization;
    },
    [bodies, statementInputs, rememberOrder],
  );

  /**
   * The workspace as the file it is: every collapsed body put back where it
   * was taken from — the file a collapsed workspace writes is the file a
   * built one would — and the pins taken back out.
   */
  const save = useCallback(
    (workspace: Blockly.Workspace): BlocklySerialization =>
      withoutPins(
        spliceBodies(
          Blockly.serialization.workspaces.save(workspace) as LazyDocument,
          bodies,
        ) as never,
      ) as unknown as BlocklySerialization,
    [bodies],
  );

  /** The open add-a-section menu: where it is, and which gap it is for. */
  const [addMenu, setAddMenu] = useState<{
    left: number;
    top: number;
    y: number;
  } | null>(null);
  // ADDING A SECTION: the events the toolbox offers, for the "+" in each gap.
  const eventMenuChoices = useMemo(
    () => (addMenu ? eventChoicesIn(toolboxRef.current(), definitions) : []),
    [addMenu, definitions],
  );
  /** A section just added, to bring into view once it is laid out. */
  const revealAfterLayout = useRef<string | null>(null);
  /**
   * A section jumped to from the list, to bring to the top of the view once
   * it is laid out — its header first, and as much of its body as fits.
   */
  const jumpAfterLayout = useRef<string | null>(null);
  /** The open list of sections: what it lists, and the button it hangs from. */
  const [outline, setOutline] = useState<{
    anchor: HTMLElement;
    entries: SectionEntry[];
  } | null>(null);

  /**
   * Show or hide one top block's body, and remember it for the session.
   * Held in a ref because the toggles are drawn by the layout, which this
   * calls.
   */
  const toggleBodyRef = useRef<(id: string) => void>(() => {});
  /** Top blocks whose copy carries their held body; see `syncToggles`. */
  const copyCarriesBody = useRef(new WeakSet<Blockly.Block>());

  /**
   * Put the show/hide control on every top block with a body.
   *
   * …and make a collapsed block's COPY carry its body. Blockly copies what is
   * built, and a collapsed block's body is not, so a copy of one would paste
   * as a header with nothing under it. The block's own `toCopyData` is wrapped
   * once to put the held body back into what it hands the clipboard.
   */
  const syncToggles = useCallback(
    (workspace: Blockly.WorkspaceSvg): void => {
      if (!showingRef.current()) {
        return;
      }
      const tops = workspace.getTopBlocks(false);
      // The file's own definition stays first and in place (`pinnedRoots`).
      pinRoots(tops);
      syncBodyToggles(
        tops as never,
        id => bodies.has(id),
        id => toggleBodyRef.current(id),
      );
      for (const top of tops) {
        if (copyCarriesBody.current.has(top)) {
          continue;
        }
        copyCarriesBody.current.add(top);
        const own = top.toCopyData.bind(top);
        top.toCopyData = (addNextBlocks?: boolean) => {
          const data = own(addNextBlocks);
          const body = bodies.get(top.id);
          return data && body
            ? {
                ...data,
                blockState: putBody(
                  data.blockState as unknown as SerializedBlock,
                  body,
                ) as unknown as typeof data.blockState,
              }
            : data;
        };
      }
    },
    [bodies],
  );

  /**
   * What follows every layout pass: the "+" in each gap, redrawn where the
   * sections now are, and a section just added brought into view.
   *
   * No "+" where the workspace is not showing sections, nor in a read-only
   * file, nor while a section is being dragged.
   */
  const afterLayout = useCallback(
    (workspace: Blockly.WorkspaceSvg): void => {
      if (!showingRef.current() || isReadOnly || workspace.isDragging()) {
        clearAddButtons(workspace);
      } else {
        const sections = workspace
          .getTopBlocks(false)
          .filter(top => !top.isInsertionMarker())
          .map(top => ({
            y: top.getRelativeToSurfaceXY().y,
            height: top.getHeightWidth().height,
            pinned: isPinnedRoot(top.type),
          }));
        const first = [...sections].sort((a, b) => a.y - b.y)[0];
        drawAddButtons(
          workspace,
          gapCenters(sections, Boolean(first?.pinned)),
          (y, left, top) => setAddMenu({left, top, y}),
        );
      }
      const jumped = jumpAfterLayout.current;
      const target = jumped ? workspace.getBlockById(jumped) : null;
      if (target) {
        jumpAfterLayout.current = null;
        // The header a little below the top edge. `scroll` takes the canvas
        // offset in pixels, which is minus the workspace y at the top of the
        // view times the zoom; it stops at the content's bounds, so the last
        // section comes up only as far as there is room below it.
        const at = target.getRelativeToSurfaceXY();
        workspace.scroll(
          workspace.scrollX,
          -(at.y - JUMP_MARGIN) * workspace.scale,
        );
        Blockly.common.setSelected(target);
      }
      const added = revealAfterLayout.current;
      const block = added ? workspace.getBlockById(added) : null;
      if (block) {
        revealAfterLayout.current = null;
        workspace.scrollBoundsIntoView(
          block.getBoundingRectangleWithoutChildren(),
          48,
        );
      }
    },
    [isReadOnly],
  );

  /** Measure every block, then arrange: after any load. */
  const layOut = useCallback(
    (workspace: Blockly.WorkspaceSvg): void => {
      syncToggles(workspace);
      for (const block of workspace.getAllBlocks(false)) {
        block.queueRender();
      }
      // …and only once they have all reported their size is there anything to
      // arrange, which is why the tidy hangs off the promise rather than
      // following the loop. Asking a block how tall it is before it has
      // rendered is what this function exists to work around.
      void Blockly.renderManagement.finishQueuedRenders().then(() => {
        tidyTopBlocks(workspace, layoutMemory.current);
        afterLayout(workspace);
      });
    },
    [syncToggles, afterLayout],
  );
  /** The current `layOut`, for a listener installed only once. */
  const layOutRef = useRef(layOut);
  layOutRef.current = layOut;

  /**
   * Lay the top blocks out again once what is waiting to render has.
   *
   * Not mid-drag: the dragged block is wherever the pointer is, and the rest
   * stay put until it lands. And once per frame however many events an edit
   * fires — a paste is dozens.
   */
  const reflowPending = useRef(false);
  const reflow = useCallback(
    (workspace: Blockly.WorkspaceSvg): void => {
      if (reflowPending.current || workspace.isDragging()) {
        return;
      }
      reflowPending.current = true;
      syncToggles(workspace);
      void Blockly.renderManagement.finishQueuedRenders().then(() => {
        reflowPending.current = false;
        if (!workspace.isDragging()) {
          tidyTopBlocks(workspace, layoutMemory.current);
          afterLayout(workspace);
        }
      });
    },
    [syncToggles, afterLayout],
  );

  toggleBodyRef.current = (id: string) => {
    const workspace = workspaceRef.current;
    const top = workspace?.getBlockById(id);
    if (!workspace || !top) {
      return;
    }
    if (bodies.has(id)) {
      expandTop(workspace, top);
    } else {
      collapseTop(workspace, top);
    }
    rememberCollapsed();
    layOut(workspace);
  };

  /** Open the section `id` and bring its header to the top of the view. */
  const jumpTo = useCallback(
    (id: string) => {
      setOutline(null);
      const workspace = workspaceRef.current;
      const top = workspace?.getBlockById(id);
      if (!workspace || !top) {
        return;
      }
      if (bodies.has(id)) {
        expandTop(workspace, top);
        rememberCollapsed();
      }
      jumpAfterLayout.current = id;
      layOut(workspace);
    },
    [bodies, layOut, rememberCollapsed, workspaceRef],
  );

  /** Open the list of sections, read off the workspace as it is now. */
  const openOutline = useCallback(
    (anchor: HTMLElement) => {
      const workspace = workspaceRef.current;
      if (!workspace) {
        return;
      }
      const placed = layoutMemory.current.placed;
      setOutline({
        anchor,
        // The column's order: the definition first, then where the layout
        // put each.
        entries: sectionsOf(workspace, block =>
          isPinnedRoot(block.type)
            ? -Infinity
            : (placed.get(block.id) ?? block.getRelativeToSurfaceXY().y),
        ),
      });
    },
    [workspaceRef],
  );

  /**
   * What injecting the workspace does, before the file is loaded into it:
   * bind the store of unbuilt bodies, and teach undo about them.
   *
   * UNDO EXPANDS WHAT IT IS ABOUT TO CHANGE. A change to a row inside a body
   * that has since been collapsed names a block that is not built, and Blockly
   * passes over an event whose block it cannot find — the undo would do
   * nothing, silently. So the group about to be undone is looked at first and
   * any collapsed body holding one of its blocks is built, which also shows
   * the learner where the change happened.
   */
  const onInject = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      bindUnbuiltBodies(workspace, bodies);
      const undo = workspace.undo.bind(workspace);
      workspace.undo = (redo?: boolean) => {
        const stack = redo
          ? workspace.getRedoStack()
          : workspace.getUndoStack();
        const last = stack[stack.length - 1];
        const group = last?.group
          ? stack.filter(event => event.group === last.group)
          : last
            ? [last]
            : [];
        const ids = new Set(
          group
            .map(event => (event as {blockId?: string}).blockId)
            .filter((id): id is string => Boolean(id)),
        );
        if (ids.size && expandHolding(workspace, bodies, ids)) {
          rememberCollapsed();
        }
        undo(redo);
      };
    },
    [bodies, rememberCollapsed],
  );

  /**
   * A top block being dragged to a new place among the others
   * (specs/LAZY_WORKSPACE_PLAN.md, "Reordering").
   *
   * While it is dragged every section is collapsed to its header — the
   * dragged one too — so the file is a short list and the choice is between
   * two headers. A gap opens where letting go would put it. On letting go the
   * order is the one shown, the sections that were open are built again, and
   * the view goes to the one that moved.
   */
  const reorderRef = useRef<{
    id: string;
    /** The sections that were open when the drag began. */
    expanded: string[];
    /** The other top blocks, in their order. */
    others: string[];
    /** The gap it is over, among `others`. */
    gap: number;
    /** How far the column is shifted to stay beside the dragged header. */
    offset: number | null;
    frame: number;
    /** How many headers at the top nothing may go above. */
    pinned: number;
  } | null>(null);
  /** The top block just dropped, whose own move is the drop and not a move. */
  const droppedRef = useRef<string | null>(null);
  /**
   * Sections deleted by being dragged off while open: undoing the delete
   * brings one back open, as it was picked up, not collapsed as the drag
   * left it.
   */
  const reopenOnRestore = useRef(new Set<string>());

  const reorderStart = useCallback(
    (workspace: Blockly.WorkspaceSvg, dragged: Blockly.BlockSvg) => {
      const tops = workspace
        .getTopBlocks(false)
        .filter(top => !top.isInsertionMarker());
      const placed = layoutMemory.current.placed;
      const placeOf = (block: Blockly.BlockSvg) =>
        placed.get(block.id) ?? block.getRelativeToSurfaceXY().y;
      clearAddButtons(workspace);
      const expanded = tops.filter(top => hasBuiltBody(top)).map(top => top.id);
      for (const top of tops) {
        if (hasBuiltBody(top)) {
          collapseTop(workspace, top);
        }
      }
      const others = tops
        .filter(top => top.id !== dragged.id)
        .sort(
          (a, b) =>
            Number(isPinnedRoot(b.type)) - Number(isPinnedRoot(a.type)) ||
            placeOf(a) - placeOf(b),
        );
      const startIndex = others.filter(
        top => placeOf(top) < placeOf(dragged),
      ).length;
      const held = {
        id: dragged.id,
        expanded,
        others: others.map(top => top.id),
        gap: startIndex,
        offset: null as number | null,
        frame: 0,
        pinned: others.filter(top => isPinnedRoot(top.type)).length,
      };
      reorderRef.current = held;
      const step = () => {
        if (reorderRef.current !== held) {
          return;
        }
        const block = workspace.getBlockById(held.id);
        const headers = held.others
          .map(id => workspace.getBlockById(id))
          .filter((one): one is Blockly.BlockSvg => Boolean(one));
        if (block && headers.length === held.others.length) {
          const heights = headers.map(one => one.getHeightWidth().height);
          const draggedHeight = block.getHeightWidth().height;
          const at = block.getRelativeToSurfaceXY();
          // The column is shifted so that it opens around the dragged header
          // where it was picked up: a section dragged from far down a long
          // file still has its neighbours in view, not scrolled off above.
          if (held.offset === null) {
            const places = headerPlaces(heights, held.gap, draggedHeight);
            const gapY =
              held.gap < places.length
                ? places[held.gap] - draggedHeight - COLUMN_GAP
                : (places.at(-1) ?? 0) + (heights.at(-1) ?? 0) + COLUMN_GAP;
            held.offset = at.y - gapY;
            held.gap = -1;
          }
          const resting = headerPlaces(heights, -1, 0).map((y, index) => ({
            y: y + held.offset!,
            height: heights[index],
          }));
          // Never above the file's own definition, which stays first.
          const gap = Math.max(
            held.pinned,
            gapIndexFor(resting, {y: at.y, height: draggedHeight}),
          );
          if (gap !== held.gap) {
            held.gap = gap;
            const places = headerPlaces(heights, gap, draggedHeight);
            Blockly.Events.disable();
            try {
              headers.forEach((header, index) => {
                const now = header.getRelativeToSurfaceXY();
                header.moveBy(
                  COLUMN_X - now.x,
                  places[index] + held.offset! - now.y,
                );
              });
            } finally {
              Blockly.Events.enable();
            }
          }
        }
        held.frame = requestAnimationFrame(step);
      };
      // Once the headers have been drawn at their collapsed size.
      void Blockly.renderManagement.finishQueuedRenders().then(() => {
        if (reorderRef.current === held) {
          held.frame = requestAnimationFrame(step);
        }
      });
    },
    [],
  );

  const reorderEnd = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      const held = reorderRef.current;
      if (!held) {
        return;
      }
      reorderRef.current = null;
      cancelAnimationFrame(held.frame);
      // Dropped on the toolbox or the bin, it is gone; the rest close up.
      const block = workspace.getBlockById(held.id);
      if (!block && held.expanded.includes(held.id)) {
        reopenOnRestore.current.add(held.id);
      }
      const order = [...held.others];
      if (block) {
        order.splice(
          held.gap < 0
            ? order.length
            : Math.min(Math.max(held.gap, held.pinned), order.length),
          0,
          held.id,
        );
      }
      layoutMemory.current.placed = new Map(
        order.map((id, rank) => [id, rank]),
      );
      layoutMemory.current.moved.clear();
      droppedRef.current = held.id;
      for (const id of held.expanded) {
        const top = workspace.getBlockById(id);
        if (top) {
          expandTop(workspace, top);
        }
      }
      rememberCollapsed();
      syncToggles(workspace);
      void Blockly.renderManagement.finishQueuedRenders().then(() => {
        tidyTopBlocks(workspace, layoutMemory.current);
        droppedRef.current = null;
        // …and the view goes to the section that moved, its header in sight.
        if (block && !block.isDisposed()) {
          const bounds = block.getBoundingRectangleWithoutChildren();
          workspace.scrollBoundsIntoView(bounds, 48);
        }
        afterLayout(workspace);
      });
    },
    [rememberCollapsed, syncToggles, afterLayout],
  );

  /**
   * Add a section starting with `type`, in the gap at `y`.
   *
   * An edit like dragging one out of a drawer — one undo step — placed at the
   * gap so the layout files it there: a top block it has not placed yet goes
   * where it is (`tidyLayout.orderKeys`). Then brought into view.
   */
  const addSection = useCallback(
    (type: string, y: number) => {
      const workspace = workspaceRef.current;
      setAddMenu(null);
      if (!workspace) {
        return;
      }
      Blockly.Events.setGroup(true);
      try {
        const block = Blockly.serialization.blocks.append(
          {type, x: COLUMN_X, y} as never,
          workspace,
        );
        revealAfterLayout.current = block.id;
      } finally {
        Blockly.Events.setGroup(false);
      }
    },
    [workspaceRef],
  );

  /**
   * What the sections make of one workspace event, once the file is loaded:
   * the store follows its top blocks, the layout follows the learner's moves,
   * a header picked up starts a reorder, a block let go of on its own goes.
   */
  const handleEvent = useCallback(
    (event: Blockly.Events.Abstract, workspace: Blockly.WorkspaceSvg) => {
      // THE STORE OF UNBUILT BODIES FOLLOWS ITS TOP BLOCKS (`lazyBodies`).
      // A collapsed top block deleted takes its body with it — kept aside, so
      // undoing the delete brings the body back too; a variable deleted takes
      // its uses out of every held body, as Blockly takes them out of the
      // built ones.
      if (event.type === Blockly.Events.BLOCK_DELETE) {
        const id = (event as Blockly.Events.BlockDelete).blockId ?? '';
        const body = bodies.get(id);
        if (body) {
          deletedBodies.current.set(id, body);
          bodies.delete(id);
        }
      } else if (event.type === Blockly.Events.BLOCK_CREATE) {
        const id = (event as Blockly.Events.BlockCreate).blockId ?? '';
        const body = deletedBodies.current.get(id);
        if (body) {
          bodies.set(id, body);
          deletedBodies.current.delete(id);
          const top = workspace.getBlockById(id);
          if (reopenOnRestore.current.delete(id) && top) {
            expandTop(workspace, top);
            rememberCollapsed();
          }
        }
      } else if (event.type === Blockly.Events.VAR_DELETE) {
        const varId = (event as Blockly.Events.VarDelete).varId ?? '';
        for (const [id, body] of [...bodies]) {
          bodies.set(id, bodyWithoutVariable(body, varId));
        }
      }
      // A TOP BLOCK THE LEARNER MOVED is placed by where it now is; every
      // other keeps its place. A drag, a paste, an undo — but not Blockly's
      // own nudge apart of blocks that overlap, which says nothing about the
      // order the learner wants (`tidyLayout.orderKeys`).
      if (event.type === Blockly.Events.BLOCK_MOVE) {
        const move = event as Blockly.Events.BlockMove;
        if (
          !move.newParentId &&
          !(move.reason ?? []).includes('bump') &&
          // The drop of a reorder is placed by the gap it was shown in.
          move.blockId !== droppedRef.current &&
          move.blockId !== reorderRef.current?.id
        ) {
          layoutMemory.current.moved.add(move.blockId ?? '');
        }
      }
      // REORDERING: a top block picked up collapses every section to its
      // header and parts them where it would land (`reorderStart`).
      if (
        event.type === Blockly.Events.BLOCK_DRAG &&
        (event as Blockly.Events.BlockDrag).isStart &&
        showingRef.current()
      ) {
        const picked = workspace.getBlockById(
          (event as Blockly.Events.BlockDrag).blockId ?? '',
        );
        if (picked && !picked.getParent() && !isFreeFloating(picked)) {
          reorderStart(workspace, picked);
        }
      }
      // NO FREE-FLOATING BLOCKS (specs/LAZY_WORKSPACE_PLAN.md). A block that
      // ends a drag on its own, attached to nothing, means nothing — the
      // generator skips it and the orphan plugin disables it — so it goes, as
      // one dropped on the toolbox does. In the drag's own event group, so a
      // single undo puts it back where it was taken from.
      if (
        event.type === Blockly.Events.BLOCK_DRAG &&
        !(event as Blockly.Events.BlockDrag).isStart
      ) {
        const dropped = workspace.getBlockById(
          (event as Blockly.Events.BlockDrag).blockId ?? '',
        );
        if (dropped && !dropped.getParent() && isFreeFloating(dropped)) {
          Blockly.Events.setGroup(event.group || true);
          try {
            dropped.dispose(true);
          } finally {
            Blockly.Events.setGroup(false);
          }
        }
        if (reorderRef.current) {
          reorderEnd(workspace);
        } else {
          reflow(workspace);
        }
      } else if (!event.isUiEvent) {
        // …and the layout catches up with whatever the edit did to a stack's
        // size or to the order of the top blocks.
        reflow(workspace);
      }
    },
    [bodies, rememberCollapsed, reorderStart, reorderEnd, reflow],
  );

  const menu = (
    <Menu
      open={addMenu !== null}
      onClose={() => setAddMenu(null)}
      anchorReference="anchorPosition"
      anchorPosition={
        addMenu ? {top: addMenu.top, left: addMenu.left} : undefined
      }
      slotProps={{paper: {style: {maxHeight: 420}}}}
    >
      {eventMenuChoices.length === 0 ? (
        <MenuItem dense disabled>
          No events to handle here
        </MenuItem>
      ) : (
        eventMenuItems(eventMenuChoices, type =>
          addSection(type, addMenu?.y ?? 0),
        )
      )}
    </Menu>
  );

  // JUMPING TO A SECTION (specs/LAZY_WORKSPACE_PLAN.md): a button over the
  // workspace's top right corner, listing the sections top to bottom.
  // Picking one opens it and brings it to the top of the view. Offered in a
  // read-only file too, where finding one's way is all there is to do.
  const outlineButton = (
    <>
      <Button
        className={styles.outlineButton}
        variant="outlined"
        color="secondary"
        size="extraSmall"
        startIcon={<FontAwesomeV6Icon iconName="list" iconStyle="solid" />}
        aria-haspopup="menu"
        aria-expanded={outline !== null}
        onClick={event => openOutline(event.currentTarget)}
      >
        Jump to…
      </Button>
      <Menu
        open={outline !== null}
        anchorEl={outline?.anchor}
        onClose={() => setOutline(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{paper: {style: {maxHeight: 420}}}}
      >
        {outline?.entries.length ? (
          outline.entries.map(entry => (
            <MenuItem key={entry.id} dense onClick={() => jumpTo(entry.id)}>
              {entry.label}
            </MenuItem>
          ))
        ) : (
          <MenuItem dense disabled>
            Nothing here yet
          </MenuItem>
        )}
      </Menu>
    </>
  );

  return {
    bodies,
    outlineButton,
    prepareFirst,
    prepare,
    save,
    onInject,
    handleEvent,
    layOut,
    layOutRef,
    menu,
  };
}

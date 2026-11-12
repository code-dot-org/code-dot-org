// The blocks a level adds to its pinned scene (add_blocks): when they are
// added, the outlines that hint at what to put under them, and the lock
// that keeps them from being deleted.

import * as BlocklyCore from 'blockly/core';
import {MutableRefObject, useCallback, useEffect, useMemo, useRef} from 'react';

import {
  addMissingBlocks,
  AddBlockEntry,
  BlockCheck,
  OUTLINE_EVENT_GROUP,
  syncOutlines,
} from '../addBlocks';
import {lockAddedBlocks} from '../blockLocks';
import {objectiveChecks, Objectives} from '../objectives';
import {clearRoom} from '../stackRoom';

const NO_ENTRIES: AddBlockEntry[] = [];

/**
 * Whether an event can change which blocks a stack holds: a block made,
 * deleted or changed, or a block joined to or taken from another. A block
 * that only moves about the workspace keeps its place in its stack.
 */
function changesAStack(event: BlocklyCore.Events.Abstract): boolean {
  switch (event.type) {
    case Blockly.Events.BLOCK_CREATE:
    case Blockly.Events.BLOCK_DELETE:
    case Blockly.Events.BLOCK_CHANGE:
      return true;
    case Blockly.Events.BLOCK_MOVE: {
      const move = event as BlocklyCore.Events.BlockMove;
      return (
        move.oldParentId !== move.newParentId ||
        move.oldInputName !== move.newInputName
      );
    }
    default:
      return false;
  }
}

/** A Start Over that leaves for the first level: the level being left, and
    the count of sources resets before the one Start Over makes. */
interface LeavingReset {
  level: number;
  reinitBefore: number;
}

interface LevelBlocksOptions {
  /** The workspace holds a student's program and the project's images are
      in. Nothing is added before that. */
  ready: boolean;
  /** A levelbuilder is editing the level, and can delete anything. */
  editing: boolean;
  levelId: number;
  /** The level's add_blocks entries. They belong to its pinned scene. */
  addBlocks: AddBlockEntry[] | undefined;
  pinnedSceneId: string | undefined;
  /** The scene open in the editor. */
  activeSceneId: string;
  objectives: Objectives | undefined;
  /** Goes up each time the project's sources are replaced whole. */
  sourcesReinitializedCount: number;
  /** Goes up each time the workspace is created again. */
  workspaceVersion: number;
}

interface LevelBlocks {
  /** Adds the level's blocks, draws its outlines and locks what it added,
      once for each level, load, sources reset and workspace. The owner
      calls it after loading a scene's code, and again whenever it changes,
      from an effect placed after the one that loads. A level reached
      without a page load loads nothing, so that second call is what runs
      the pass on arrival. */
  addLevelBlocks: () => void;
  /** Counts loads of a scene's code into the workspace. The owner adds one
      for each load, before calling addLevelBlocks. */
  sceneLoadsRef: MutableRefObject<number>;
  /** The owner sets this when Start Over leaves for the first level. The
      pass then skips the reset Start Over makes, or the fresh project
      would open with this level's blocks in it. A level change clears it,
      used or not. */
  leavingResetRef: MutableRefObject<LeavingReset | undefined>;
}

export default function useLevelBlocks({
  ready,
  editing,
  levelId,
  addBlocks,
  pinnedSceneId,
  activeSceneId,
  objectives,
  sourcesReinitializedCount,
  workspaceVersion,
}: LevelBlocksOptions): LevelBlocks {
  const sceneLoadsRef = useRef(0);
  // The key of the last pass (see addLevelBlocks).
  const addedBlocksForRef = useRef('');
  // The key of the pass that was skipped for a Start Over reset. Until
  // another pass runs, the outlines are left alone too.
  const skippedPassRef = useRef<string | null>(null);
  const leavingResetRef = useRef<LeavingReset>();
  useEffect(() => {
    leavingResetRef.current = undefined;
    // The add-blocks pass drops them too, except on the Start Over reset it
    // sits out.
    const workspace = Blockly.getMainWorkspace?.() as
      | BlocklyCore.WorkspaceSvg
      | undefined;
    if (workspace) {
      clearRoom(workspace);
    }
  }, [levelId]);

  const entries = useMemo(
    () =>
      activeSceneId === pinnedSceneId ? addBlocks ?? NO_ENTRIES : NO_ENTRIES,
    [addBlocks, pinnedSceneId, activeSceneId]
  );
  // The level's checklist checks for blocks in the open scene. They say
  // which blocks fill an outline (see fillers).
  const blockChecks = useMemo(
    () =>
      objectiveChecks(objectives).filter(
        (check): check is BlockCheck =>
          check.kind === 'block' &&
          (check.scene === undefined || check.scene === activeSceneId)
      ),
    [objectives, activeSceneId]
  );

  // The level's added blocks join the pinned scene once it is on screen. A
  // load puts the view back wherever the workspace was, so a load runs the
  // pass and brings the level's outline back on screen. It runs with no
  // entries as well, to remove other levels' outlines.
  const addLevelBlocks = useCallback(() => {
    if (!ready) {
      return;
    }
    const key = [
      levelId,
      sourcesReinitializedCount,
      workspaceVersion,
      sceneLoadsRef.current,
    ].join(':');
    if (addedBlocksForRef.current === key) {
      return;
    }
    addedBlocksForRef.current = key;
    const leavingReset = leavingResetRef.current;
    if (
      leavingReset &&
      leavingReset.level === levelId &&
      sourcesReinitializedCount > leavingReset.reinitBefore
    ) {
      leavingResetRef.current = undefined;
      skippedPassRef.current = key;
      return;
    }
    const workspace = Blockly.getMainWorkspace() as BlocklyCore.WorkspaceSvg;
    // Adding waits for the workspace to settle. If another pass has started
    // meanwhile, these entries may not be the workspace's.
    const stillWanted = () => addedBlocksForRef.current === key;
    addMissingBlocks(workspace, entries, blockChecks, stillWanted)
      .then(() => {
        if (!editing && stillWanted()) {
          lockAddedBlocks(workspace, entries);
        }
      })
      // The level must still open when its blocks cannot be added.
      .catch(e => console.warn('add_blocks pass failed:', e));
  }, [
    ready,
    editing,
    levelId,
    entries,
    blockChecks,
    sourcesReinitializedCount,
    workspaceVersion,
  ]);
  // The outlines follow the blocks. After the student moves, adds, deletes
  // or changes a block, the outlines are brought in line again: an outline
  // goes when its block is dropped in, and comes back if the block is
  // taken out, disabled, or given a field value the step does not accept.
  useEffect(() => {
    if (!ready) {
      return;
    }
    const workspace = Blockly.getMainWorkspace?.() as
      | BlocklyCore.WorkspaceSvg
      | undefined;
    if (!workspace) {
      return;
    }
    const onChange = (event: BlocklyCore.Events.Abstract) => {
      if (event.group === OUTLINE_EVENT_GROUP || !changesAStack(event)) {
        return;
      }
      // Blockly delivers an event after the action that caused it has
      // finished, so the blocks are settled by now. The one exception is a
      // drag: a block pulled out of the toolbox is created as the drag
      // starts, and the drop sends a move of its own when it ends.
      //
      // The reset that Start Over makes on its way to the first level is
      // also left alone: that project must stay as the reset made it.
      if (
        workspace.isDragging() ||
        leavingResetRef.current ||
        skippedPassRef.current === addedBlocksForRef.current
      ) {
        return;
      }
      try {
        syncOutlines(workspace, entries, blockChecks);
      } catch (e) {
        console.warn('add_blocks outlines not drawn:', e);
      }
    };
    workspace.addChangeListener(onChange);
    return () => workspace.removeChangeListener(onChange);
  }, [ready, entries, blockChecks, workspaceVersion]);

  return {addLevelBlocks, sceneLoadsRef, leavingResetRef};
}

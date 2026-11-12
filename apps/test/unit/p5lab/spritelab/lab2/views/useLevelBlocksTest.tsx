import {act, render} from '@testing-library/react';
import React, {useEffect} from 'react';

import useLevelBlocks from '@cdo/apps/p5lab/spritelab/lab2/views/useLevelBlocks';

const addMissingBlocks = jest.fn((..._args: unknown[]) => Promise.resolve(0));
const syncOutlines = jest.fn();
const lockAddedBlocks = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/addBlocks', () => ({
  OUTLINE_EVENT_GROUP: 'outlines',
  addMissingBlocks: (...args: unknown[]) => addMissingBlocks(...args),
  syncOutlines: (...args: unknown[]) => syncOutlines(...args),
}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockLocks', () => ({
  lockAddedBlocks: (...args: unknown[]) => lockAddedBlocks(...args),
}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/stackRoom', () => ({
  clearRoom: jest.fn(),
}));

type Listener = (event: {type: string; group?: string}) => void;
let listeners: Listener[] = [];
const workspace = {
  addChangeListener: (listener: Listener) => listeners.push(listener),
  removeChangeListener: (listener: Listener) =>
    (listeners = listeners.filter(l => l !== listener)),
  isDragging: () => false,
};

const ENTRIES = [{type: 'gamelab_checkTouching', data: 'treasure-touch'}];
const options = (sourcesReinitializedCount = 0) => ({
  ready: true,
  editing: false,
  levelId: 7,
  addBlocks: ENTRIES,
  pinnedSceneId: 'scene-1',
  activeSceneId: 'scene-1',
  objectives: undefined,
  sourcesReinitializedCount,
  workspaceVersion: 0,
});

/** Renders the hook and hands back its latest result. */
function renderLevelBlocks(initialReinit = 0) {
  const latest: {tools?: ReturnType<typeof useLevelBlocks>} = {};
  const Harness = ({reinit}: {reinit: number}) => {
    const tools = useLevelBlocks(options(reinit));
    useEffect(() => {
      latest.tools = tools;
    });
    return null;
  };
  const view = render(<Harness reinit={initialReinit} />);
  return {
    result: {
      get current() {
        return latest.tools!;
      },
    },
    rerender: ({reinit}: {reinit: number}) =>
      view.rerender(<Harness reinit={reinit} />),
  };
}

/** A block edit, and the pass that follows it once the workspace settles. */
function editBlock(group?: string) {
  act(() => {
    listeners.forEach(listener => listener({type: 'move', group}));
    jest.runAllTimers();
  });
}

describe('useLevelBlocks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    listeners = [];
    addMissingBlocks.mockClear();
    syncOutlines.mockClear();
    lockAddedBlocks.mockClear();
    (globalThis as unknown as {Blockly: unknown}).Blockly = {
      getMainWorkspace: () => workspace,
      Events: {
        BLOCK_MOVE: 'move',
        BLOCK_CREATE: 'create',
        BLOCK_DELETE: 'delete',
        BLOCK_CHANGE: 'change',
      },
    };
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('leaves the pass to its owner, and runs it once for each load', async () => {
    const {result} = renderLevelBlocks();
    expect(addMissingBlocks).not.toHaveBeenCalled();
    await act(async () => {
      result.current.sceneLoadsRef.current++;
      result.current.addLevelBlocks();
      result.current.addLevelBlocks();
    });
    expect(addMissingBlocks).toHaveBeenCalledTimes(1);
    expect(lockAddedBlocks).toHaveBeenCalledWith(workspace, ENTRIES);
    await act(async () => {
      result.current.sceneLoadsRef.current++;
      result.current.addLevelBlocks();
    });
    expect(addMissingBlocks).toHaveBeenCalledTimes(2);
  });

  it('adds nothing and draws no outline on the reset Start Over makes when leaving', async () => {
    const {result, rerender} = renderLevelBlocks(0);
    // Start Over leaves for the first level, then resets the project.
    result.current.leavingResetRef.current = {level: 7, reinitBefore: 0};
    rerender({reinit: 1});
    await act(async () => {
      result.current.sceneLoadsRef.current++;
      result.current.addLevelBlocks();
    });
    expect(addMissingBlocks).not.toHaveBeenCalled();
    // The reset's own block events must not bring the outlines back.
    editBlock();
    expect(syncOutlines).not.toHaveBeenCalled();
    // A later load on the same level is an ordinary one.
    await act(async () => {
      result.current.sceneLoadsRef.current++;
      result.current.addLevelBlocks();
    });
    expect(addMissingBlocks).toHaveBeenCalledTimes(1);
    editBlock();
    expect(syncOutlines).toHaveBeenCalledTimes(1);
  });

  it('brings the outlines in line after a block edit, but not after its own changes', async () => {
    const {result} = renderLevelBlocks();
    await act(async () => {
      result.current.sceneLoadsRef.current++;
      result.current.addLevelBlocks();
    });
    editBlock();
    expect(syncOutlines).toHaveBeenCalledTimes(1);
    editBlock('outlines');
    expect(syncOutlines).toHaveBeenCalledTimes(1);
  });

  it('does not lock what a pass added once another pass has started', async () => {
    let finish: (added: number) => void = () => {};
    addMissingBlocks.mockImplementationOnce(
      () => new Promise<number>(resolve => (finish = resolve))
    );
    const {result} = renderLevelBlocks();
    act(() => {
      result.current.sceneLoadsRef.current++;
      result.current.addLevelBlocks();
    });
    // Another scene loads while the first pass is still waiting.
    await act(async () => {
      result.current.sceneLoadsRef.current++;
      result.current.addLevelBlocks();
    });
    lockAddedBlocks.mockClear();
    await act(async () => {
      finish(1);
    });
    expect(lockAddedBlocks).not.toHaveBeenCalled();
  });
});

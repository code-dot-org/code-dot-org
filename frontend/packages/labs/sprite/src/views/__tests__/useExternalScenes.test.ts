import {act, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {SpriteLabEngine} from '../../engine';
import {
  type ExternalProject,
  fetchExternalProject,
  fetchSectionScenes,
} from '../../scenesApi';
import type {Scene} from '../../types';
import {useExternalSceneList, useExternalSceneRuns} from '../useExternalScenes';

// A store holding what the hooks read and write.
const state = {
  animationList: {orderedKeys: [] as string[], propsByKey: {} as object},
  spriteLab2: {scenes: [] as object[], externalScenes: [] as object[]},
};
const dispatched: {type: string; payload: unknown}[] = [];
function dispatch(action: {type: string; payload: never}) {
  dispatched.push(action);
  if (action.type.endsWith('setAnimationList')) {
    state.animationList = action.payload;
  } else if (action.type.endsWith('setScenes')) {
    state.spriteLab2.scenes = action.payload;
  } else if (action.type.endsWith('setExternalScenes')) {
    state.spriteLab2.externalScenes = action.payload;
  }
}
vi.mock('../../redux/store', () => ({
  default: {getState: () => state},
  useAppDispatch: () => dispatch,
}));

let refreshHandler: (() => Promise<void>) | null = null;
vi.mock('../../blockly/externalSceneDropdown', () => ({
  setExternalSceneRefreshHandler: (handler: typeof refreshHandler) => {
    refreshHandler = handler;
  },
}));

vi.mock('../../scenesApi', async importOriginal => ({
  ...(await importOriginal<object>()),
  fetchSectionScenes: vi.fn(),
  fetchExternalProject: vi.fn(),
}));
const sectionScenes = vi.mocked(fetchSectionScenes);
const externalProject = vi.mocked(fetchExternalProject);

const REF = {
  channel: 'chan1',
  sceneId: 's1',
  sceneName: 'Forest',
  ownerName: 'Ada',
};
const OPTION = {key: 'chan1:s1', label: 'Forest — Ada · #chan1'};

// A scene whose saved blocks jump to the external scene `key`.
function sceneJumpingTo(key: string): Scene {
  return {
    id: 'mine',
    name: 'Mine',
    source: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'spritelab2_goToExternalScene',
            fields: {SCENE: key},
          },
        ],
      },
    },
  } as Scene;
}
const PLAIN_SCENE = {id: 'mine', name: 'Mine'} as Scene;

beforeEach(() => {
  dispatched.length = 0;
  state.animationList = {orderedKeys: ['a'], propsByKey: {a: {name: 'ours'}}};
  state.spriteLab2 = {scenes: [], externalScenes: []};
  refreshHandler = null;
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

function externalOptions() {
  return dispatched
    .filter(a => a.type.endsWith('setExternalScenes'))
    .map(a => a.payload);
}

describe('useExternalSceneList', () => {
  it('is ready at once when no saved block names an external scene', async () => {
    sectionScenes.mockResolvedValue([REF]);
    const {result} = renderHook(() =>
      useExternalSceneList({levelId: 7, scriptId: 3, scenes: [PLAIN_SCENE]}),
    );
    expect(result.current).toBe(true);
    await waitFor(() => expect(externalOptions()).toEqual([[OPTION]]));
    expect(sectionScenes).toHaveBeenCalledWith(7, 3);
  });

  it('waits for the list when a saved block names an external scene, keeping a vanished one', async () => {
    let answer: (refs: (typeof REF)[]) => void = () => {};
    sectionScenes.mockReturnValue(new Promise(resolve => (answer = resolve)));
    const {result} = renderHook(() =>
      useExternalSceneList({
        levelId: 7,
        scriptId: 3,
        scenes: [sceneJumpingTo('gone:s9')],
      }),
    );
    expect(result.current).toBe(false);
    await act(async () => answer([REF]));
    expect(result.current).toBe(true);
    expect(externalOptions()).toEqual([
      [OPTION, {key: 'gone:s9', label: '(unavailable) #gone:s9'}],
    ]);
  });

  it('gives up on a slow list, keeping the saved keys', async () => {
    vi.useFakeTimers();
    sectionScenes.mockReturnValue(new Promise(() => {}));
    const {result} = renderHook(() =>
      useExternalSceneList({
        levelId: 7,
        scriptId: 3,
        scenes: [sceneJumpingTo('chan1:s1')],
      }),
    );
    await act(async () => vi.advanceTimersByTimeAsync(5000));
    expect(result.current).toBe(true);
    expect(externalOptions()).toEqual([
      [{key: 'chan1:s1', label: '(unavailable) #chan1:s1'}],
    ]);
  });

  it('treats a failed list as empty', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    sectionScenes.mockRejectedValue(new Error('403'));
    const {result} = renderHook(() =>
      useExternalSceneList({
        levelId: 7,
        scriptId: 3,
        scenes: [sceneJumpingTo('chan1:s1')],
      }),
    );
    await waitFor(() => expect(result.current).toBe(true));
    expect(externalOptions()).toEqual([
      [{key: 'chan1:s1', label: '(unavailable) #chan1:s1'}],
    ]);
  });

  it('keeps the first fetch through edits to the scenes', async () => {
    let answer: (refs: (typeof REF)[]) => void = () => {};
    sectionScenes.mockReturnValue(new Promise(resolve => (answer = resolve)));
    const {rerender} = renderHook(
      ({scenes}) => useExternalSceneList({levelId: 7, scriptId: 3, scenes}),
      {initialProps: {scenes: [PLAIN_SCENE]}},
    );
    rerender({scenes: [{...PLAIN_SCENE, name: 'Renamed'}]});
    await act(async () => answer([REF]));
    expect(sectionScenes).toHaveBeenCalledTimes(1);
    expect(externalOptions()).toEqual([[OPTION]]);
  });

  it('asks again each time the dropdown opens, until unmounted', async () => {
    sectionScenes.mockResolvedValue([]);
    const {rerender, unmount} = renderHook(
      ({scenes}) => useExternalSceneList({levelId: 7, scriptId: 3, scenes}),
      {initialProps: {scenes: [PLAIN_SCENE]}},
    );
    await waitFor(() => expect(externalOptions()).toEqual([[]]));
    rerender({scenes: [sceneJumpingTo('gone:s9')]});
    sectionScenes.mockResolvedValue([REF]);
    await act(async () => refreshHandler?.());
    expect(externalOptions().at(-1)).toEqual([
      OPTION,
      {key: 'gone:s9', label: '(unavailable) #gone:s9'},
    ]);
    unmount();
    expect(refreshHandler).toBeNull();
  });
});

describe('useExternalSceneRuns', () => {
  const PROJECT: ExternalProject = {
    ownerName: 'Ada',
    scenes: [
      {id: 's1', name: 'Forest', type: 'platform'},
      {id: 's2', name: 'Cave'},
    ],
    animations: {
      orderedKeys: ['b'],
      propsByKey: {b: {name: 'theirs', sourceUrl: 'https://x/b.png'}},
    },
  } as unknown as ExternalProject;

  function setup(compile = vi.fn(() => 'code();')) {
    const engine = {
      runProgram: vi.fn(),
      cancelSceneJump: vi.fn(),
      preloadAnimationsOverride: null as unknown,
    };
    const onRun = vi.fn();
    const ours = [{id: 'mine', name: 'Mine'}];
    const {result} = renderHook(() =>
      useExternalSceneRuns({
        engineRef: {current: engine as unknown as SpriteLabEngine},
        levelId: 7,
        scriptId: 3,
        sceneMetadata: ours,
        compile,
        onRun,
      }),
    );
    return {result, engine, onRun, compile, ours};
  }

  it("runs a fetched scene on its project's images, compiled against its images and scenes", async () => {
    externalProject.mockResolvedValue(structuredClone(PROJECT));
    const seen: unknown[] = [];
    const compile = vi.fn(() => {
      seen.push(state.animationList.orderedKeys, state.spriteLab2.scenes);
      return 'code();';
    });
    const {result, engine, onRun, ours} = setup(compile);
    const before = state.animationList;

    await act(() => result.current.runScene('chan1:s1'));

    expect(externalProject).toHaveBeenCalledWith('chan1', 7, 3);
    expect(seen).toEqual([
      ['a', 'b'],
      [...ours, {id: 's1', name: 'Forest'}, {id: 's2', name: 'Cave'}],
    ]);
    // The store is as it was.
    expect(state.animationList).toBe(before);
    expect(state.spriteLab2.scenes).toBe(ours);
    const [program, , sceneType] = engine.runProgram.mock.calls[0];
    expect(program).toMatch(/code\(\);$/);
    expect(sceneType).toBe('platform');
    expect(engine.preloadAnimationsOverride).toEqual({
      orderedKeys: ['b'],
      propsByKey: {
        b: {
          name: 'theirs',
          sourceUrl: 'https://x/b.png',
          dataURI: 'https://x/b.png',
        },
      },
    });
    expect(result.current.current.current?.sceneId).toBe('s1');
    expect(result.current.loading).toBe(false);
    expect(onRun).toHaveBeenCalled();
  });

  it('falls back to the last copy when a fetch fails, and cancels without one', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const {result, engine} = setup();

    externalProject.mockRejectedValueOnce(new Error('offline'));
    await act(() => result.current.runScene('chan1:s1'));
    expect(engine.cancelSceneJump).toHaveBeenCalledTimes(1);
    expect(engine.runProgram).not.toHaveBeenCalled();

    externalProject.mockResolvedValueOnce(structuredClone(PROJECT));
    await act(() => result.current.runScene('chan1:s1'));
    externalProject.mockRejectedValueOnce(new Error('offline'));
    await act(() => result.current.runScene('chan1:s2'));
    expect(engine.runProgram).toHaveBeenCalledTimes(2);
    expect(result.current.current.current?.sceneId).toBe('s2');
  });

  it('cancels the jump for a malformed key or an unknown scene', async () => {
    const {result, engine} = setup();
    await act(() => result.current.runScene('no-separator'));
    expect(externalProject).not.toHaveBeenCalled();
    act(() => result.current.runProjectScene(PROJECT, 'missing'));
    expect(engine.cancelSceneJump).toHaveBeenCalledTimes(2);
    expect(engine.runProgram).not.toHaveBeenCalled();
  });

  it('runs a scene that fails to compile empty', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const {result, engine} = setup(
      vi.fn(() => {
        throw new Error('bad blocks');
      }),
    );
    act(() => result.current.runProjectScene(PROJECT, 's2'));
    expect(engine.runProgram).toHaveBeenCalledTimes(1);
    expect(state.spriteLab2.scenes).toEqual([{id: 'mine', name: 'Mine'}]);
  });

  it("forgets the project and its images when this project's scene runs", () => {
    const {result, engine} = setup();
    act(() => result.current.runProjectScene(PROJECT, 's1'));
    act(() => result.current.leave());
    expect(result.current.current.current).toBeNull();
    expect(engine.preloadAnimationsOverride).toBeNull();
  });
});

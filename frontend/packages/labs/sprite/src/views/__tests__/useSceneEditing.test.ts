import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {Tab} from '../../redux/spriteLab2Redux';
import {deleteProjectAsset} from '../../sceneThumbnails';
import type {Scene, Sources} from '../../types';
import useSceneEditing from '../useSceneEditing';

const dispatch = vi.fn();
vi.mock('../../redux/store', () => ({useAppDispatch: () => dispatch}));
vi.mock('../../sceneThumbnails', () => ({deleteProjectAsset: vi.fn()}));

const scene = (id: string, extra: Partial<Scene> = {}): Scene =>
  ({id, name: id, type: 'platform', ...extra}) as Scene;

// Holds the project's sources as the lab's sources context would, applying
// each updater the hook hands it.
function setup(
  scenes: Scene[],
  {activeTab = 'Code' as Tab, activeSceneId = scenes[0]?.id ?? null} = {},
) {
  let sources = {scenes} as Sources;
  const setActiveSceneId = vi.fn();
  const updateSources = (update: (prev: Sources) => Sources) => {
    sources = update(sources);
  };
  const view = renderHook(() =>
    useSceneEditing({
      scenes,
      activeSceneId,
      setActiveSceneId,
      activeTab,
      channelId: 'channel',
      updateSources,
      getScenes: prev => prev.scenes ?? [],
    }),
  );
  return {view, setActiveSceneId, sources: () => sources};
}

beforeEach(() => {
  dispatch.mockClear();
  vi.mocked(deleteProjectAsset).mockClear();
});

describe('useSceneEditing', () => {
  it('creates a scene with the default code and makes it current', () => {
    const {view, setActiveSceneId, sources} = setup([scene('a')]);
    act(() => view.result.current.createScene('Cave', 'story'));
    const created = sources().scenes![1];
    expect(created).toMatchObject({name: 'Cave', type: 'story'});
    expect(created.source).toBeDefined();
    expect(setActiveSceneId).toHaveBeenCalledWith(created.id);
  });

  it('renames only the named scene', () => {
    const {view, sources} = setup([scene('a'), scene('b')]);
    act(() => view.result.current.renameScene('b', 'Boss'));
    expect(sources().scenes!.map(s => s.name)).toEqual(['a', 'Boss']);
  });

  it('deletes a scene, moves off it, and removes its picture', () => {
    const {view, setActiveSceneId, sources} = setup([
      scene('a', {
        thumbnail: {url: '/v3/assets/channel/a.png'},
      } as Partial<Scene>),
      scene('b'),
    ]);
    act(() => view.result.current.deleteScene('a'));
    expect(sources().scenes!.map(s => s.id)).toEqual(['b']);
    expect(setActiveSceneId).toHaveBeenCalledWith('b');
    expect(deleteProjectAsset).toHaveBeenCalledWith(
      'channel',
      '/v3/assets/channel/a.png',
    );
  });

  it('never deletes the last scene', () => {
    const {view, sources} = setup([scene('a')]);
    act(() => view.result.current.deleteScene('a'));
    expect(sources().scenes!.map(s => s.id)).toEqual(['a']);
  });

  it('moves the start scene to the front', () => {
    const {view, sources} = setup([scene('a'), scene('b'), scene('c')]);
    act(() => view.result.current.makeStartScene('c'));
    expect(sources().scenes!.map(s => s.id)).toEqual(['c', 'a', 'b']);
  });

  it('from another tab, returns to the Code tab of the chosen scene', () => {
    const {view, setActiveSceneId} = setup([scene('a'), scene('b')], {
      activeTab: 'Images',
    });
    act(() => view.result.current.selectScene('b'));
    expect(setActiveSceneId).toHaveBeenCalledWith('b');
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({payload: 'Code'}),
    );
  });
});

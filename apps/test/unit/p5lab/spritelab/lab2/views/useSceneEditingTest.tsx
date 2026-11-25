import {render} from '@testing-library/react';
import React from 'react';

import {Scene, Sources} from '@cdo/apps/p5lab/spritelab/lab2/types';
import useSceneEditing, {
  SceneEditing,
} from '@cdo/apps/p5lab/spritelab/lab2/views/useSceneEditing';
import HttpClient from '@cdo/apps/util/HttpClient';

const reclaim = jest.fn((url?: string) => Promise.resolve(true));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset', () => ({
  __esModule: true,
  default: () => (url?: string) => reclaim(url),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => jest.fn(),
}));

const scene = (id: string, thumbnailUrl?: string) =>
  ({
    id,
    name: id,
    source: {},
    ...(thumbnailUrl && {thumbnail: {url: thumbnailUrl, fingerprint: 'f'}}),
  } as unknown as Scene);

function setup(scenes: Scene[]) {
  let editing: SceneEditing | undefined;
  let sources = {scenes} as unknown as Sources;
  const updateSources = jest.fn((update: (prev: Sources) => Sources) => {
    sources = update(sources);
  });
  const Probe = () => {
    editing = useSceneEditing({
      scenes,
      activeSceneId: scenes[0].id,
      setActiveSceneId: jest.fn(),
      activeTab: 'Code',
      updateSources: updateSources as never,
      getScenes: s => (s as unknown as {scenes: Scene[]}).scenes,
    });
    return null;
  };
  render(<Probe />);
  return {editing: () => editing!, sources: () => sources};
}

describe('useSceneEditing', () => {
  beforeEach(() => reclaim.mockClear());

  it("leaves a deleted scene's thumbnail for deletion once a save drops it", () => {
    const remove = jest.spyOn(HttpClient, 'delete');
    const t = setup([
      scene('one', '/v3/assets/chan/one.png'),
      scene('two', '/v3/assets/chan/two.png'),
    ]);
    t.editing().deleteScene('two');
    expect(reclaim.mock.calls).toEqual([['/v3/assets/chan/two.png']]);
    expect(remove).not.toHaveBeenCalled();
    expect(
      (t.sources() as unknown as {scenes: Scene[]}).scenes.map(s => s.id)
    ).toEqual(['one']);
    remove.mockRestore();
  });
});

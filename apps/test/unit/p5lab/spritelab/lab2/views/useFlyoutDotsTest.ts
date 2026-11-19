import {renderHook} from '@testing-library/react-hooks';

import {Scene} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {useSeenBlockTypes} from '@cdo/apps/p5lab/spritelab/lab2/views/useFlyoutDots';

const sceneWith = (...types: string[]): Scene =>
  ({
    id: 's1',
    name: 'Scene 1',
    source: {blocks: {blocks: types.map(type => ({type}))}},
  } as unknown as Scene);

describe('useSeenBlockTypes', () => {
  it('holds the blocks the project uses', () => {
    const {result} = renderHook(() =>
      useSeenBlockTypes([sceneWith('spritelab2_whenRun', 'spritelab2_burst')])
    );
    expect([...result.current].sort()).toEqual([
      'spritelab2_burst',
      'spritelab2_whenRun',
    ]);
  });

  it('keeps a block after the project stops using it', () => {
    const view = renderHook(
      (props: {scenes: Scene[]}) => useSeenBlockTypes(props.scenes),
      {initialProps: {scenes: [sceneWith('spritelab2_burst')]}}
    );
    view.rerender({scenes: [sceneWith('gamelab_spriteSay')]});
    expect([...view.result.current].sort()).toEqual([
      'gamelab_spriteSay',
      'spritelab2_burst',
    ]);
  });

  it('keeps the same set while nothing new is used', () => {
    const view = renderHook(
      (props: {scenes: Scene[]}) => useSeenBlockTypes(props.scenes),
      {initialProps: {scenes: [sceneWith('spritelab2_burst')]}}
    );
    const first = view.result.current;
    view.rerender({scenes: [sceneWith('spritelab2_burst')]});
    expect(view.result.current).toBe(first);
  });
});

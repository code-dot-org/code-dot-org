import {act, renderHook} from '@testing-library/react-hooks';

import {usePlayProgress} from '@cdo/apps/p5lab/spritelab/lab2/views/useObjectives';

const NEEDS = {seconds: false, touch: false, height: false, move: true};

describe('usePlayProgress', () => {
  it('measures a run from its first report, and starts over on the next run', () => {
    const view = renderHook(
      (props: {playing: boolean}) => usePlayProgress(props.playing, NEEDS),
      {initialProps: {playing: true}}
    );
    const report = (x: number, height: number) =>
      act(() => {
        view.result.current.onPlayerProgress?.({touching: [], height, x});
      });
    report(100, 0.2);
    report(130, 0.2);
    expect(view.result.current.runtime.farthest).toBe(30);
    expect(view.result.current.runtime.risen).toBe(0);
    report(80, 0.35);
    expect(view.result.current.runtime.farthest).toBe(30);
    expect(view.result.current.runtime.risen).toBeCloseTo(0.15);
    view.rerender({playing: false});
    view.rerender({playing: true});
    report(500, 0.2);
    report(510, 0.2);
    expect(view.result.current.runtime.farthest).toBe(30);
  });

  it('asks the engine for reports only when the checklist reads them', () => {
    const none = renderHook(() =>
      usePlayProgress(true, {...NEEDS, move: false})
    );
    expect(none.result.current.onPlayerProgress).toBeNull();
  });
});

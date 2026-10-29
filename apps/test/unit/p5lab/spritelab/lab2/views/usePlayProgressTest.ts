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
        view.result.current.onPlayerProgress?.({
          touching: [],
          height,
          x,
          speed: 15,
        });
      });
    report(100, 0.2);
    report(115, 0.2);
    report(130, 0.2);
    expect(view.result.current.runtime.farthest).toBe(30);
    expect(view.result.current.runtime.risen).toBe(0);
    report(120, 0.35);
    expect(view.result.current.runtime.farthest).toBe(30);
    expect(view.result.current.runtime.risen).toBeCloseTo(0.15);
    view.rerender({playing: false});
    view.rerender({playing: true});
    report(500, 0.2);
    report(510, 0.2);
    expect(view.result.current.runtime.farthest).toBe(30);
  });

  it('measures a jump from the lowest point, not from where the run began in the air', () => {
    const view = renderHook(() => usePlayProgress(true, NEEDS));
    const report = (x: number, height: number) =>
      act(() => {
        view.result.current.onPlayerProgress?.({
          touching: [],
          height,
          x,
          speed: 15,
        });
      });
    report(100, 0.3);
    report(100, 0);
    report(100, 0.12);
    expect(view.result.current.runtime.risen).toBeCloseTo(0.12);
  });

  it('starts over after a teleport instead of counting it as a run', () => {
    const view = renderHook(() => usePlayProgress(true, NEEDS));
    const report = (x: number, height: number) =>
      act(() => {
        view.result.current.onPlayerProgress?.({
          touching: [],
          height,
          x,
          speed: 15,
        });
      });
    report(100, 0.1);
    report(400, 0.4);
    expect(view.result.current.runtime.farthest).toBe(0);
    expect(view.result.current.runtime.risen).toBe(0);
    report(415, 0.4);
    expect(view.result.current.runtime.farthest).toBe(15);
  });

  it('drops the preview before Play, so the fall and respawn are not a jump', () => {
    const view = renderHook(
      (props: {playing: boolean}) =>
        usePlayProgress(props.playing, {...NEEDS, touch: true}),
      {initialProps: {playing: false}}
    );
    const report = (x: number, height: number) =>
      act(() => {
        view.result.current.onPlayerProgress?.({
          touching: ['star'],
          height,
          x,
          speed: 15,
        });
      });
    report(100, 0.4);
    report(100, 0.2);
    expect(view.result.current.runtime.touched.size).toBe(0);
    view.rerender({playing: true});
    report(100, 0.4);
    report(100, 0.2);
    expect(view.result.current.runtime.risen).toBe(0);
    expect(view.result.current.runtime.touched.has('star')).toBe(true);
  });

  it('asks the engine for reports only when the checklist reads them', () => {
    const none = renderHook(() =>
      usePlayProgress(true, {...NEEDS, move: false})
    );
    expect(none.result.current.onPlayerProgress).toBeNull();
  });
});

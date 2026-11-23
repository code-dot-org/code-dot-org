import {act, renderHook} from '@testing-library/react-hooks';

import {
  MAX_LEAVING_MS,
  useStopWhenResting,
} from '@cdo/apps/aiComponentLibrary/loadingAnimations/useStopWhenResting';

type Phase = 'thinking' | 'ready';

// A stand-in for the first dot. Its bounce lasts 1.2s and starts after a
// 0.5s delay, as in dots.module.scss; the animation's time counts from the
// start of the delay.
const fakeFirstDot = (animationTimeMs: number) =>
  ({
    getAnimations: () => [
      {
        currentTime: animationTimeMs,
        effect: {
          getComputedTiming: () => ({duration: 1200}),
          getTiming: () => ({delay: 500}),
        },
      },
    ],
  } as unknown as SVGCircleElement);

function renderStop(firstDot?: SVGCircleElement, targetLeavingMs?: number) {
  const onStopped = jest.fn();
  const hook = renderHook(
    ({phase}: {phase: Phase}) =>
      useStopWhenResting(phase, onStopped, targetLeavingMs),
    {initialProps: {phase: 'thinking' as Phase}}
  );
  if (firstDot) {
    (
      hook.result.current
        .firstDotRef as React.MutableRefObject<SVGCircleElement>
    ).current = firstDot;
  }
  const advance = (ms: number) =>
    act(() => {
      jest.advanceTimersByTime(ms);
    });
  return {...hook, onStopped, advance};
}

describe('useStopWhenResting', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does nothing while thinking', () => {
    const {result, onStopped, advance} = renderStop();
    advance(10_000);
    expect(result.current.stopping).toBe(false);
    expect(onStopped).not.toHaveBeenCalled();
  });

  it('stops at once where the animation cannot be read, and reports the end of the exit', () => {
    const {result, rerender, onStopped, advance} = renderStop();
    rerender({phase: 'ready'});
    advance(0);
    expect(result.current.stopping).toBe(true);

    advance(399);
    expect(onStopped).not.toHaveBeenCalled();
    advance(1);
    expect(onStopped).toHaveBeenCalledTimes(1);
  });

  it('waits until all three dots are at rest', () => {
    // 300ms into a bounce: the dots are all at rest 1020ms into it.
    const {result, rerender, advance} = renderStop(fakeFirstDot(500 + 300));
    rerender({phase: 'ready'});
    advance(719);
    expect(result.current.stopping).toBe(false);
    advance(1);
    expect(result.current.stopping).toBe(true);
  });

  it('stops at once when the dots are already at rest', () => {
    const {result, rerender, advance} = renderStop(fakeFirstDot(500 + 1100));
    rerender({phase: 'ready'});
    advance(0);
    expect(result.current.stopping).toBe(true);
  });

  describe('with a time to be done within', () => {
    it('starts the exit just before the next bounce, when the time allows', () => {
      // 450ms into a bounce: the dots are all at rest from 570ms to 750ms
      // from now.
      const {result, rerender, advance} = renderStop(
        fakeFirstDot(500 + 450),
        MAX_LEAVING_MS
      );
      rerender({phase: 'ready'});
      advance(719);
      expect(result.current.stopping).toBe(false);
      advance(1);
      expect(result.current.stopping).toBe(true);
    });

    it('starts the exit so that it ends on time, when the dots are down then', () => {
      // The dots are all at rest from 570ms to 750ms from now, and 1050ms
      // less the 400ms exit is 650ms.
      const {result, rerender, onStopped, advance} = renderStop(
        fakeFirstDot(500 + 450),
        1050
      );
      rerender({phase: 'ready'});
      advance(649);
      expect(result.current.stopping).toBe(false);
      advance(1);
      expect(result.current.stopping).toBe(true);
      advance(400);
      expect(onStopped).toHaveBeenCalledTimes(1);
    });

    it('waits through a bounce to a later landing that still ends on time', () => {
      // From now, the dots are all at rest at 570ms, and again from 1770ms
      // to 1950ms.
      const {result, rerender, advance} = renderStop(
        fakeFirstDot(500 + 450),
        2600
      );
      rerender({phase: 'ready'});
      advance(1919);
      expect(result.current.stopping).toBe(false);
      advance(1);
      expect(result.current.stopping).toBe(true);
    });

    it('takes the first landing when none ends on time', () => {
      const {result, rerender, advance} = renderStop(
        fakeFirstDot(500 + 450),
        500
      );
      rerender({phase: 'ready'});
      advance(569);
      expect(result.current.stopping).toBe(false);
      advance(1);
      expect(result.current.stopping).toBe(true);
    });
  });

  it('never takes longer than MAX_LEAVING_MS', () => {
    // Just after a bounce begins is the longest wait.
    const {rerender, onStopped, advance} = renderStop(fakeFirstDot(500 + 1));
    rerender({phase: 'ready'});
    advance(MAX_LEAVING_MS);
    expect(onStopped).toHaveBeenCalledTimes(1);
  });
});

import {act, renderHook} from '@testing-library/react-hooks';

import useWaitIndicator, {
  WAIT_INDICATOR_DELAY_MS,
  WAIT_INDICATOR_MIN_MS,
} from '@cdo/apps/lab2/views/dialogs/useWaitIndicator';

describe('useWaitIndicator', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const renderWait = (waiting: boolean) =>
    renderHook((props: {waiting: boolean}) => useWaitIndicator(props.waiting), {
      initialProps: {waiting},
    });
  const advance = (ms: number) =>
    act(() => {
      jest.advanceTimersByTime(ms);
    });

  it('holds from the start, and shows nothing for a wait that ends quickly', () => {
    const {result, rerender} = renderWait(true);
    expect(result.current).toEqual({held: true, indicator: false});

    advance(WAIT_INDICATOR_DELAY_MS - 1);
    rerender({waiting: false});
    expect(result.current).toEqual({held: false, indicator: false});

    advance(WAIT_INDICATOR_DELAY_MS + WAIT_INDICATOR_MIN_MS);
    expect(result.current).toEqual({held: false, indicator: false});
  });

  it('shows the indicator once the wait has run long', () => {
    const {result} = renderWait(true);
    advance(WAIT_INDICATOR_DELAY_MS);
    expect(result.current).toEqual({held: true, indicator: true});
  });

  it('keeps a shown indicator, and the hold, for its minimum time', () => {
    const {result, rerender} = renderWait(true);
    advance(WAIT_INDICATOR_DELAY_MS);
    advance(100);
    rerender({waiting: false});
    expect(result.current).toEqual({held: true, indicator: true});

    advance(WAIT_INDICATOR_MIN_MS - 100 - 1);
    expect(result.current).toEqual({held: true, indicator: true});

    advance(1);
    expect(result.current).toEqual({held: false, indicator: false});
  });

  it('lets go as the wait ends when the indicator has had its time', () => {
    const {result, rerender} = renderWait(true);
    advance(WAIT_INDICATOR_DELAY_MS + WAIT_INDICATOR_MIN_MS + 200);
    rerender({waiting: false});
    advance(0);
    expect(result.current).toEqual({held: false, indicator: false});
  });

  it('neither holds nor shows when there is no wait', () => {
    const {result} = renderWait(false);
    advance(WAIT_INDICATOR_DELAY_MS + WAIT_INDICATOR_MIN_MS);
    expect(result.current).toEqual({held: false, indicator: false});
  });
});

import {act, renderHook} from '@testing-library/react-hooks';

import useDelayedSpinner, {
  SPINNER_DELAY_MS,
  SPINNER_MIN_MS,
} from '@cdo/apps/lab2/views/dialogs/useDelayedSpinner';

describe('useDelayedSpinner', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const renderWait = (waiting: boolean) =>
    renderHook(
      (props: {waiting: boolean}) => useDelayedSpinner(props.waiting),
      {
        initialProps: {waiting},
      }
    );
  const advance = (ms: number) =>
    act(() => {
      jest.advanceTimersByTime(ms);
    });

  it('withholds from the start, and shows no spinner for a wait that ends quickly', () => {
    const {result, rerender} = renderWait(true);
    expect(result.current).toEqual({isWithheld: true, showSpinner: false});

    advance(SPINNER_DELAY_MS - 1);
    rerender({waiting: false});
    expect(result.current).toEqual({isWithheld: false, showSpinner: false});

    advance(SPINNER_DELAY_MS + SPINNER_MIN_MS);
    expect(result.current).toEqual({isWithheld: false, showSpinner: false});
  });

  it('shows the spinner once the wait has run long', () => {
    const {result} = renderWait(true);
    advance(SPINNER_DELAY_MS);
    expect(result.current).toEqual({isWithheld: true, showSpinner: true});
  });

  it('keeps a shown spinner, and withholds, for its minimum time', () => {
    const {result, rerender} = renderWait(true);
    advance(SPINNER_DELAY_MS);
    advance(100);
    rerender({waiting: false});
    expect(result.current).toEqual({isWithheld: true, showSpinner: true});

    advance(SPINNER_MIN_MS - 100 - 1);
    expect(result.current).toEqual({isWithheld: true, showSpinner: true});

    advance(1);
    expect(result.current).toEqual({isWithheld: false, showSpinner: false});
  });

  it('stops withholding as the wait ends once the spinner has had its time', () => {
    const {result, rerender} = renderWait(true);
    advance(SPINNER_DELAY_MS + SPINNER_MIN_MS + 200);
    rerender({waiting: false});
    expect(result.current).toEqual({isWithheld: false, showSpinner: false});
  });

  it('neither withholds nor shows a spinner when there is no wait', () => {
    const {result} = renderWait(false);
    advance(SPINNER_DELAY_MS + SPINNER_MIN_MS);
    expect(result.current).toEqual({isWithheld: false, showSpinner: false});
  });
});

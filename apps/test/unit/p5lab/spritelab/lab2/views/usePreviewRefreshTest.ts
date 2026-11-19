import {renderHook} from '@testing-library/react-hooks';

import usePreviewRefresh from '@cdo/apps/p5lab/spritelab/lab2/views/usePreviewRefresh';

const render = (playing = false) => {
  const runPreview = jest.fn();
  const hook = renderHook(
    ({playing}: {playing: boolean}) => usePreviewRefresh(runPreview, playing),
    {initialProps: {playing}}
  );
  return {runPreview, ...hook};
};

describe('usePreviewRefresh', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('runs the preview once, 400ms after the last request', () => {
    const {runPreview, result} = render();
    result.current();
    jest.advanceTimersByTime(300);
    result.current();
    jest.advanceTimersByTime(399);
    expect(runPreview).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(runPreview).toHaveBeenCalledTimes(1);
  });

  it('drops a waiting preview when play starts', () => {
    const {runPreview, result, rerender} = render();
    result.current();
    jest.advanceTimersByTime(100);
    rerender({playing: true});
    jest.advanceTimersByTime(1000);
    expect(runPreview).not.toHaveBeenCalled();
  });

  it('does not bring a dropped preview back when play ends early', () => {
    const {runPreview, result, rerender} = render();
    result.current();
    jest.advanceTimersByTime(100);
    rerender({playing: true});
    jest.advanceTimersByTime(200);
    rerender({playing: false});
    jest.advanceTimersByTime(1000);
    expect(runPreview).not.toHaveBeenCalled();
  });

  it('does nothing when its timer fires during play before being cleared', () => {
    const {runPreview, result, rerender} = render();
    result.current();
    const clearTimeoutSpy = jest
      .spyOn(window, 'clearTimeout')
      .mockImplementation(() => {});
    rerender({playing: true});
    jest.advanceTimersByTime(400);
    clearTimeoutSpy.mockRestore();
    expect(runPreview).not.toHaveBeenCalled();
  });

  it('schedules nothing for a request made during a short play', () => {
    const {runPreview, result, rerender} = render(true);
    result.current();
    jest.advanceTimersByTime(200);
    rerender({playing: false});
    jest.advanceTimersByTime(1000);
    expect(runPreview).not.toHaveBeenCalled();
  });

  it('ignores a request made while the game plays', () => {
    const {runPreview, result} = render(true);
    result.current();
    jest.advanceTimersByTime(1000);
    expect(runPreview).not.toHaveBeenCalled();
  });

  it('runs the preview function of the latest render', () => {
    const first = jest.fn();
    const second = jest.fn();
    const {result, rerender} = renderHook(
      ({runPreview}: {runPreview: () => void}) =>
        usePreviewRefresh(runPreview, false),
      {initialProps: {runPreview: first}}
    );
    result.current();
    rerender({runPreview: second});
    jest.advanceTimersByTime(400);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('returns the same function on every render', () => {
    const {result, rerender} = render();
    const first = result.current;
    rerender({playing: true});
    rerender({playing: false});
    expect(result.current).toBe(first);
  });

  it('runs the preview for a request made after play ends', () => {
    const {runPreview, result, rerender} = render(true);
    rerender({playing: false});
    result.current();
    jest.advanceTimersByTime(400);
    expect(runPreview).toHaveBeenCalledTimes(1);
  });
});

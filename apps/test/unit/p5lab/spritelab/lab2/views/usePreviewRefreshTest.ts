import {renderHook} from '@testing-library/react-hooks';

import usePreviewRefresh from '@cdo/apps/p5lab/spritelab/lab2/views/usePreviewRefresh';

const render = (onPlayTab = false) => {
  const runPreview = jest.fn();
  const hook = renderHook(
    ({onPlayTab}: {onPlayTab: boolean}) =>
      usePreviewRefresh(runPreview, onPlayTab),
    {initialProps: {onPlayTab}}
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
    rerender({onPlayTab: true});
    jest.advanceTimersByTime(1000);
    expect(runPreview).not.toHaveBeenCalled();
  });

  it('ignores a request made on the Play tab', () => {
    const {runPreview, result} = render(true);
    result.current();
    jest.advanceTimersByTime(1000);
    expect(runPreview).not.toHaveBeenCalled();
  });

  it('runs the preview for a request made after play ends', () => {
    const {runPreview, result, rerender} = render(true);
    rerender({onPlayTab: false});
    result.current();
    jest.advanceTimersByTime(400);
    expect(runPreview).toHaveBeenCalledTimes(1);
  });
});

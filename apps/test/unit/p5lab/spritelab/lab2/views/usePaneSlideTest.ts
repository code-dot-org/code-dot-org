import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';

import usePaneSlide, {
  PANE_SLIDE_MS,
} from '@cdo/apps/p5lab/spritelab/lab2/views/usePaneSlide';

describe('usePaneSlide', () => {
  const paneRef = {current: document.createElement('div')};
  const slide = (active: boolean, edge: number) =>
    renderHook(
      (props: {active: boolean; edge: number}) =>
        usePaneSlide(props.active, props.edge, paneRef),
      {initialProps: {active, edge}}
    );
  const endOf = (target: EventTarget, propertyName: string) =>
    ({
      target,
      currentTarget: paneRef.current,
      propertyName,
    } as unknown as React.TransitionEvent<HTMLElement>);

  it('rests parked, with no style', () => {
    const {result} = slide(false, 300);
    expect(result.current.parked).toBe(true);
    expect(result.current.style).toBeUndefined();
  });

  it('crosses to the full width once active', () => {
    const view = slide(false, 300);
    view.rerender({active: true, edge: 300});
    expect(view.result.current.parked).toBe(false);
    expect(view.result.current.style).toMatchObject({
      transform: 'none',
      opacity: 1,
    });
    expect(view.result.current.style?.transition).toContain(
      `transform ${PANE_SLIDE_MS}ms`
    );
  });

  it('slides back to the last edge the column reported, then parks', () => {
    const view = slide(true, 300);
    // The column hides behind the pane and reports no width.
    view.rerender({active: true, edge: 0});
    view.rerender({active: false, edge: 0});
    expect(view.result.current.parked).toBe(false);
    expect(view.result.current.style).toMatchObject({
      transform: 'translateX(300px)',
      opacity: 0,
    });
    act(() => {
      view.result.current.onTransitionEnd(endOf(paneRef.current, 'transform'));
    });
    expect(view.result.current.parked).toBe(true);
    expect(view.result.current.style).toBeUndefined();
  });

  it('ignores the fade and the contents’ own transitions', () => {
    const view = slide(true, 300);
    view.rerender({active: false, edge: 300});
    act(() => {
      view.result.current.onTransitionEnd(endOf(paneRef.current, 'opacity'));
      view.result.current.onTransitionEnd(
        endOf(document.createElement('img'), 'transform')
      );
    });
    expect(view.result.current.parked).toBe(false);
  });
});

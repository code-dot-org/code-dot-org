import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';

import FullTextTooltip from '../../src/UIComponents/FullTextTooltip';
import {CanvasMoveContext} from '../../src/UIComponents/TreeCanvas';

const TEXT = 'Sunny or Overcast';

function label({focused = false, subscribeToMoves = () => () => {}} = {}) {
  return createElement(
    CanvasMoveContext.Provider,
    {value: subscribeToMoves},
    createElement(
      FullTextTooltip,
      {title: TEXT, focused, placement: 'top'},
      createElement('span', null, TEXT)
    )
  );
}

function textWidth(scrollWidth) {
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(
    scrollWidth
  );
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(60);
}

function settle() {
  act(() => vi.advanceTimersByTime(1000));
}

// jsdom lays nothing out, so Popper sees every anchor as clipped and hides its tooltip.
const tooltip = () => screen.queryByRole('tooltip', {hidden: true});

describe('FullTextTooltip', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('shows the whole text on hover when it is cut off', () => {
    textWidth(120);
    render(label());

    fireEvent.mouseOver(screen.getByText(TEXT));
    settle();

    expect(tooltip().textContent).toBe(TEXT);
  });

  test('stays closed on hover or focus when the text fits', () => {
    textWidth(60);
    const {rerender} = render(label());

    fireEvent.mouseOver(screen.getByText(TEXT));
    settle();
    expect(tooltip()).toBeNull();

    rerender(label({focused: true}));
    expect(tooltip()).toBeNull();
  });

  test('shows the whole text while its node has focus, until it leaves', () => {
    textWidth(120);
    const {rerender} = render(label());

    rerender(label({focused: true}));
    expect(tooltip().textContent).toBe(TEXT);

    rerender(label({focused: false}));
    settle();
    expect(tooltip()).toBeNull();
  });

  test('stays open while focused after the pointer leaves', () => {
    textWidth(120);
    const {container} = render(label({focused: true}));

    fireEvent.mouseLeave(container.querySelector('span'));
    settle();

    expect(tooltip().textContent).toBe(TEXT);
  });

  test('follows the canvas only while open', () => {
    textWidth(120);
    const unsubscribe = vi.fn();
    const subscribeToMoves = vi.fn(() => unsubscribe);
    const {rerender} = render(label({subscribeToMoves}));
    expect(subscribeToMoves).not.toHaveBeenCalled();

    rerender(label({focused: true, subscribeToMoves}));
    expect(subscribeToMoves).toHaveBeenCalledTimes(1);

    rerender(label({focused: false, subscribeToMoves}));
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

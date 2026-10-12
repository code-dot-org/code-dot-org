import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';

import {CanvasMoveContext} from '../../src/UIComponents/TreeCanvas';
import TruncatedTextTooltip from '../../src/UIComponents/TruncatedTextTooltip';

const TEXT = 'Sunny or Overcast';

function label({focused = false, subscribeToMoves = () => () => {}} = {}) {
  return createElement(
    CanvasMoveContext.Provider,
    {value: subscribeToMoves},
    createElement(
      TruncatedTextTooltip,
      {title: TEXT, focused, placement: 'top'},
      createElement('span', null, TEXT),
    ),
  );
}

function textWidth(scrollWidth) {
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(
    scrollWidth,
  );
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(60);
}

function settle() {
  act(() => vi.advanceTimersByTime(1000));
}

// jsdom lays nothing out, so Popper sees every anchor as clipped and hides its tooltip.
const tooltip = () => screen.queryByRole('tooltip', {hidden: true});

describe('TruncatedTextTooltip', () => {
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

  test('stays closed on hover when the text fits', () => {
    textWidth(60);
    render(label());

    fireEvent.mouseOver(screen.getByText(TEXT));
    settle();

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

  test('stays open when its node loses focus under the pointer', () => {
    textWidth(120);
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(
      function (selector) {
        return selector === ':hover' ? true : matches.call(this, selector);
      },
    );
    const {rerender} = render(label({focused: true}));

    rerender(label({focused: false}));
    settle();

    expect(tooltip().textContent).toBe(TEXT);
  });

  test('stays closed while focused when the text fits', () => {
    textWidth(60);
    render(label({focused: true}));

    expect(tooltip()).toBeNull();
  });

  test('follows the canvas only while open', () => {
    textWidth(120);
    const unsubscribe = vi.fn();
    const subscribeToMoves = vi.fn(() => unsubscribe);
    const {rerender} = render(label({subscribeToMoves}));
    expect(subscribeToMoves).not.toHaveBeenCalled();

    rerender(label({focused: true, subscribeToMoves}));
    const [[onMove]] = subscribeToMoves.mock.calls;
    act(() => {
      onMove();
    });

    rerender(label({focused: false, subscribeToMoves}));
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

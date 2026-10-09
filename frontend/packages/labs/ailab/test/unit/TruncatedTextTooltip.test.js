import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';

import TruncatedTextTooltip from '../../src/UIComponents/TruncatedTextTooltip';

const TEXT = 'Sunny or Overcast';

// jsdom lays nothing out, so the label reports the widths it is given.
function renderLabel({scrollWidth, clientWidth}) {
  render(
    createElement(
      TruncatedTextTooltip,
      {title: TEXT},
      createElement('span', null, TEXT),
    ),
  );
  const label = screen.getByText(TEXT);
  Object.defineProperties(label, {
    scrollWidth: {value: scrollWidth},
    clientWidth: {value: clientWidth},
  });
  return label;
}

function hover(label) {
  fireEvent.mouseOver(label);
  act(() => vi.advanceTimersByTime(1000));
}

describe('TruncatedTextTooltip', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('shows the whole text on hover when it is cut off', () => {
    hover(renderLabel({scrollWidth: 120, clientWidth: 60}));

    expect(screen.getByRole('tooltip').textContent).toBe(TEXT);
  });

  test('stays closed when the text fits', () => {
    hover(renderLabel({scrollWidth: 60, clientWidth: 60}));

    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  test.each(['pointerDown', 'wheel'])('closes on %s', event => {
    const label = renderLabel({scrollWidth: 120, clientWidth: 60});
    hover(label);

    fireEvent[event](label);
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});

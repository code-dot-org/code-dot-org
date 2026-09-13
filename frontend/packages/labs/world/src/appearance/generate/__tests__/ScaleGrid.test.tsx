// Choosing a shape by drawing it.
//
// What is worth pinning is the reading: that the rectangle drawn is the
// rectangle got, that it fills from the corner a thing stands in, and that a
// reader who is not looking at it is told what it says.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {ScaleGrid, scaleSaid} from '../ScaleGrid';

const onChange = vi.fn();

const show = (props: Partial<React.ComponentProps<typeof ScaleGrid>> = {}) =>
  render(<ScaleGrid value={{x: 1, y: 1}} onChange={onChange} {...props} />);

/** Whether the square this many across and up is filled. */
const filled = (across: number, up: number) =>
  screen
    .getByRole('button', {name: `${across} across, ${up} up`})
    .getAttribute('aria-pressed') === 'true';

beforeEach(() => vi.clearAllMocks());

describe('the scale grid', () => {
  it('starts as the one tile every actor is', () => {
    show();

    expect(filled(1, 1)).toBe(true);
    expect(filled(2, 1)).toBe(false);
    expect(filled(1, 2)).toBe(false);
  });

  it('fills the rectangle between the corner and what was pressed', () => {
    // From the bottom left, because that is the corner a thing stands in.
    show({value: {x: 3, y: 2}});

    expect(filled(1, 1)).toBe(true);
    expect(filled(3, 2)).toBe(true);
    expect(filled(2, 1)).toBe(true);
    // …and nothing beyond it.
    expect(filled(4, 2)).toBe(false);
    expect(filled(3, 3)).toBe(false);
  });

  it('answers with the shape that was drawn, across then up', () => {
    // The one thing here that could be the other way round: a widget where
    // clicking a wide shape made a tall actor would be wrong in a way nobody
    // would report.
    show();
    fireEvent.click(screen.getByRole('button', {name: '3 across, 2 up'}));

    expect(onChange).toHaveBeenCalledWith({x: 3, y: 2});
  });

  it('offers as many squares as it is asked for', () => {
    show({squares: 2});

    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.queryByRole('button', {name: '3 across, 1 up'})).toBeNull();
  });

  it('says what it says, for a reader not looking at it', () => {
    expect(scaleSaid({x: 1, y: 1})).toBe('one tile');
    expect(scaleSaid({x: 2, y: 3})).toBe('2 across, 3 up');

    show({value: {x: 2, y: 3}});
    expect(screen.getByText('2 across, 3 up')).toBeTruthy();
  });

  it('changes nothing where nothing may be changed', () => {
    show({disabled: true});

    expect(screen.getByRole('button', {name: '2 across, 2 up'})).toBeDisabled();
  });
});

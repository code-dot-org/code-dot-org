// The animations, read as a grid of them running.
//
// What is worth pinning is the reading rather than the acts — every act is the
// file menus' own (`files/FileMenus`). So: that an animation is a tile you press
// to open, that the two ways to get another are in the grid where the eye
// already is, and that a file holding nothing still has a tile.

import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {
  AnimationPickerDialog,
  type AnimationTile,
} from '../AnimationPickerDialog';

const frame = (sprite: string) => ({sprite, __id: sprite});

const ANIMATIONS: AnimationTile[] = [
  {
    fileId: 'a1',
    name: 'Coin Spin',
    animation: {frameRate: 10, frames: [frame('coin.png'), frame('coin.png')]},
  },
  {fileId: 'a2', name: 'Empty', animation: {frames: []}},
];

const onOpen = vi.fn();
const onNew = vi.fn();
const onImport = vi.fn();
const onCancel = vi.fn();

const show = (
  props: Partial<React.ComponentProps<typeof AnimationPickerDialog>> = {},
) =>
  render(
    <AnimationPickerDialog
      animations={ANIMATIONS}
      images={{}}
      onOpen={onOpen}
      onNew={onNew}
      onImport={onImport}
      onCancel={onCancel}
      {...props}
    />,
  );

beforeEach(() => vi.clearAllMocks());

describe('the animation grid', () => {
  it('gives every animation a tile that opens it', () => {
    show();

    screen.getByRole('button', {name: 'Open Coin Spin'}).click();
    expect(onOpen).toHaveBeenCalledWith('a1');
  });

  it('holds the two ways to get another one, in the grid', () => {
    show();

    screen.getByText('Import').click();
    expect(onImport).toHaveBeenCalled();
    screen.getByText('New').click();
    expect(onNew).toHaveBeenCalled();
  });

  it('offers neither where nothing may be changed', () => {
    show({readOnly: true});

    expect(screen.queryByText('Import')).toBeNull();
    expect(screen.queryByText('New')).toBeNull();
    // …and still shows what is there, which is the point of a locked level.
    expect(screen.getByRole('button', {name: 'Open Coin Spin'})).toBeTruthy();
  });

  it('gives a file with no frames a tile all the same', () => {
    // A `.anim` a learner has just made holds nothing yet, and it is the one
    // they are most likely to be looking for.
    show();

    const blank = screen.getByRole('button', {name: 'Open Empty'});
    expect(blank).toBeTruthy();
    expect(blank.querySelector('canvas')).toBeNull();
  });

  it('says when there is nothing to show', () => {
    show({animations: []});

    expect(
      screen.getByText('This project has no animations yet.'),
    ).toBeTruthy();
  });
});

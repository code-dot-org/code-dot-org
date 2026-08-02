// Choosing a frame's picture by looking at it.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {SheetFile} from '../../appearance/sheetFile';
import {SpritePickerDialog} from '../SpritePickerDialog';

const SHEET: SheetFile = {type: 'sheet', cell: {width: 32, height: 32}};

const image = (src: string): HTMLImageElement =>
  ({width: 32, height: 32, src}) as HTMLImageElement;

const open = (
  props: Partial<React.ComponentProps<typeof SpritePickerDialog>> = {},
) =>
  render(
    <SpritePickerDialog
      sprites={['player.png', 'coin.png', 'coinSpin.png']}
      images={{
        'player.png': image('data:player'),
        'coin.png': image('data:coin'),
        'coinSpin.png': image('data:coinSpin'),
      }}
      sheets={{'coinSpin.png': SHEET}}
      current="coin.png"
      onPick={vi.fn()}
      onImport={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );

describe('SpritePickerDialog', () => {
  it('offers every picture the project holds, showing each one', () => {
    open();

    for (const [name, src] of [
      ['player.png', 'data:player'],
      ['coin.png', 'data:coin'],
    ]) {
      const button = screen.getByRole('button', {name: new RegExp(name)});
      expect(button.querySelector('img')).toHaveAttribute('src', src);
    }
  });

  it('starts on the picture the frame already draws', () => {
    open();

    expect(screen.getByRole('button', {name: /coin\.png/})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: /player\.png/})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('says which of them are spritesheets', () => {
    open();

    expect(
      screen.getByRole('button', {name: /coinSpin\.png/}),
    ).toHaveAccessibleName(/Spritesheet/);
    expect(
      screen.getByRole('button', {name: /^player\.png/}),
    ).not.toHaveAccessibleName(/Spritesheet/);
  });

  it('waits for the primary button rather than picking on a click', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.click(screen.getByRole('button', {name: /player\.png/}));
    expect(onPick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: 'Use this picture'}));
    expect(onPick).toHaveBeenCalledWith('player.png');
  });

  it('takes a double click as the choice', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.dblClick(screen.getByRole('button', {name: /player\.png/}));
    expect(onPick).toHaveBeenCalledWith('player.png');
  });

  it('leads to the library when none of them is the one', () => {
    const onImport = vi.fn();
    open({onImport});

    fireEvent.click(screen.getByRole('button', {name: /Import a picture/}));
    expect(onImport).toHaveBeenCalled();
  });

  it('still offers the library when the project holds no pictures', () => {
    open({sprites: [], images: {}});

    expect(screen.getByText(/no pictures yet/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Import a picture/}),
    ).toBeEnabled();
  });
});

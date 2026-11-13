import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import ColorPicker from '@cdo/apps/pixelEditor/ColorPicker';
import {PaletteColor} from '@cdo/apps/pixelEditor/PixelEditor';
import {RGBA} from '@cdo/apps/pixelEditor/tools';

const BLUE: RGBA = [0, 155, 233, 255];
const RED: RGBA = [226, 52, 52, 255];
const PALETTE: PaletteColor[] = [
  {name: 'Blue', rgba: BLUE},
  {name: 'Red', rgba: RED},
];

describe('ColorPicker with a palette', () => {
  it('opens the palette from the color square, on the chosen color', () => {
    render(<ColorPicker color={RED} onChange={jest.fn()} palette={PALETTE} />);
    expect(screen.queryByRole('group', {name: 'Colors'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Choose color (C)'}));
    expect(screen.getByRole('group', {name: 'Colors'})).toBeTruthy();
    // The fixed colors alone: no spectrum and no transparent swatch.
    expect(screen.queryByLabelText('Color spectrum')).toBeNull();
    expect(screen.queryByRole('button', {name: 'Transparent'})).toBeNull();
    const red = screen.getByRole('button', {name: 'Red'});
    expect(red.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(red);
  });

  it('takes the color chosen and closes', () => {
    const onChange = jest.fn();
    render(<ColorPicker color={BLUE} onChange={onChange} palette={PALETTE} />);
    fireEvent.click(screen.getByRole('button', {name: 'Choose color (C)'}));
    fireEvent.click(screen.getByRole('button', {name: 'Red'}));
    expect(onChange).toHaveBeenCalledWith(RED);
    expect(screen.queryByRole('group', {name: 'Colors'})).toBeNull();
  });

  it('closes on Escape without changing the color, and tells the host it was cancelled', () => {
    const onChange = jest.fn();
    const onOpen = jest.fn();
    const onCancel = jest.fn();
    render(
      <ColorPicker
        color={BLUE}
        onChange={onChange}
        palette={PALETTE}
        onOpen={onOpen}
        onCancel={onCancel}
      />
    );
    // Looked up each time: the square is a new element once the popover is
    // open, since it drops its tooltip.
    const square = () => screen.getByRole('button', {name: 'Choose color (C)'});
    expect(square().getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(square());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(square().getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(screen.queryByRole('group', {name: 'Colors'})).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('opens with the C key only when focus is in the editor or on nothing', () => {
    render(
      <div>
        <button type="button">elsewhere</button>
        <div data-pixel-editor="">
          <ColorPicker color={BLUE} onChange={jest.fn()} palette={PALETTE} />
        </div>
      </div>
    );
    fireEvent.keyDown(screen.getByRole('button', {name: 'elsewhere'}), {
      key: 'c',
    });
    expect(screen.queryByRole('group', {name: 'Colors'})).toBeNull();
    fireEvent.keyDown(document.body, {key: 'c'});
    expect(screen.getByRole('group', {name: 'Colors'})).toBeTruthy();
  });
});

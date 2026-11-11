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

  it('closes on Escape without changing the color', () => {
    const onChange = jest.fn();
    render(<ColorPicker color={BLUE} onChange={onChange} palette={PALETTE} />);
    fireEvent.click(screen.getByRole('button', {name: 'Choose color (C)'}));
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(screen.queryByRole('group', {name: 'Colors'})).toBeNull();
    // Escape puts back the color the palette opened on.
    expect(onChange).toHaveBeenCalledWith(BLUE);
  });
});

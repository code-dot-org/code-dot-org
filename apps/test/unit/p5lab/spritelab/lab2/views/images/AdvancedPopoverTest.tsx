import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import AdvancedPopover, {
  DEFAULT_ADVANCED,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/AdvancedPopover';

jest.mock('@cdo/apps/pixelEditor/useThemeMode', () => () => 'light');

describe('AdvancedPopover', () => {
  it('opens on its button with focus in the prompt, and Escape closes it and returns focus', () => {
    const onChange = jest.fn();
    render(
      <AdvancedPopover
        imageType="sprite"
        settings={DEFAULT_ADVANCED}
        onChange={onChange}
        hasImage
      />
    );
    const button = screen.getByRole('button', {name: 'Advanced'});
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'images-advanced-popover');
    const prompt = screen.getByLabelText('Prompt (instead of the words)');
    expect(document.activeElement).toBe(prompt);
    fireEvent.change(prompt, {target: {value: 'a red key'}});
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_ADVANCED,
      prompt: 'a red key',
    });
    fireEvent.keyDown(prompt, {key: 'Escape'});
    expect(screen.queryByRole('dialog', {name: 'Advanced'})).toBeNull();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(button);
  });

  it('offers Start from this image only when there is an image', () => {
    render(
      <AdvancedPopover
        imageType="sprite"
        settings={DEFAULT_ADVANCED}
        onChange={jest.fn()}
        hasImage={false}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Advanced'}));
    expect(
      screen.getByLabelText('Start from this image (the prompt modifies it)')
    ).toBeDisabled();
  });
});

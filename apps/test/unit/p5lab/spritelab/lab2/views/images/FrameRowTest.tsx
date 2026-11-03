import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {CHARACTER_STRIP_POSES} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import FrameRow from '@cdo/apps/p5lab/spritelab/lab2/views/images/FrameRow';

// The tiles' pictures never arrive: the row is tested for its buttons.
jest.mock('@cdo/apps/imageUtils', () => ({
  toImage: () => new Promise(() => undefined),
}));

describe('FrameRow', () => {
  it('groups the frames under their poses, marks the chosen one, and opens another on click', () => {
    const onSelect = jest.fn();
    render(
      <FrameRow
        sheetSrc="data:sheet"
        frameSize={{x: 64, y: 64}}
        poses={CHARACTER_STRIP_POSES}
        count={5}
        selected={1}
        onSelect={onSelect}
      />
    );
    expect(
      screen
        .getAllByRole('group')
        .slice(1)
        .map(group => group.getAttribute('aria-label'))
    ).toEqual(['Idle', 'Walk', 'Jump']);
    expect(
      screen
        .getAllByRole('button')
        .map(button => button.getAttribute('aria-label'))
    ).toEqual(['Idle', 'Standing', 'Walk', 'Jump up', 'Jump down']);
    expect(screen.getByRole('button', {name: 'Standing'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', {name: 'Jump up'}));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});

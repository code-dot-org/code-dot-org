import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import FrameRow from '@cdo/apps/p5lab/spritelab/lab2/views/images/FrameRow';

describe('FrameRow', () => {
  it('names each frame for its pose, marks the one being drawn, and opens another on click', () => {
    const onSelect = jest.fn();
    render(
      <FrameRow
        sheetSrc="data:sheet"
        frameSize={{x: 64, y: 64}}
        count={5}
        selected={1}
        onSelect={onSelect}
      />
    );
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

import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import LearningDialog from '@cdo/apps/p5lab/spritelab/lab2/views/images/LearningDialog';

jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/images/ChunkyPicture', () => ({
  __esModule: true,
  default: () => <canvas data-chunky />,
}));

describe('LearningDialog', () => {
  it('walks four panels, back and forth, and is done on the last', () => {
    const onDone = jest.fn();
    render(
      <LearningDialog
        picture={{src: 'data:one'}}
        prompt="A happy cat"
        onDone={onDone}
      />
    );
    expect(
      screen.getByRole('alertdialog', {name: 'How AI made your image'})
    ).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Step 1 of 4');
    expect(screen.queryByRole('button', {name: 'Back'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(screen.getByText('A happy cat')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    expect(screen.getByRole('status').textContent).toBe('Step 1 of 4');
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(screen.getByRole('status').textContent).toBe('Step 4 of 4');
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

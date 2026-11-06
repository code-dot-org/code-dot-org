import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import LearningDialog, {
  richText,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/LearningDialog';

jest.mock(
  '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/ChunkyPicture',
  () => ({
    __esModule: true,
    default: () => <canvas data-chunky />,
  })
);

/** Presses Next until Got it shows, collecting each panel's heading. */
function readThrough(): string[] {
  const headings: string[] = [];
  for (;;) {
    headings.push(screen.getByRole('heading', {level: 3}).textContent ?? '');
    const next = screen.queryByRole('button', {name: 'Next'});
    if (!next) {
      return headings;
    }
    fireEvent.click(next);
  }
}

describe('LearningDialog', () => {
  it('walks five panels for a character, back and forth, and is done on the last', () => {
    const onDone = jest.fn();
    render(
      <LearningDialog
        picture={{src: 'data:one'}}
        prompt="A happy cat"
        imageType="sprite"
        onDone={onDone}
      />
    );
    expect(
      screen.getByRole('alertdialog', {name: 'How AI made your image'})
    ).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Step 1 of 5');
    expect(screen.queryByRole('button', {name: 'Back'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(screen.getByText('A happy cat')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    expect(screen.getByRole('status').textContent).toBe('Step 1 of 5');
    expect(readThrough()).toEqual([
      'AI learned from examples',
      'Your words guide the image',
      'From noise to picture',
      'Try another version',
      'Evaluate what the AI made',
    ]);
    expect(screen.getByRole('status').textContent).toBe('Step 5 of 5');
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('tells a background in six panels, with the thumbs as icons', () => {
    render(
      <LearningDialog
        picture={{src: 'data:one'}}
        prompt="A dark forest"
        imageType="background"
        onDone={jest.fn()}
      />
    );
    expect(readThrough()).toEqual([
      'AI learned from examples',
      'Your words guide the image',
      'From noise to picture',
      'Try another picture',
      'Evaluate the picture',
      'A background is a big job',
    ]);
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    expect(screen.getByRole('img', {name: 'thumbs up'})).toBeTruthy();
    expect(screen.getByRole('img', {name: 'thumbs down'})).toBeTruthy();
  });

  it('sets the starred runs of the copy in bold', () => {
    render(<p>{richText('Your *prompt* is the words, and [thumb up] too')}</p>);
    expect(screen.getByText('prompt').tagName).toBe('STRONG');
    expect(screen.getByRole('img', {name: 'thumbs up'})).toBeTruthy();
  });
});

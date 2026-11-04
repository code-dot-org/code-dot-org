import {act, render, screen} from '@testing-library/react';
import React from 'react';

import GeneratingSteps from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/GeneratingSteps';

describe('GeneratingSteps', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('lists every step at once', () => {
    render(<GeneratingSteps done={false} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('shows one step at a time, moving on by the clock and to the last when done', () => {
    const {rerender} = render(<GeneratingSteps done={false} single />);
    // The tick's "(done)" reads with each step but the last, which waits
    // for the picture.
    const shown = () =>
      screen.getAllByRole('listitem').map(item => item.textContent?.trim());
    expect(shown()).toEqual(['Reading your prompt (done)']);
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(shown()).toEqual(['Using patterns in training data (done)']);
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(shown()).toEqual(['Predicting']);
    rerender(<GeneratingSteps done single />);
    expect(shown()).toEqual(['Predicting (done)']);
  });
});

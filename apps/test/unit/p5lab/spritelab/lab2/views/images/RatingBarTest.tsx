import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import RatingBar from '@cdo/apps/p5lab/spritelab/lab2/views/images/RatingBar';

describe('RatingBar', () => {
  it('asks why after a thumb, takes any reasons, and is done on Done alone', () => {
    const onJudge = jest.fn();
    const onReasons = jest.fn();
    const {rerender} = render(
      <RatingBar verdict={null} onJudge={onJudge} onReasons={onReasons} />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Not so good'}));
    expect(onJudge).toHaveBeenCalledWith('down');
    rerender(
      <RatingBar verdict="down" onJudge={onJudge} onReasons={onReasons} />
    );
    expect(screen.getByRole('dialog', {name: 'What went wrong?'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: /close/i})).toBeNull();
    fireEvent.click(screen.getByLabelText("It doesn't match my words"));
    fireEvent.click(screen.getByLabelText('The colors are off'));
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(onReasons).toHaveBeenCalledWith(['mismatch', 'colors']);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(
      screen
        .getByRole('button', {name: 'Not so good'})
        .getAttribute('aria-pressed')
    ).toBe('true');
  });
});

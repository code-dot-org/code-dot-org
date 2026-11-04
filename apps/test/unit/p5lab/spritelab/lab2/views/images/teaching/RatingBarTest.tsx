import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import RatingBar from '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/RatingBar';

describe('RatingBar', () => {
  it('says the question is closed when it goes away with the question open', () => {
    const onAsking = jest.fn();
    const {unmount} = render(
      <RatingBar
        verdict={null}
        onJudge={jest.fn()}
        onReasons={jest.fn()}
        onAsking={onAsking}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Not so good'}));
    expect(onAsking).toHaveBeenLastCalledWith(true);
    unmount();
    expect(onAsking).toHaveBeenLastCalledWith(false);
  });

  it('asks why after a thumb, takes any reasons, and is done on Done alone', () => {
    const onJudge = jest.fn();
    const onReasons = jest.fn();
    const {rerender} = render(
      <RatingBar verdict={null} onJudge={onJudge} onReasons={onReasons} />
    );
    expect(screen.queryByRole('alertdialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Not so good'}));
    expect(onJudge).toHaveBeenCalledWith('down');
    rerender(
      <RatingBar verdict="down" onJudge={onJudge} onReasons={onReasons} />
    );
    expect(
      screen.getByRole('alertdialog', {name: 'What went wrong?'})
    ).toBeTruthy();
    // The dialog's close button records the picks like Done does.
    expect(screen.getByRole('button', {name: /close/i})).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Doesn't match my prompt"));
    fireEvent.click(screen.getByLabelText('Not what I expected'));
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(onReasons).toHaveBeenCalledWith(['mismatch', 'unexpected']);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(
      screen
        .getByRole('button', {name: 'Not so good'})
        .getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('offers Dismiss only when the host gives it one', () => {
    const onDismiss = jest.fn();
    const {rerender} = render(
      <RatingBar verdict={null} onJudge={jest.fn()} onReasons={jest.fn()} />
    );
    expect(screen.queryByRole('button', {name: 'Dismiss'})).toBeNull();
    rerender(
      <RatingBar
        verdict={null}
        onJudge={jest.fn()}
        onReasons={jest.fn()}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(onDismiss).toHaveBeenCalled();
  });
});

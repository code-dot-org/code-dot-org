import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import PlayControls from '@cdo/apps/p5lab/spritelab/lab2/views/components/PlayControls';

describe('PlayControls', () => {
  it('offers both restarts once the game has left its first scene', () => {
    const onRestartGame = jest.fn();
    const onRestartScene = jest.fn();
    render(
      <PlayControls
        onRestartGame={onRestartGame}
        onRestartScene={onRestartScene}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Restart scene'}));
    expect(onRestartScene).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', {name: 'Restart game'}));
    expect(onRestartGame).toHaveBeenCalledTimes(1);
  });

  it('offers only Restart game on the scene the game starts on', () => {
    render(<PlayControls onRestartGame={jest.fn()} />);
    expect(screen.getByRole('button', {name: 'Restart game'})).toBeVisible();
    expect(screen.queryByRole('button', {name: 'Restart scene'})).toBeNull();
  });

  it('offers only Restart scene on a level pinned to one scene', () => {
    render(<PlayControls onRestartScene={jest.fn()} />);
    expect(screen.getByRole('button', {name: 'Restart scene'})).toBeVisible();
    expect(screen.queryByRole('button', {name: 'Restart game'})).toBeNull();
  });
});

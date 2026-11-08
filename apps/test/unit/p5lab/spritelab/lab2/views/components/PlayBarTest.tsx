import {render, screen} from '@testing-library/react';
import React from 'react';

import RunButtons, {
  ArrowCross,
} from '@cdo/apps/p5lab/spritelab/lab2/views/components/PlayBar';

jest.mock('@cdo/apps/blockly/utils/useSetupBlockColor', () => ({
  useSetupBlockColor: () => null,
}));

const names = () =>
  screen
    .getAllByRole('button')
    .map(b => b.getAttribute('aria-label') || b.textContent?.trim());

describe('RunButtons', () => {
  it('offers Run when not playing', () => {
    render(<RunButtons playing={false} onPlay={jest.fn()} />);
    expect(names()).toEqual(['Run']);
  });

  it('offers Run game beside Run scene where the project has more than one scene', () => {
    const onPlayGame = jest.fn();
    render(
      <RunButtons playing={false} onPlay={jest.fn()} onPlayGame={onPlayGame} />
    );
    expect(names()).toEqual(['Run scene', 'Run game']);
    screen.getByRole('button', {name: 'Run game'}).click();
    expect(onPlayGame).toHaveBeenCalled();
  });

  it('shows one Run on the start scene, which runs the game', () => {
    const onPlayGame = jest.fn();
    render(
      <RunButtons
        playing={false}
        onPlay={jest.fn()}
        onPlayGame={onPlayGame}
        playSceneHidden
      />
    );
    expect(names()).toEqual(['Run']);
    expect(screen.queryByText('Run scene')).toBeNull();
    screen.getByRole('button', {name: 'Run'}).click();
    expect(onPlayGame).toHaveBeenCalled();
  });

  it('shows Reset while playing, and nothing with nowhere to go', () => {
    const onStop = jest.fn();
    const {rerender} = render(
      <RunButtons playing onPlay={jest.fn()} onStop={onStop} />
    );
    expect(names()).toEqual(['Reset']);
    screen.getByRole('button', {name: 'Reset'}).click();
    expect(onStop).toHaveBeenCalled();
    rerender(<RunButtons playing onPlay={jest.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('ArrowCross', () => {
  it('shows four arrows, the top one a jump under gravity', () => {
    const {rerender} = render(<ArrowCross arrows="jump" />);
    expect(names()).toEqual(['Jump', 'Left', 'Right', 'Down']);
    rerender(<ArrowCross arrows="steer" />);
    expect(names()).toEqual(['Up', 'Left', 'Right', 'Down']);
  });

  it('shows nothing for a scene with nothing to steer', () => {
    render(<ArrowCross arrows="none" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

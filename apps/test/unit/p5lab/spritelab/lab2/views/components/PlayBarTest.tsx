import {render, screen} from '@testing-library/react';
import React from 'react';

import PlayBar from '@cdo/apps/p5lab/spritelab/lab2/views/components/PlayBar';

jest.mock('@cdo/apps/blockly/utils/useSetupBlockColor', () => ({
  useSetupBlockColor: () => null,
}));

const names = () =>
  screen
    .getAllByRole('button')
    .map(b => b.getAttribute('aria-label') || b.textContent?.trim());

describe('PlayBar', () => {
  it('offers Play when not playing', () => {
    render(<PlayBar playing={false} arrows="jump" onPlay={jest.fn()} />);
    expect(names()).toEqual(['Play']);
  });

  it('offers World beside Play where the scene has a world', () => {
    const onEditWorld = jest.fn();
    render(
      <PlayBar
        playing={false}
        arrows="jump"
        onPlay={jest.fn()}
        onEditWorld={onEditWorld}
      />
    );
    expect(names()).toEqual(['World', 'Play']);
    screen.getByRole('button', {name: 'World'}).click();
    expect(onEditWorld).toHaveBeenCalled();
  });

  it('offers Done and Play while editing the world, Play alone without code', () => {
    const onDone = jest.fn();
    const {rerender} = render(
      <PlayBar
        playing={false}
        editing
        arrows="jump"
        onPlay={jest.fn()}
        onEditWorld={jest.fn()}
        onDone={onDone}
      />
    );
    expect(names()).toEqual(['Done', 'Play']);
    screen.getByRole('button', {name: 'Done'}).click();
    expect(onDone).toHaveBeenCalled();
    rerender(
      <PlayBar
        playing={false}
        editing
        arrows="jump"
        onPlay={jest.fn()}
        onEditWorld={jest.fn()}
      />
    );
    expect(names()).toEqual(['Play']);
  });

  it('shows Stop with the arrow set the scene wants', () => {
    const {rerender} = render(
      <PlayBar playing arrows="jump" onPlay={jest.fn()} onStop={jest.fn()} />
    );
    expect(names()).toEqual(['Stop', 'Left', 'Jump', 'Right']);
    rerender(
      <PlayBar playing arrows="steer" onPlay={jest.fn()} onStop={jest.fn()} />
    );
    expect(names()).toEqual(['Stop', 'Left', 'Right', 'Up', 'Down']);
  });

  it('shows Stop alone for a scene with nothing to steer', () => {
    render(
      <PlayBar playing arrows="none" onPlay={jest.fn()} onStop={jest.fn()} />
    );
    expect(names()).toEqual(['Stop']);
  });
});

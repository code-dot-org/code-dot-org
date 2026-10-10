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

  it('shows Stop with the arrow set the scene wants', () => {
    const {rerender} = render(
      <PlayBar playing arrows="jump" onPlay={jest.fn()} onStop={jest.fn()} />
    );
    expect(names()).toEqual(['Stop', 'Left', 'Jump', 'Right']);
    rerender(
      <PlayBar playing arrows="climb" onPlay={jest.fn()} onStop={jest.fn()} />
    );
    expect(names()).toEqual(['Stop', 'Left', 'Jump', 'Right', 'Down']);
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

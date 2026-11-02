import {render} from '@testing-library/react';
import React from 'react';

import {EMPTY_RUNTIME} from '@cdo/apps/p5lab/spritelab/lab2/objectives';
import {useObjectives} from '@cdo/apps/p5lab/spritelab/lab2/views/useObjectives';

const OBJECTIVES = {
  title: 'Play',
  items: [
    {id: 'play', text: 'Press Play.', check: {kind: 'play' as const}},
    {id: 'rate', text: 'Rate it.', check: {kind: 'rated' as const}},
  ],
};
const IMAGES = {sprite: 0, background: 0, block: 0};

function Checklist({everPlayed}: {everPlayed: boolean}) {
  const state = useObjectives({
    objectives: OBJECTIVES,
    images: IMAGES,
    // A fresh grid every render, as a scene with no saved world gets.
    grid: [[null]],
    imagesForRole: {},
    everPlayed,
    rated: false,
    runtime: EMPTY_RUNTIME,
  });
  return <div>{state.items.map(i => `${i.id}:${i.done}`).join(' ')}</div>;
}

describe('useObjectives', () => {
  it('sets state only when a new item holds, whatever the inputs do', () => {
    // Count every state setter call the hook makes.
    const realUseState = React.useState;
    let setCalls = 0;
    const spy = jest.spyOn(React, 'useState').mockImplementation(((
      initial: unknown
    ) => {
      const [value, set] = realUseState(initial);
      return [value, (next: unknown) => (setCalls++, set(next))];
    }) as typeof React.useState);
    try {
      const view = render(<Checklist everPlayed={false} />);
      expect(view.container.textContent).toBe('play:false rate:false');
      expect(setCalls).toBe(0);
      view.rerender(<Checklist everPlayed={true} />);
      expect(view.container.textContent).toBe('play:true rate:false');
      expect(setCalls).toBe(1);
      view.rerender(<Checklist everPlayed={true} />);
      expect(setCalls).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

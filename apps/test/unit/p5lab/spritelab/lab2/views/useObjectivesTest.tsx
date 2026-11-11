import {render} from '@testing-library/react';
import React from 'react';

import {EMPTY_RUNTIME} from '@cdo/apps/p5lab/spritelab/lab2/objectives';
import {useObjectives} from '@cdo/apps/p5lab/spritelab/lab2/views/useObjectives';

const OBJECTIVES = {
  title: 'Play',
  items: [
    {id: 'play', text: 'Press Play.', check: {kind: 'play' as const}},
    {
      id: 'rate',
      text: 'Rate it.',
      check: {kind: 'rated' as const},
      shownWhen: {kind: 'generated' as const},
    },
  ],
};
const IMAGES = {sprite: 0, background: 0, block: 0};
const ONE_SPRITE = {sprite: 1, background: 0, block: 0};

function Checklist({
  everPlayed,
  generated = true,
  rated = false,
  completedBefore = false,
}: {
  everPlayed: boolean;
  generated?: boolean;
  rated?: boolean;
  completedBefore?: boolean;
}) {
  const state = useObjectives({
    objectives: OBJECTIVES,
    images: IMAGES,
    // A fresh grid every render, as a scene with no saved world gets.
    grid: [[null]],
    imagesForRole: {},
    everPlayed,
    generated: generated ? ONE_SPRITE : IMAGES,
    rated,
    runtime: EMPTY_RUNTIME,
    completedBefore,
  });
  return (
    <div>
      {state.items.map(i => `${i.id}:${i.done}`).join(' ')}
      {state.allDone && ' all'}
    </div>
  );
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

  it('keeps an item out until its shownWhen check holds, then keeps it', () => {
    const view = render(<Checklist everPlayed={true} generated={false} />);
    expect(view.container.textContent).toBe('play:true all');
    view.rerender(<Checklist everPlayed={true} generated={true} />);
    expect(view.container.textContent).toBe('play:true rate:false');
    // The check can stop holding, as a hand edit clears a picture's
    // generation record; the item stays.
    view.rerender(<Checklist everPlayed={true} generated={false} />);
    expect(view.container.textContent).toBe('play:true rate:false');
    view.rerender(<Checklist everPlayed={true} generated={true} rated />);
    expect(view.container.textContent).toBe('play:true rate:true all');
  });

  it('ticks the steps about an earlier visit when the level was completed before', () => {
    // Nothing done on this visit, and the level's progress has not arrived.
    const view = render(<Checklist everPlayed={false} generated={false} />);
    expect(view.container.textContent).toBe('play:false');
    // The progress arrives: the level was completed on an earlier visit.
    view.rerender(
      <Checklist everPlayed={false} generated={false} completedBefore />
    );
    expect(view.container.textContent).toBe('play:true all');
  });

  it('keeps both kinds of tick when a completed level opens with work already in the project', () => {
    // One step is read from the project and one is about the earlier
    // visit. Both are found on the first pass, by separate updates.
    function Both() {
      const state = useObjectives({
        objectives: {
          items: [
            {id: 'place', text: '', check: {kind: 'world' as const}},
            {id: 'play', text: '', check: {kind: 'play' as const}},
          ],
        },
        images: IMAGES,
        grid: [[{image: 'Hero', kind: 'sprite' as const}]],
        imagesForRole: {},
        everPlayed: false,
        generated: IMAGES,
        rated: false,
        runtime: EMPTY_RUNTIME,
        completedBefore: true,
      });
      return <div>{state.items.map(i => `${i.id}:${i.done}`).join(' ')}</div>;
    }
    const view = render(<Both />);
    expect(view.container.textContent).toBe('place:true play:true');
  });
});

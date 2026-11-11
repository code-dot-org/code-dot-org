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
}: {
  everPlayed: boolean;
  generated?: boolean;
  rated?: boolean;
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
  });
  return (
    <div>
      {state.items.map(i => `${i.id}:${i.done}`).join(' ')}
      {state.allDone && ' all'}
    </div>
  );
}

// A checklist whose first item is about lasting work: placing something in
// the world. Its second records something that happened.
const WORK_OBJECTIVES = {
  items: [
    {id: 'place', text: 'Place something.', check: {kind: 'world' as const}},
    {id: 'play', text: 'Press Play.', check: {kind: 'play' as const}},
  ],
};
const PLACED = [[{image: 'Hero', kind: 'sprite' as const}]];
const EMPTY = [[null]];

function WorkChecklist({
  placed,
  everPlayed,
}: {
  placed: boolean;
  everPlayed: boolean;
}) {
  const state = useObjectives({
    objectives: WORK_OBJECTIVES,
    images: IMAGES,
    grid: placed ? PLACED : EMPTY,
    imagesForRole: {},
    everPlayed,
    generated: IMAGES,
    rated: false,
    runtime: EMPTY_RUNTIME,
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

  it('un-ticks an item about lasting work when the work is undone, and keeps other items ticked', () => {
    const view = render(<WorkChecklist placed={true} everPlayed={true} />);
    expect(view.container.textContent).toBe('place:true play:true all');
    // The placed thing is removed, so its item un-ticks. Pressing Play is
    // something that happened, so its item stays ticked.
    view.rerender(<WorkChecklist placed={false} everPlayed={false} />);
    expect(view.container.textContent).toBe('place:false play:true');
    // Placed again: ticked again.
    view.rerender(<WorkChecklist placed={true} everPlayed={false} />);
    expect(view.container.textContent).toBe('place:true play:true all');
  });
});

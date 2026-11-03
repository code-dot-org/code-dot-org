// An actor's drawing and its steps, compiled from its data
// (specs/DRAWING_PAGE_PLAN.md, step 1).

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import type {ActorData} from '../../actors/actorData';
import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';

const widthOfMe = {
  shadow: {type: 'math_number', fields: {NUM: 32}},
  block: {
    type: 'world_get_Boxed_WidthProperty',
    inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
  },
};
const eight = {shadow: {type: 'math_number', fields: {NUM: 8}}};
const pen = {
  type: 'world_pen_fill',
  inputs: {
    COLOR: {shadow: {type: 'colour_picker', fields: {COLOUR: '#ff0000'}}},
  },
};
const work = {
  type: 'world_print',
  inputs: {VALUE: {shadow: {type: 'text', fields: {TEXT: 'hi'}}}},
};

const generate = async (data: ActorData): Promise<string> => {
  const ref = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={ref} />);
  await new Promise(resolve => setTimeout(resolve, 50));
  return ref.current!.generate(JSON.stringify(data), 'actors/stamp.actor');
};

describe('an actor’s drawing and steps, as data', () => {
  it('compile as the rows they stand for did', async () => {
    const asRows = await generate({
      type: 'actor',
      name: 'Stamp',
      blocks: {
        blocks: {
          languageVersion: 0,
          blocks: [
            {
              type: 'world_define_drawing',
              inputs: {WIDTH: widthOfMe, HEIGHT: eight, DO: {block: pen}},
            },
            {
              type: 'world_trait_step',
              fields: {PHASE: 'react', NAME: 'blink'},
              inputs: {DO: {block: work}},
            },
          ],
        },
      },
    });
    const asData = await generate({
      type: 'actor',
      name: 'Stamp',
      drawing: {width: widthOfMe, height: eight, body: pen},
      steps: [{name: 'blink', phase: 'react', body: work}],
    });

    expect(asData).toContain('actor.defineDrawing((actor, world) => ');
    expect(asData).toContain('actor.defineStep("blink", "react", ');
    expect(asData).toBe(asRows);
  });

  it('draw and step with nothing below the head', async () => {
    const js = await generate({
      type: 'actor',
      name: 'Stamp',
      drawing: {width: eight, height: eight},
      steps: [{name: 'wait'}],
    });

    expect(js).toContain(
      'actor.defineDrawing((actor, world) => 8, (actor, world) => 8, ' +
        '(actor, pen, world) => {\n});',
    );
    expect(js).toContain('actor.defineStep("wait", "decide", ');
  });
});

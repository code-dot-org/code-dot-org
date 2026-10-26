// An actor made from nothing, for a game or for an interface
// (specs/PURPOSE_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import {viewOf} from '../../actorData';
import {purposeOf} from '../../actorPurpose';
import {NEW_INTERFACE_BOX, newActorFile} from '../newActor';

describe('an actor made from nothing', () => {
  it('for a game, is data saying so, and nothing else yet', () => {
    const data = JSON.parse(newActorFile('Chaser', 'game'));
    expect(data).toMatchObject({type: 'actor', name: 'Chaser', for: 'game'});
    expect(data.traits).toBeUndefined();
  });

  it('for an interface, has a box and a drawing the size of it', () => {
    const contents = newActorFile('Badge', 'interface');
    const data = JSON.parse(contents);
    expect(purposeOf(contents)).toBe('interface');
    expect(data.traits).toEqual(['Boxed#HasABoxTrait']);
    expect(data.values).toEqual([
      {
        setter: 'world_set_Boxed_WidthProperty',
        type: 'number',
        value: NEW_INTERFACE_BOX.width,
      },
      {
        setter: 'world_set_Boxed_HeightProperty',
        type: 'number',
        value: NEW_INTERFACE_BOX.height,
      },
    ]);
    // The drawing is a root of its code, sized by the box rather than by
    // two numbers.
    const [drawing] = data.blocks.blocks.blocks;
    expect(drawing.type).toBe('world_define_drawing');
    expect(drawing.inputs.WIDTH.block.type).toBe(
      'world_get_Boxed_WidthProperty',
    );
    expect(drawing.inputs.HEIGHT.block.type).toBe(
      'world_get_Boxed_HeightProperty',
    );
    // …and its view is a define actor, as every reader wants.
    expect(viewOf(contents)).toContain('"world_actor"');
  });
});

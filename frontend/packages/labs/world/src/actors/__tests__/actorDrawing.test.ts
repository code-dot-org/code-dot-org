// An actor's drawing on its page, and the drawing it inherits
// (specs/DRAWING_PAGE_PLAN.md).

import {describe, expect, it} from 'vitest';

import {DRAWING_HEAD} from '../../blockly/pageHeads';
import type {ActorData} from '../actorData';
import {
  drawingDocument,
  drawOwn,
  inheritedDrawing,
  withDrawingDocument,
} from '../actorDrawing';

const eight = {shadow: {type: 'math_number', fields: {NUM: 8}}};
const fill = {type: 'world_pen_fill'};
const stamp: ActorData = {
  type: 'actor',
  name: 'Stamp',
  drawing: {width: eight, height: eight, body: fill},
  blocks: {variables: [{id: 'v', name: 'n', type: 'Number'}]},
};

describe('a drawing’s page', () => {
  it('is its head, the sizes in its sockets and the body below', () => {
    const page = JSON.parse(drawingDocument(stamp));
    expect(page.blocks.blocks).toEqual([
      expect.objectContaining({
        type: DRAWING_HEAD,
        fields: {NAME: 'Stamp'},
        inputs: {WIDTH: eight, HEIGHT: eight},
        next: {block: fill},
      }),
    ]);
    expect(page.variables).toEqual(stamp.blocks!.variables);
  });

  it('writes back what was saved, and is the same data when nothing was', () => {
    const page = JSON.parse(drawingDocument(stamp));
    expect(withDrawingDocument(stamp, JSON.stringify(page))).toBe(stamp);

    const wider = {shadow: {type: 'math_number', fields: {NUM: 40}}};
    page.blocks.blocks[0].inputs.WIDTH = wider;
    delete page.blocks.blocks[0].next;
    expect(withDrawingDocument(stamp, JSON.stringify(page)).drawing).toEqual({
      width: wider,
      height: eight,
    });
  });

  it('is not read from a workspace with no head', () => {
    expect(withDrawingDocument(stamp, '{"blocks":{"blocks":[]}}')).toBe(stamp);
    expect(withDrawingDocument(stamp, 'not json')).toBe(stamp);
  });
});

describe('a drawing inherited', () => {
  const files = {
    'actors/label.actor': JSON.stringify(stamp),
    'actors/button.actor': JSON.stringify({
      type: 'actor',
      name: 'Button',
      actsLike: 'actors/label',
    }),
    'actors/big.actor': JSON.stringify({
      type: 'actor',
      name: 'Big',
      actsLike: 'actors/button',
    }),
  };

  it('is the nearest drawing among what it acts like', () => {
    expect(inheritedDrawing(files, 'actors/big')).toMatchObject({
      name: 'Stamp',
      drawing: stamp.drawing,
    });
    expect(inheritedDrawing(files, 'actors/label')).toBeUndefined();
  });

  it('is copied to draw its own, with the variables the copy names', () => {
    const named = {
      ...stamp,
      drawing: {
        ...stamp.drawing!,
        body: {type: 'variables_get_Number', fields: {VAR: {id: 'v'}}},
      },
    };
    const inherited = inheritedDrawing(
      {...files, 'actors/label.actor': JSON.stringify(named)},
      'actors/button',
    );
    const button: ActorData = {type: 'actor', name: 'Button'};
    const own = drawOwn(button, inherited);
    expect(own.drawing).toEqual(named.drawing);
    expect(own.drawing).not.toBe(named.drawing);
    expect(own.blocks?.variables).toEqual(stamp.blocks!.variables);
  });

  it('is a blank drawing as big as the box, for an actor with one', () => {
    const own = drawOwn({
      type: 'actor',
      name: 'Card',
      traits: ['Boxed#HasABoxTrait'],
    });
    expect(own.drawing!.width.block?.type).toBe(
      'world_get_Boxed_WidthProperty',
    );
    expect(own.drawing!.height.block?.type).toBe(
      'world_get_Boxed_HeightProperty',
    );
  });

  it('is a blank drawing when there is none to copy', () => {
    const own = drawOwn({type: 'actor', name: 'Rock'});
    expect(own.drawing).toEqual({
      width: {shadow: {type: 'math_number', fields: {NUM: 32}}},
      height: {shadow: {type: 'math_number', fields: {NUM: 32}}},
    });
  });
});

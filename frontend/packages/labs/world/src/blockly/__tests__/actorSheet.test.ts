// An actor as the compiler loads it, from its data
// (specs/COMPILE_FROM_DATA_PLAN.md, 5c step 5).

import {describe, expect, it} from 'vitest';

import {stillAnimation, type ActorData} from '../../actors/actorData';
import {actorSheet} from '../actorSheet';
import {MEMBER_HEAD} from '../bodySurfaces';

const say = {type: 'world_say'};
const nudge = [
  {kind: 'label' as const, text: 'nudge by'},
  {kind: 'param' as const, type: 'number', var: 'v1'},
];
const walk = {
  loop: true,
  tracks: {
    sprite: [
      {at: 0, value: 'a.png'},
      {at: 0.5, value: 'b.png'},
    ],
  },
};

const ball: ActorData = {
  type: 'actor',
  name: 'Ball',
  actsLike: 'actors/toy',
  isData: true,
  icon: 'text',
  animations: {Main: stillAnimation('ball.png'), Walk: walk},
  traits: ['Physics#CanMoveTrait'],
  properties: [{name: 'bounces', type: 'number', access: 'writable'}],
  values: [
    {setter: 'world_set_Physics_SpeedProperty', type: 'number', value: 3},
  ],
  effects: [
    {effect: 'effects/glow', on: true},
    {effect: 'effects/ripple', on: false},
  ],
  members: [
    {id: 'e1', kind: 'event', parts: [{kind: 'label', text: 'bounced'}]},
    {id: 'b1', kind: 'block', parts: nudge, body: say},
    {
      id: 'b2',
      kind: 'block',
      parts: [{kind: 'label', text: 'speed'}],
      returns: 'number',
    },
  ],
  blocks: {
    variables: [{id: 'v1', name: 'amount', type: 'Number'}],
    blocks: {
      languageVersion: 0,
      blocks: [
        {type: 'world_define_drawing', x: 20, y: 20},
        {type: 'world_on_Space_CreatedEvent'},
      ],
    },
  },
};

const rootsOf = (workspace: Record<string, unknown>) =>
  (workspace.blocks as {blocks: Array<Record<string, unknown>>}).blocks;

/** The types chained under the `define actor`, top to bottom. */
const rowsOf = (workspace: Record<string, unknown>) => {
  const types: string[] = [];
  for (
    let at = (rootsOf(workspace)[0].next as {block?: Record<string, unknown>})
      ?.block;
    at;
    at = (at.next as {block?: Record<string, unknown>})?.block
  ) {
    types.push(at.type as string);
  }
  return types;
};

describe('an actor’s sheet', () => {
  const sheet = actorSheet(ball);

  it('says what the actor is from the data, in the order a view has it', () => {
    expect(sheet.pieces.map(piece => piece.kind)).toEqual([
      'actsLike',
      'isData',
      'animations',
      'row',
      'trait',
      'row',
      'row',
      'event',
      'block',
      'block',
      'row',
    ]);
    expect(sheet.pieces[0]).toEqual({kind: 'actsLike', actor: 'actors/toy'});
    expect(sheet.pieces[4]).toEqual({
      kind: 'trait',
      trait: 'Physics#CanMoveTrait',
    });
  });

  it('plays only what moves, and sets a still Main as a picture', () => {
    expect(sheet.pieces[2]).toEqual({
      kind: 'animations',
      animations: {Walk: walk},
    });
    expect(rowsOf(sheet.workspace)[0]).toBe('world_set_sprite');
  });

  it('loads as rows only what is code: picture, values, effects on, code', () => {
    expect(rowsOf(sheet.workspace)).toEqual([
      'world_set_sprite',
      'world_set_Physics_SpeedProperty',
      'world_add_effect',
      'world_define_drawing',
    ]);
    expect(rootsOf(sheet.workspace)[0]).toMatchObject({
      type: 'world_actor',
      fields: {NAME: 'Ball'},
    });
  });

  it('hangs a block’s body under its head, and a reporter’s nowhere', () => {
    const heads = rootsOf(sheet.workspace).filter(
      root => root.type === MEMBER_HEAD,
    );
    expect(heads).toEqual([
      expect.objectContaining({
        id: (sheet.pieces[8] as {head: string}).head,
        extraState: {parts: nudge},
        next: {block: say},
      }),
    ]);
    expect(sheet.pieces[9]).not.toHaveProperty('head');
  });

  it('keeps the handlers beside the actor, and the variables', () => {
    expect(rootsOf(sheet.workspace)[1]).toEqual({
      type: 'world_on_Space_CreatedEvent',
    });
    expect(sheet.workspace.variables).toEqual(ball.blocks!.variables);
  });

  it('is a bare `define actor` for an actor with nothing in it', () => {
    const bare = actorSheet({type: 'actor', name: 'Rock'});
    expect(bare.pieces).toEqual([]);
    expect(rootsOf(bare.workspace)).toEqual([
      {type: 'world_actor', x: 20, y: 20, fields: {NAME: 'Rock'}},
    ]);
  });
});

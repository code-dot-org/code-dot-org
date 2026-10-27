// An actor as the compiler loads it (specs/COMPILE_FROM_DATA_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import {actorSheet} from '../actorSheet';
import {MEMBER_HEAD} from '../bodySurfaces';

const say = {type: 'world_say'};
const nudge = [
  {kind: 'label', text: 'nudge by'},
  {kind: 'param', type: 'number', var: 'v1'},
];

/** `define actor Ball` over these rows, and a handler beside it. */
const view = (...rows: object[]) => ({
  variables: [{id: 'v1', name: 'amount', type: 'Number'}],
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Ball'},
        ...rows.reduceRight<object>(
          (below, row) => ({next: {block: {...row, ...below}}}),
          {},
        ),
      },
      {type: 'world_on_Space_CreatedEvent'},
    ],
  },
});

const rowsOf = (workspace: Record<string, unknown>) => {
  const roots = (workspace.blocks as {blocks: Array<Record<string, unknown>>})
    .blocks;
  const types: string[] = [];
  for (
    let at = (roots[0].next as {block?: Record<string, unknown>})?.block;
    at;
    at = (at.next as {block?: Record<string, unknown>})?.block
  ) {
    types.push(at.type as string);
  }
  return {roots, types};
};

describe('an actor’s sheet', () => {
  const sheet = actorSheet(
    view(
      {type: 'world_acts_like', fields: {ACTOR: 'actors/ball'}},
      {type: 'world_use_trait', fields: {TRAIT: 'Physics#CanMoveTrait'}},
      {
        type: 'world_rule_event',
        extraState: {parts: [{kind: 'label', text: 'bounced'}]},
      },
      {
        type: 'world_rule_block',
        fields: {RETURNS: 'none'},
        extraState: {parts: nudge},
        inputs: {DO: {block: say}},
      },
      {
        type: 'world_rule_block',
        fields: {RETURNS: 'number'},
        extraState: {parts: [{kind: 'label', text: 'speed'}]},
      },
      {type: 'world_define_drawing'},
    ),
  );

  it('says its traits, events and blocks where its rows had them', () => {
    expect(sheet.pieces.map(piece => piece.kind)).toEqual([
      'row',
      'trait',
      'event',
      'block',
      'block',
      'row',
    ]);
    expect(sheet.pieces[1]).toEqual({
      kind: 'trait',
      trait: 'Physics#CanMoveTrait',
    });
  });

  it('keeps every other row in the chain, in order', () => {
    expect(rowsOf(sheet.workspace).types).toEqual([
      'world_acts_like',
      'world_define_drawing',
    ]);
  });

  it('hangs a block’s body under its head, and a reporter’s nowhere', () => {
    const {roots} = rowsOf(sheet.workspace);
    const heads = roots.filter(root => root.type === MEMBER_HEAD);
    expect(heads).toEqual([
      expect.objectContaining({
        id: (sheet.pieces[3] as {head: string}).head,
        extraState: {parts: nudge},
        next: {block: say},
      }),
    ]);
    expect(sheet.pieces[4]).not.toHaveProperty('head');
  });

  it('leaves the handlers and the variables as they are', () => {
    const {roots} = rowsOf(sheet.workspace);
    expect(roots[1]).toEqual({type: 'world_on_Space_CreatedEvent'});
    expect(sheet.workspace.variables).toEqual(view().variables);
  });

  it('is the file as it is when there is no actor in it', () => {
    const file = {blocks: {blocks: [{type: 'world_world'}]}};
    expect(actorSheet(file)).toEqual({workspace: file, pieces: []});
  });
});

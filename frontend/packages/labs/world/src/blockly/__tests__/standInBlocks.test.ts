// A block whose rule the project has not got, so that the file still opens.
//
// The failure this replaces is total: Blockly refuses to deserialize a type it
// does not know, so `player.actor` — one dead `is on the ground?` in it —
// rendered nothing at all. Not a broken block in a working file. No file.
//
// What a stand-in has to get right is therefore not what it DOES (it does
// nothing) but what it IS: the same fields, the same sockets, and a shape that
// will connect where the block it stands in for was connected. Get any of those
// wrong and the file either fails to load or loads and saves back smaller.

import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {standInBlocks} from '../standInBlocks';

/** A `.actor` holding a hat from a rule that is gone, with a body under it. */
const FILE = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_on_Gravity_StartsFallingEvent',
        id: 'hat',
        fields: {FILTER0: 'space'},
        inputs: {ACTOR: {block: {type: 'world_this_actor', id: 'me'}}},
        next: {block: {type: 'world_log', id: 'log', fields: {TEXT: 'oh'}}},
      },
    ],
  },
});

/** Everything the lab and Blockly already define, for this file. */
const KNOWN = new Set(['world_this_actor', 'world_log']);

describe('standInBlocks', () => {
  it('defines the types nothing else does, and only those', () => {
    const made = standInBlocks([FILE], KNOWN);

    expect(made.map(block => block.type)).toEqual([
      'world_on_Gravity_StartsFallingEvent',
    ]);
  });

  it('leaves Blockly’s own blocks alone', () => {
    // The bug this caught in the browser: `defined` is what the PALETTE mints,
    // and `controls_if` is not in it — Blockly registers its own. A stand-in
    // for `controls_if` gets a value socket where `DO0` should be, and the
    // first statement inside it refuses to connect.
    const file = JSON.stringify({
      blocks: {blocks: [{type: 'controls_if', inputs: {DO0: {block: {}}}}]},
    });

    expect(standInBlocks([file], new Set())).toEqual([]);
  });

  it('keeps the fields and sockets the file is holding', () => {
    // What makes the round trip lossless: a field it does not declare is
    // dropped on load, and a socket it does not declare takes the block in it
    // with it.
    const [hat] = standInBlocks([FILE], KNOWN);
    const args = (hat.args0 ?? []) as Array<{type: string; name?: string}>;

    expect(args).toEqual([
      // Serializable, so the value survives being loaded and saved by a
      // definition that cannot offer the choices it came from.
      {type: 'field_label_serializable', name: 'FILTER0', text: ''},
      {type: 'input_value', name: 'ACTOR'},
    ]);
  });

  it('is a statement at the top of a file and a value in a socket', () => {
    // Nothing in the serialized state says which; where the block SITS does.
    const [hat] = standInBlocks([FILE], KNOWN);
    expect(hat.previousStatement).toBe(true);
    expect(hat.output).toBeUndefined();

    const inSocket = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'controls_if',
            inputs: {
              IF0: {block: {type: 'world_query_Gravity_IsOnTheGroundQuery'}},
            },
          },
        ],
      },
    });
    const [query] = standInBlocks([inSocket], new Set(['controls_if']));

    expect(query.output).toBeNull();
    expect(query.previousStatement).toBeUndefined();
  });

  it('reads a statement input by the company it keeps', () => {
    // A statement input's child is serialized exactly like a value input's, so
    // the name and the child's own `next` are all there is to go on.
    const file = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'controls_if',
            inputs: {DO0: {block: {type: 'world_do_Gravity_InvertAction'}}},
          },
        ],
      },
    });
    const [action] = standInBlocks([file], new Set(['controls_if']));

    expect(action.previousStatement).toBe(true);
    expect(action.output).toBeUndefined();
  });

  it('generates nothing, and the emptiest value where one is wanted', () => {
    const [hat] = standInBlocks([FILE], KNOWN);
    expect(
      hat.generator.javascript({} as never, {} as never, {} as never),
    ).toBe('');

    const inSocket = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'x',
            inputs: {A: {block: {type: 'world_query_Gone_WhatQuery'}}},
          },
        ],
      },
    });
    const [query] = standInBlocks([inSocket], new Set(['x']));

    expect(
      query.generator.javascript({} as never, {} as never, {} as never),
    ).toEqual(['null', 0]);
  });

  it('says whose block it was, on the face of it', () => {
    // Read back out of the type, which is the only place the name survives —
    // and split on its capitals again, since the slug had its spaces removed.
    const file = JSON.stringify({
      blocks: {blocks: [{type: 'world_on_ArrowKeys_MovesEvent'}]},
    });
    const [block] = standInBlocks([file], new Set());

    expect(block.message0).toBe('moves');
  });

  it('loads and saves the file back unchanged', () => {
    // The whole claim, end to end. Register the synthesised definitions, load
    // the file, save it: what comes out is what went in.
    const made = standInBlocks([FILE], KNOWN);
    Blockly.defineBlocksWithJsonArray(
      made.map(({type, message0, args0, previousStatement, nextStatement}) => ({
        type,
        message0,
        args0,
        previousStatement: previousStatement ? null : undefined,
        nextStatement: nextStatement ? null : undefined,
      })),
    );
    Blockly.defineBlocksWithJsonArray([
      {type: 'world_this_actor', message0: 'this actor', output: null},
      {
        type: 'world_log',
        message0: 'log %1',
        args0: [{type: 'field_input', name: 'TEXT', text: ''}],
        previousStatement: null,
        nextStatement: null,
      },
    ]);

    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(JSON.parse(FILE), workspace);
    const saved = Blockly.serialization.workspaces.save(workspace) as {
      blocks: {blocks: unknown[]};
    };

    // Minus the coordinates, which Blockly writes for every top-level block
    // whether or not it was given any — a fact about saving, not about this.
    const placed = saved.blocks.blocks.map(block => {
      const {x, y, ...rest} = block as {x?: number; y?: number};
      void x;
      void y;
      return rest;
    });

    expect(placed).toEqual(JSON.parse(FILE).blocks.blocks);
  });
});

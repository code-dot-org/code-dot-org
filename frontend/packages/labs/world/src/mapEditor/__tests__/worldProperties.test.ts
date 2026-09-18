// A world's name and properties, read and written without a workspace
// (`worldProperties`, specs/MAIN_MAP_PLAN.md).

import {describe, expect, it} from 'vitest';

import {
  readWorldHeader,
  writeWorldName,
  writeWorldPropertyDefault,
} from '../worldProperties';

const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'Tapper'},
        next: {
          block: {
            type: 'world_rule_property',
            fields: {
              TYPE: 'number',
              ACCESS: 'writable',
              NAME: 'score',
              DEFAULT: '0',
            },
            next: {
              block: {
                type: 'world_rule_property',
                fields: {TYPE: 'boolean', NAME: 'hard', DEFAULT: 'false'},
                next: {
                  block: {type: 'world_load_map', fields: {MAP: 'maps/level1'}},
                },
              },
            },
          },
        },
      },
      {type: 'world_on_Input_IsPressedEvent', fields: {FILTER0: 'p'}},
    ],
  },
  map: {actors: []},
});

describe('readWorldHeader', () => {
  it('is the world’s name and its define-property rows', () => {
    expect(readWorldHeader(WORLD)).toEqual({
      name: 'Tapper',
      properties: [
        {name: 'score', type: 'number', value: '0'},
        {name: 'hard', type: 'boolean', value: 'false'},
      ],
    });
  });

  it('is nothing for a file with no world in it', () => {
    expect(readWorldHeader('{"blocks":{"blocks":[]}}')).toBeUndefined();
    expect(readWorldHeader('{broken')).toBeUndefined();
  });
});

describe('writing the header back', () => {
  it('renames the world and leaves the rest as it was', () => {
    const written = writeWorldName(WORLD, 'Clicker');
    expect(readWorldHeader(written)!.name).toBe('Clicker');
    const parsed = JSON.parse(written);
    expect(parsed.map).toEqual({actors: []});
    expect(parsed.blocks.blocks[1].type).toBe('world_on_Input_IsPressedEvent');
  });

  it('sets one property’s starting value', () => {
    const written = writeWorldPropertyDefault(WORLD, 'score', '30');
    expect(readWorldHeader(written)!.properties).toEqual([
      {name: 'score', type: 'number', value: '30'},
      {name: 'hard', type: 'boolean', value: 'false'},
    ]);
  });

  it('leaves a file alone that has no such property, or no world', () => {
    expect(writeWorldPropertyDefault(WORLD, 'lives', '3')).toBe(WORLD);
    expect(writeWorldName('{broken', 'X')).toBe('{broken');
  });
});

// A world's name and properties, read and written without a workspace
// (`worldProperties`, specs/MAIN_MAP_PLAN.md).

import {describe, expect, it} from 'vitest';

import {
  readWorldHeader,
  writeWorldBackgroundColor,
  writeWorldName,
  writeWorldRuleValue,
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
      // No `set background color` row: the engine's own.
      backgroundColor: {color: undefined, inCode: false},
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

describe('a rule’s world property', () => {
  const TARGET = {
    setter: 'world_set_Scoring_TargetScoreProperty',
    name: 'target score',
    type: 'number',
    rule: 'Scoring',
    default: '0',
  };

  /** A world with the rows given, as a file. */
  const world = (rows: object[] = []): string => {
    const chained = rows.reduceRight<object | undefined>(
      (next, row) => ({...row, ...(next ? {next: {block: next}} : {})}),
      undefined,
    );
    return JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            fields: {NAME: 'My World'},
            ...(chained ? {next: {block: chained}} : {}),
          },
        ],
      },
    });
  };
  const setting = (value: number) => ({
    type: TARGET.setter,
    inputs: {VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}}},
  });
  const held = (contents: string) =>
    readWorldHeader(contents, [TARGET])!.properties.find(
      property => property.setter === TARGET.setter,
    );

  it('is the rule’s own value when the world says nothing', () => {
    const property = held(world())!;
    expect(property).toMatchObject({
      name: 'target score',
      type: 'number',
      value: '0',
      rule: 'Scoring',
    });
  });

  it('is what the world’s own row says', () => {
    expect(held(world([setting(30)]))!.value).toBe('30');
  });

  it('is the FIRST row’s, where a world sets it twice', () => {
    expect(held(world([setting(30), setting(50)]))!.value).toBe('30');
  });

  it('is the rule’s own when the row holds something no field can show', () => {
    const computed = {
      type: TARGET.setter,
      inputs: {VALUE: {block: {type: 'world_get_Scoring_ScoreProperty'}}},
    };
    expect(held(world([computed]))!.value).toBe('0');
  });

  it('is written into the row the world already has', () => {
    const written = writeWorldRuleValue(world([setting(30)]), TARGET, '45');
    expect(held(written)!.value).toBe('45');
    // One row, not two.
    expect(written.split(TARGET.setter)).toHaveLength(2);
  });

  it('adds a row at the top when the world has none', () => {
    const other = {type: 'world_pause_game'};
    const written = writeWorldRuleValue(world([other]), TARGET, '30');
    const parsed = JSON.parse(written) as {
      blocks: {
        blocks: Array<{next?: {block?: {type?: string; next?: object}}}>;
      };
    };
    // A starting value, so above whatever might read it.
    expect(parsed.blocks.blocks[0].next?.block?.type).toBe(TARGET.setter);
    expect(parsed.blocks.blocks[0].next?.block?.next).toBeDefined();
    expect(held(written)!.value).toBe('30');
  });

  it('takes the row away again when the value is the rule’s own', () => {
    const written = writeWorldRuleValue(world([setting(30)]), TARGET, '0');
    expect(written).not.toContain(TARGET.setter);
    expect(held(written)!.value).toBe('0');
  });

  it('adds nothing for a value that was already the rule’s own', () => {
    const before = world([{type: 'world_pause_game'}]);
    expect(writeWorldRuleValue(before, TARGET, '0')).toBe(before);
  });

  it('writes a string and a boolean as their own literals', () => {
    const NAMED = {
      ...TARGET,
      setter: 'world_set_X_NameProperty',
      type: 'string',
      default: '',
    };
    const written = writeWorldRuleValue(world(), NAMED, 'Ada');
    expect(written).toContain('"TEXT": "Ada"');
    const FLAG = {
      ...TARGET,
      setter: 'world_set_X_OnProperty',
      type: 'boolean',
      default: 'false',
    };
    expect(writeWorldRuleValue(world(), FLAG, 'true')).toContain(
      '"BOOL": "TRUE"',
    );
  });

  it('refuses a value its type cannot hold, and a type no field edits', () => {
    const before = world();
    expect(writeWorldRuleValue(before, TARGET, 'lots')).toBe(before);
    const VECTOR = {...TARGET, type: 'vector'};
    expect(writeWorldRuleValue(before, VECTOR, 'sideways')).toBe(before);
    const COLOR = {...TARGET, type: 'color'};
    expect(writeWorldRuleValue(before, COLOR, '#ff0000')).toBe(before);
  });

  describe('a vector', () => {
    // Gravity's direction: the rule's own is straight down.
    const DIRECTION = {
      setter: 'world_set_Gravity_DirectionOfGravityProperty',
      name: 'direction of gravity',
      type: 'vector',
      rule: 'Gravity',
      default: '0,1',
    };
    const pointing = (x: number, y: number) => ({
      type: DIRECTION.setter,
      inputs: {
        VALUE: {shadow: {type: 'world_vector', fields: {VECTOR: {x, y}}}},
      },
    });
    const direction = (contents: string) =>
      readWorldHeader(contents, [DIRECTION])!.properties.find(
        property => property.setter === DIRECTION.setter,
      );

    it('is read off a `world_vector` literal as two numbers and a comma', () => {
      expect(direction(world([pointing(1, 0)]))!.value).toBe('1,0');
      expect(direction(world())!.value).toBe('0,1');
    });

    it('is written as a `world_vector` literal, and the rule’s own takes the row away', () => {
      const written = writeWorldRuleValue(world(), DIRECTION, '-1,0');
      const row = JSON.parse(written).blocks.blocks[0].next.block;
      expect(row.type).toBe(DIRECTION.setter);
      expect(row.inputs.VALUE.shadow).toEqual({
        type: 'world_vector',
        fields: {VECTOR: {x: -1, y: 0}},
      });
      expect(direction(written)!.value).toBe('-1,0');
      const back = writeWorldRuleValue(written, DIRECTION, '0,1');
      expect(JSON.parse(back).blocks.blocks[0].next).toBeUndefined();
    });
  });
});

describe('the world’s own vectors and points', () => {
  // A `define vector` row keeps both axes in one field, as the block's
  // arrow-grid field saves them; a `define point` keeps two numbers.
  const WORLD = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Windy'},
          next: {
            block: {
              type: 'world_rule_property',
              fields: {TYPE: 'vector', NAME: 'wind', DEFAULT: {x: 2, y: 0}},
              next: {
                block: {
                  type: 'world_rule_property',
                  fields: {
                    TYPE: 'point',
                    NAME: 'spawn',
                    DEFAULT: 3,
                    DEFAULT_Y: 4,
                  },
                },
              },
            },
          },
        },
      ],
    },
  });
  const named = (contents: string, name: string) =>
    readWorldHeader(contents)!.properties.find(each => each.name === name);
  const rowNamed = (contents: string, name: string) => {
    let at = JSON.parse(contents).blocks.blocks[0].next?.block;
    while (at && at.fields.NAME !== name) {
      at = at.next?.block;
    }
    return at;
  };

  it('are read as two numbers and a comma, whichever shape the row keeps', () => {
    expect(named(WORLD, 'wind')).toEqual({
      name: 'wind',
      type: 'vector',
      value: '2,0',
    });
    expect(named(WORLD, 'spawn')).toEqual({
      name: 'spawn',
      type: 'point',
      value: '3,4',
    });
  });

  it('are written back in the row’s own shape', () => {
    const wind = writeWorldPropertyDefault(WORLD, 'wind', '0,-5');
    expect(rowNamed(wind, 'wind').fields.DEFAULT).toEqual({x: 0, y: -5});
    expect(named(wind, 'wind')!.value).toBe('0,-5');
    const spawn = writeWorldPropertyDefault(WORLD, 'spawn', '10,20');
    expect(rowNamed(spawn, 'spawn').fields).toMatchObject({
      DEFAULT: 10,
      DEFAULT_Y: 20,
    });
    expect(named(spawn, 'spawn')!.value).toBe('10,20');
  });

  it('leave the file alone for text that is not two numbers', () => {
    expect(writeWorldPropertyDefault(WORLD, 'wind', 'north')).toBe(WORLD);
    expect(writeWorldPropertyDefault(WORLD, 'spawn', '1,2,3')).toBe(WORLD);
  });
});

describe('the world’s background color', () => {
  it('is added as a row at the top of the world, and read back', () => {
    const written = writeWorldBackgroundColor(WORLD, '#7ec8e3');
    expect(readWorldHeader(written)!.backgroundColor).toEqual({
      color: '#7ec8e3',
      inCode: false,
    });
    const world = JSON.parse(written).blocks.blocks[0];
    expect(world.next.block.type).toBe('world_set_background_color');
  });

  it('changes the row that sets it, rather than adding another', () => {
    const twice = writeWorldBackgroundColor(
      writeWorldBackgroundColor(WORLD, '#7ec8e3'),
      '#000000',
    );
    expect(readWorldHeader(twice)!.backgroundColor!.color).toBe('#000000');
    expect(twice.match(/world_set_background_color/g)).toHaveLength(1);
  });

  it('leaves alone a color the code works out', () => {
    // A blend, not a swatch: a field cannot show it, and writing over it
    // would throw it away.
    const parsed = JSON.parse(writeWorldBackgroundColor(WORLD, '#7ec8e3'));
    parsed.blocks.blocks[0].next.block.inputs.COLOR = {
      block: {type: 'colour_blend'},
    };
    const worked = JSON.stringify(parsed);
    expect(readWorldHeader(worked)!.backgroundColor).toEqual({
      color: undefined,
      inCode: true,
    });
    expect(writeWorldBackgroundColor(worked, '#000000')).toBe(worked);
  });
});

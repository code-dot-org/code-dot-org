// The workspace index (`workspaceIndex`, specs/LAZY_WORKSPACE_PLAN.md): the
// editor's questions about what a file declares get the same answers whether a
// body is built or held as the JSON it was saved as.
//
// The blocks here are stand-ins under the REAL type names, with only what the
// questions read — a name field, two number sockets, a variable. Registering
// the real palette means wiring every extension by hand, and the questions do
// not look past these parts.

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import {camerasIn, cameraIdFromValue} from '../cameras';
import {mapGridSize} from '../fields/mapGridSize';
import {layerIdFromValue, layersIn, layerValue} from '../layers';
import {boundIds, writtenIds} from '../variableScope';
import {
  hasIndexedBlock,
  indexedBlocks,
  setUnbuiltBody,
  unbuiltBodyOf,
  type SerializedBlock,
} from '../workspaceIndex';

beforeAll(() => {
  // The two entries a variable field's menu ends with, which it reads the
  // moment it takes a value.
  Blockly.Msg.RENAME_VARIABLE = 'Rename…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
  Blockly.defineBlocksWithJsonArray([
    {type: 'world_world', message0: 'define world', nextStatement: null},
    ...['world_define_layer', 'world_define_camera'].map(type => ({
      type,
      message0: `${type} %1`,
      args0: [{type: 'field_input', name: 'NAME', text: ''}],
      previousStatement: null,
      nextStatement: null,
    })),
    {
      type: 'world_set_map_size',
      message0: 'size %1 %2',
      args0: [
        {type: 'input_value', name: 'X'},
        {type: 'input_value', name: 'Y'},
      ],
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: 'math_number',
      message0: '%1',
      args0: [{type: 'field_number', name: 'NUM', value: 0}],
      output: 'Number',
    },
    {
      type: 'variables_set_Number',
      message0: 'set %1',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variable: 'count',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
      ],
      previousStatement: null,
      nextStatement: null,
    },
  ]);
});

const number = (value: number) => ({
  shadow: {type: 'math_number', fields: {NUM: value}},
});

/** A world whose body declares a layer, a camera, a map size and a variable. */
const FILE = {
  variables: [{id: 'v-count', name: 'count', type: 'Number'}],
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_world',
        id: 'world',
        next: {
          block: {
            type: 'world_define_layer',
            id: 'sky',
            fields: {NAME: 'Sky'},
            next: {
              block: {
                type: 'world_define_camera',
                id: 'wide',
                fields: {NAME: 'Wide'},
                next: {
                  block: {
                    type: 'world_set_map_size',
                    id: 'size',
                    inputs: {X: number(20), Y: number(12)},
                    next: {
                      block: {
                        type: 'variables_set_Number',
                        id: 'set',
                        fields: {VAR: {id: 'v-count'}},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

const loaded = () => {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(FILE, workspace);
  return workspace;
};

/** Take the world's body out of the workspace and hold it as JSON. */
const unbuild = (workspace: Blockly.Workspace) => {
  const world = workspace.getBlockById('world')!;
  const body = world.getNextBlock()!;
  const json = Blockly.serialization.blocks.save(body, {
    addCoordinates: false,
  }) as unknown as SerializedBlock;
  body.dispose(false);
  setUnbuiltBody(workspace, 'world', {next: json, statements: {}});
  return world;
};

/** Every answer the moved questions give about this file. */
const answers = (workspace: Blockly.Workspace) => {
  const world = workspace.getBlockById('world')!;
  return {
    layers: layersIn(workspace),
    cameras: camerasIn(workspace),
    layerOfValue: layerIdFromValue(world, layerValue('sky')),
    cameraOfValue: cameraIdFromValue(world, 'camera:wide'),
    grid: mapGridSize(world),
    written: [...writtenIds(workspace)],
    bound: [...boundIds(workspace)],
  };
};

describe('the workspace index', () => {
  it('answers the same about a body held unbuilt as about a built one', () => {
    const built = answers(loaded());
    // The file's own answers, so the comparison is not of two empty lists.
    expect(built.layers).toEqual([{blockId: 'sky', name: 'Sky'}]);
    expect(built.cameras).toEqual([{blockId: 'wide', name: 'Wide'}]);
    expect(built.grid).toMatchObject({columns: 20, rows: 12});
    expect(built.written).toEqual(['v-count']);

    const workspace = loaded();
    unbuild(workspace);
    expect(workspace.getAllBlocks(false).map(block => block.id)).toEqual([
      'world',
    ]);
    expect(answers(workspace)).toEqual(built);
  });

  it('knows a block it holds unbuilt, and lets go of it', () => {
    const workspace = loaded();
    unbuild(workspace);
    expect(hasIndexedBlock(workspace, 'sky')).toBe(true);
    expect(hasIndexedBlock(workspace, 'nowhere')).toBe(false);
    expect(indexedBlocks(workspace).map(block => block.id)).toEqual([
      'world',
      'sky',
      'wide',
      'size',
      // The sockets' shadows, which the file says as well.
      expect.any(String),
      expect.any(String),
      'set',
    ]);

    setUnbuiltBody(workspace, 'world', undefined);
    expect(unbuiltBodyOf(workspace, 'world')).toBeUndefined();
    expect(hasIndexedBlock(workspace, 'sky')).toBe(false);
    expect(layersIn(workspace)).toEqual([]);
  });
});

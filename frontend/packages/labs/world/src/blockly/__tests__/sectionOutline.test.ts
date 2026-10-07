// The list of sections a learner jumps between (`sectionOutline`).

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import {headerText, labelOf, LABEL_LENGTH, sectionsOf} from '../sectionOutline';

beforeAll(() => {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'outline_hat',
      message0: 'when %1 starts %2 %3 %4',
      args0: [
        {type: 'input_value', name: 'WHO'},
        {
          type: 'field_dropdown',
          name: 'HOW',
          options: [
            ['falling', 'FALL'],
            ['rising', 'RISE'],
          ],
        },
        {type: 'input_dummy'},
        {type: 'input_statement', name: 'DO'},
      ],
    },
    {type: 'outline_who', message0: 'this actor', output: null},
    {
      type: 'outline_row',
      message0: 'say %1',
      args0: [{type: 'field_input', name: 'TEXT', text: 'hello'}],
      previousStatement: null,
      nextStatement: null,
    },
  ]);
});

const load = (blocks: object[]) => {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(
    {blocks: {languageVersion: 0, blocks}} as never,
    workspace,
  );
  return workspace;
};

describe('what a section is called', () => {
  it('reads the header: its words, its shown choices and its sockets', () => {
    const workspace = load([
      {
        type: 'outline_hat',
        id: 'hat',
        fields: {HOW: 'RISE'},
        inputs: {
          WHO: {block: {type: 'outline_who'}},
          DO: {block: {type: 'outline_row'}},
        },
      },
    ]);
    // …and not what is in its mouth, which is the body.
    expect(headerText(workspace.getBlockById('hat')!)).toBe(
      'when this actor starts rising',
    );
  });

  it('cuts a long one short', () => {
    const workspace = load([
      {type: 'outline_row', id: 'row', fields: {TEXT: 'x'.repeat(200)}},
    ]);
    const label = labelOf(workspace.getBlockById('row')!);
    expect(label).toHaveLength(LABEL_LENGTH);
    expect(label.endsWith('…')).toBe(true);
  });

  it('lists them in the order the column shows', () => {
    const workspace = load([
      {type: 'outline_row', id: 'low', fields: {TEXT: 'second'}, y: 200},
      {type: 'outline_row', id: 'high', fields: {TEXT: 'first'}, y: 20},
    ]);
    const place = (block: Blockly.Block) =>
      ({low: 200, high: 20})[block.id as 'low' | 'high'];
    expect(sectionsOf(workspace, place as never)).toEqual([
      {id: 'high', label: 'say first'},
      {id: 'low', label: 'say second'},
    ]);
  });
});

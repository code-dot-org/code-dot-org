// Whose event a handler is (`eventSubject`): `this actor`, or `any ⟨kind⟩`
// in a world, as one stored field says.

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import {
  ANY_FIELD,
  ANY_INPUT,
  EVENT_SUBJECT_EXTENSION,
  eventSubjectExtension,
  SUBJECT_FIELD,
  subjectKindOf,
  THIS_FIELD,
  THIS_INPUT,
} from '../eventSubject';
import {setProjectActors} from '../moduleOptions';

const HAT = 'world_on_test_subject';

beforeAll(() => {
  setProjectActors([
    ['Coin', 'actors/coin'],
    ['Player', 'actors/player'],
  ]);
  // Registered as the palette registers it, when a block that wears it is
  // defined (`defineExtension`).
  if (!Blockly.Extensions.isRegistered(EVENT_SUBJECT_EXTENSION)) {
    Blockly.Extensions.register(
      EVENT_SUBJECT_EXTENSION,
      (eventSubjectExtension as unknown as {extension: () => void}).extension,
    );
  }
  Blockly.defineBlocksWithJsonArray([
    {type: 'world_world', message0: 'define world', nextStatement: null},
    {type: 'world_actor', message0: 'define actor', nextStatement: null},
    {
      type: HAT,
      message0: 'when %1 %2 %3 %4 %5 %6 is clicked',
      args0: [
        {type: 'input_dummy'},
        {type: 'field_label', name: THIS_FIELD, text: 'this actor'},
        {type: 'input_dummy', name: THIS_INPUT},
        {type: 'field_label', name: ANY_FIELD, text: 'any'},
        {type: 'field_dropdown', name: SUBJECT_FIELD, options: [['', '']]},
        {type: 'input_dummy', name: ANY_INPUT},
      ],
      inputsInline: true,
      nextStatement: null,
      extensions: [EVENT_SUBJECT_EXTENSION],
    },
  ]);
});

/** A workspace holding `root`, and a handler made in it afterwards. */
const handlerIn = (root: string, saved?: object) => {
  const workspace = new Blockly.Workspace();
  workspace.newBlock(root);
  return saved
    ? Blockly.serialization.blocks.append(saved as never, workspace)
    : workspace.newBlock(HAT);
};

/** The inputs showing: `this actor`, or `any` and the kind. */
const shown = (block: Blockly.Block) =>
  [THIS_INPUT, ANY_INPUT].filter(name => block.getInput(name)!.isVisible());

describe('whose event a handler is', () => {
  it('is this actor, made in an actor file', () => {
    const hat = handlerIn('world_actor');
    expect(subjectKindOf(hat)).toBeUndefined();
    expect(shown(hat)).toEqual([THIS_INPUT]);
  });

  it('is a kind, made in a world', () => {
    const hat = handlerIn('world_world');
    expect(subjectKindOf(hat)).toBe('actors/coin');
    expect(shown(hat)).toEqual([ANY_INPUT]);
  });

  it('is what was stored, whatever it would have started as', () => {
    const hat = handlerIn('world_world', {
      type: HAT,
      fields: {[SUBJECT_FIELD]: 'actors/player'},
    });
    expect(subjectKindOf(hat)).toBe('actors/player');
  });

  it('keeps an empty subject a world cannot use, and offers the way out', () => {
    // A handler pasted from an actor file: still `this actor`, so the
    // misplaced check can say so, and the dropdown is up to pick a kind.
    const hat = handlerIn('world_world', {
      type: HAT,
      fields: {[SUBJECT_FIELD]: ''},
    });
    expect(subjectKindOf(hat)).toBeUndefined();
    expect(shown(hat)).toEqual([ANY_INPUT]);
  });

  it('changes its words when the subject changes', () => {
    const hat = handlerIn('world_actor');
    hat.setFieldValue('actors/coin', SUBJECT_FIELD);
    expect(shown(hat)).toEqual([ANY_INPUT]);
    hat.setFieldValue('', SUBJECT_FIELD);
    expect(shown(hat)).toEqual([THIS_INPUT]);
  });
});

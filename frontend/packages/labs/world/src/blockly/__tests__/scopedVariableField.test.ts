// The menu a getter actually offers.
//
// `variableScope` decides what a block can see and is tested on its own; this
// is the other half of the same claim — that the decision reaches the dropdown
// a learner opens. The two are worth separating because the wiring is where it
// went wrong: the scope rule can be perfect while the getters go on using
// Blockly's own field, and nothing about the editor would look different.

import * as Blockly from 'blockly/core';
import {beforeEach, describe, expect, it} from 'vitest';

import {SCOPED_VARIABLE_FIELD, UNNAMED} from '../fields/scopedVariable';
import {
  ActorVariable,
  ListVariable,
  NumberVariable,
  StringVariable,
  VectorVariable,
} from '../typedVariables';

/** A getter of our own, defined the way the real ones are. */
const GETTER = 'test_get_number';
/** …and a block that WRITES one, which is what makes a name the file's. */
const USER = 'variables_set_Number';

const options = (field: Blockly.Field): string[] =>
  (field as Blockly.FieldDropdown)
    .getOptions(false)
    .map(([, id]) => String(id));

describe('every flavour', () => {
  it('reads a name with the scoped field and declares one with Blockly’s', () => {
    // TWO KINDS OF FIELD, and the difference is which side of a name the block
    // is on. A loop and a `let` DECLARE — such a block always has a variable,
    // and Blockly inventing one for it is right. A getter READS: it may name
    // nothing, and what it can name depends on where it sits.
    //
    // Getting this wrong is what made every loop variable vanish: the scoped
    // field starts empty, so a `for each` that used it bound nothing at all.
    for (const flavour of [
      NumberVariable,
      StringVariable,
      ActorVariable,
      VectorVariable,
      ListVariable,
    ]) {
      expect((flavour.field('VAR') as unknown as {type: string}).type).toBe(
        'field_variable',
      );
      const getter = flavour.getterBlock as unknown as {
        args0: Array<{type: string}>;
      };
      expect(getter.args0[0].type).toBe(SCOPED_VARIABLE_FIELD);
    }
  });
});

describe('a getter’s menu', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    // The two entries Blockly's own menu ends with, which it reads the moment
    // a field takes a value.
    Blockly.Msg.RENAME_VARIABLE = 'Rename…';
    Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
    Blockly.defineBlocksWithJsonArray([
      {
        type: GETTER,
        message0: '%1',
        args0: [
          {
            type: SCOPED_VARIABLE_FIELD,
            name: 'VAR',
            variableTypes: ['Number'],
            defaultType: 'Number',
          },
        ],
        output: 'Number',
      },
      {
        // A block that WRITES the name, which is what makes one the file's.
        type: USER,
        message0: 'set %1 to something',
        args0: [
          {
            type: 'field_variable',
            name: 'VAR',
            variableTypes: ['Number'],
            defaultType: 'Number',
          },
        ],
        previousStatement: true,
        nextStatement: true,
      },
    ]);
    workspace = new Blockly.Workspace();
  });

  it('leaves out a name nothing in the file uses', () => {
    // THE BUG THIS WAS FOUND BY. Every block in the toolbox carries a default
    // name and Blockly makes the variable so the flyout can draw it, so the
    // map is full of names before anything has been dragged out. A getter
    // offering one reads a variable nothing ever sets.
    const ghost = workspace.getVariableMap().createVariable('amount', 'Number');
    const getter = workspace.newBlock(GETTER);

    expect(options(getter.getField('VAR')!)).not.toContain(ghost.getId());
  });

  it('names nothing until it is told, and says so', () => {
    // A stock variable field invents a variable the moment it has none, which
    // is what put `flag` and `amount` in the drawer and let a getter be
    // dragged out reading a name nothing declares and nothing ever sets.
    const getter = workspace.newBlock(GETTER);

    // `getFieldValue` answers null for a field holding nothing, which is the
    // same fact said in Blockly's words.
    expect(getter.getFieldValue('VAR')).toBeFalsy();
    expect(getter.getField('VAR')!.getText()).toBe(UNNAMED);
    expect(options(getter.getField('VAR')!)).toEqual(['']);
  });

  it('offers a name once one is in scope', () => {
    // The other half: `???` is what an empty scope looks like, not what the
    // field always looks like.
    const seen = workspace.getVariableMap().createVariable('tally', 'Number');
    const user = workspace.newBlock(USER);
    user.setFieldValue(seen.getId(), 'VAR');
    const getter = workspace.newBlock(GETTER);

    expect(options(getter.getField('VAR')!)).toContain(seen.getId());
  });
});

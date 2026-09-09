// Which names a block can see from where it sits.
//
// A Blockly variable belongs to the WORKSPACE — the map is flat, and a getter's
// dropdown offered every name of its flavour whether or not the block could
// reach it. That was nearly true while the only variables in the lab were the
// ones a loop bound and the ones a rule took as parameters, because there was
// no way to make a third kind.
//
// `with ⟨number n⟩ as ⟨0⟩ do` makes it false: the name exists inside one
// mouth, and offering it outside offers a name that reads a DIFFERENT variable
// — the module-level `var` Blockly writes for the same id.
//
// THE RULE IS ADDITIVE. A name a binder declares is visible inside it and
// nowhere else; a name nobody declares is visible everywhere, because that is
// what the stock rules' free locals are and nothing has migrated them. So
// `with` scopes, and what was global stays global.

import * as Blockly from 'blockly/core';
import {beforeEach, describe, expect, it} from 'vitest';

import {idsInScope} from '../variableScope';

/**
 * The two messages Blockly's own variable menu ends with.
 *
 * Set here because these cases build a bare workspace rather than the editor's,
 * and `FieldVariable` reads them the moment a field takes a value — long
 * before anything asks what is in scope.
 */
const defineMessages = () => {
  Blockly.Msg.RENAME_VARIABLE = 'Rename variable…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete the %1 variable';
};

/** A workspace with the two blocks these cases need, defined minimally. */
const define = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      // THE REAL TYPE, redefined here with only the parts the scope rule
      // reads. A block the binder table does not name binds nothing, and its
      // variable is then a free one that everything can see — which is the
      // additive rule working, and would make these cases pass for the wrong
      // reason (`variableScope`).
      type: 'world_let_number',
      message0: 'let %1 be %2',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
        {type: 'input_value', name: 'VALUE'},
      ],
      previousStatement: true,
      nextStatement: true,
    },
    {
      type: 'reader',
      message0: 'read',
      previousStatement: true,
      nextStatement: true,
      output: null,
    },
    {
      // A block that WRITES a variable, which is what makes one the file's.
      // The map holds every default the toolbox ever drew, and a getter
      // dragged out of the drawer carries one — so a READ cannot be what makes
      // a name, or that getter would turn `flag` into one.
      type: 'variables_set_Number',
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
};

let workspace: Blockly.Workspace;

/** `let ⟨name⟩ be …`, and the variable's id. */
const withLocal = (name: string) => {
  const block = workspace.newBlock('world_let_number');
  const variable = workspace.getVariableMap().createVariable(name, 'Number');
  block.setFieldValue(variable.getId(), 'VAR');
  return {block, id: variable.getId()};
};

describe('what a block can see', () => {
  beforeEach(() => {
    defineMessages();
    define();
    workspace = new Blockly.Workspace();
  });

  it('sees a name declared by a row above it', () => {
    const {block, id} = withLocal('n');
    const below = workspace.newBlock('reader');
    block.nextConnection!.connect(below.previousConnection!);

    expect(idsInScope(below).has(id)).toBe(true);
  });

  it('does not see it from another stack', () => {
    // The whole claim. Before the scope rule this name was on the workspace
    // and therefore in every dropdown in the file.
    const {id} = withLocal('n');
    const elsewhere = workspace.newBlock('reader');

    expect(idsInScope(elsewhere).has(id)).toBe(false);
  });

  it('does not see it in the value it starts from', () => {
    // `let n = n` is a different bug in every language that allows it.
    const {block, id} = withLocal('n');
    const seed = workspace.newBlock('reader');
    block.getInput('VALUE')!.connection!.connect(seed.outputConnection!);

    expect(idsInScope(seed).has(id)).toBe(false);
  });

  it('sees it from a row further down, not just the next one', () => {
    const {block, id} = withLocal('n');
    const first = workspace.newBlock('reader');
    const second = workspace.newBlock('reader');
    block.nextConnection!.connect(first.previousConnection!);
    first.nextConnection!.connect(second.previousConnection!);

    expect(idsInScope(second).has(id)).toBe(true);
  });

  it('sees every name declared above it, and none declared below', () => {
    // Order is the whole of a declaration's scope. A row that could read a
    // name made below it would generate a reference into the dead zone, which
    // JavaScript throws on rather than answering undefined.
    const first = withLocal('first');
    const second = withLocal('second');
    const below = workspace.newBlock('reader');
    first.block.nextConnection!.connect(second.block.previousConnection!);
    second.block.nextConnection!.connect(below.previousConnection!);

    expect(idsInScope(below).has(first.id)).toBe(true);
    expect(idsInScope(below).has(second.id)).toBe(true);
    expect(idsInScope(second.block).has(first.id)).toBe(true);
    expect(idsInScope(first.block).has(second.id)).toBe(false);
  });

  it('does not see a name nothing in the file writes', () => {
    // THE TOOLBOX PUTS NAMES IN THE MAP. Every `let` and every getter in the
    // flyout carries a default name, and Blockly makes the variable so the
    // flyout can draw it — so the workspace's map holds `amount`, `flag`,
    // `text` and the rest before a learner has dragged anything out.
    //
    // The additive rule offered them all, because a name no binder declares is
    // one this treats as the file's own. A name NOTHING WRITES is not the
    // file's own — and reading one cannot be what makes it, or a getter
    // dragged out of the drawer would make `flag` a name by carrying it.
    const ghost = workspace.getVariableMap().createVariable('amount', 'Number');
    const block = workspace.newBlock('reader');

    expect(idsInScope(block).has(ghost.getId())).toBe(false);
  });

  it('sees a name nothing declares, from anywhere', () => {
    // The additive half, and the reason this could ship without migrating
    // anything: every stock rule sets and reads free locals in its step
    // bodies, and a strict scope would have taken them out of the dropdown of
    // the rule that owns them.
    const free = workspace.getVariableMap().createVariable('total', 'Number');
    // …WRITTEN by a block, which is what a rule's free local is: set in a step
    // body, and declared by nothing.
    workspace
      .newBlock('variables_set_Number')
      .setFieldValue(free.getId(), 'VAR');
    const {block} = withLocal('n');
    const below = workspace.newBlock('reader');
    block.nextConnection!.connect(below.previousConnection!);
    const elsewhere = workspace.newBlock('reader');

    expect(idsInScope(below).has(free.getId())).toBe(true);
    expect(idsInScope(elsewhere).has(free.getId())).toBe(true);
  });
});

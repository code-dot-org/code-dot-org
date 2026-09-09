// A name that exists only inside one block.
//
// THE LAB HAD NO LOCALS. A variable a body sets and reads is declared by
// Blockly's generator at MODULE scope — one `var` line for the whole file — so
// two bodies that both use `n` are using the same `n`. Nothing had gone wrong
// yet because a body runs to completion and nothing re-enters, which is a
// property of the code that happens to hold rather than one anything enforces.
//
// It stops holding the moment a piece of work needs working values. A caret in
// a multi-line field walks the text counting lines and columns, and the
// alternative to a local is a PROPERTY on the actor: scratch space in the
// inspector, and in every dropdown that lists an actor's properties, for a
// number that means nothing between two frames (specs/UI_ACTORS.md).
//
// A ROW RATHER THAN A MOUTH. The first shape drew its scope — `with ⟨n⟩ as
// ⟨0⟩ do` — and cost a nesting per name, so three working values were three
// boxes inside each other before any work was written. A declaration is flat
// and is what the rest of the language looks like; what it gives up is the
// scope being visible, which the filtered dropdown is what keeps honest
// (`blockly/variableScope`).
//
// What is checked here is that the name is really the body's — a `let` and not
// the module's `var` — that a body may change it, and that writing it twice is
// an assignment rather than a second declaration.

import {render} from '@testing-library/react';
import * as Blockly from 'blockly/core';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';

/** A variable as a workspace declares one: an id, a name, and a flavour. */
const COUNT = {id: 'count', name: 'count', type: 'Number'};

/** `set ⟨count⟩ to ⟨n⟩`. */
const setCount = (to: object) => ({
  type: 'variables_set_Number',
  fields: {VAR: COUNT},
  inputs: {VALUE: to},
});

const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** An `.actor` whose per-frame body is `rows`, and the variables it declares. */
const actorWith = (rows: object[], variables: object[] = [COUNT]) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: 'Scribe'},
          next: {
            block: {
              type: 'world_trait_step',
              fields: {PHASE: 'react', NAME: 'count'},
              inputs: {
                DO: {
                  block: rows.reduceRight((next, row) => ({
                    ...(row as object),
                    next: {block: next},
                  })),
                },
              },
            },
          },
        },
      ],
    },
    variables,
  });

/**
 * Generate one file, through the generator the runtime uses.
 *
 * Rendered per case rather than once: the testing library unmounts between
 * them, and a ref to a component that has gone is null.
 */
const generate = async (contents: string): Promise<string> => {
  const ref = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={ref} />);
  await new Promise(resolve => setTimeout(resolve, 50));
  return ref.current!.generate(contents, 'actors/scribe.actor');
};

describe('let ⟨number n⟩ be ⟨…⟩', () => {
  /** The step's body, which is where a local has to land. */
  const bodyOf = (js: string) => js.slice(js.indexOf('defineStep'));

  it('declares the name inside a block of its own', async () => {
    const js = await generate(
      actorWith([
        {
          type: 'world_let_number',
          fields: {VAR: COUNT},
          inputs: {VALUE: number(7)},
          next: {block: setCount(number(8))},
        },
      ]),
    );

    // `let` IN THE BODY. Blockly still writes its module-level `var` for every
    // variable the workspace holds — that line is what every other variable in
    // the lab gets and all it gets — and a `let` inside the body shadows it,
    // which is what makes the name the body's rather than the file's.
    expect(bodyOf(js)).toContain('let count = 7;');
    expect(bodyOf(js)).not.toContain('var count');
  });

  it('lets the body change it, which is what a walk needs', async () => {
    // A local nothing may assign to is a constant, and a constant cannot count.
    const js = await generate(
      actorWith([
        {
          type: 'world_let_number',
          fields: {VAR: COUNT},
          inputs: {VALUE: number(0)},
          next: {block: setCount(number(1))},
        },
      ]),
    );

    expect(bodyOf(js)).toContain('count = 1;');
  });

  it('declares one name once, however many times it is written', async () => {
    // Two `let`s for one name in one stack would be two `let`s for one
    // identifier, which is a SyntaxError that takes the whole module down. The
    // second is an assignment — which is what a reader means by writing it
    // again (`variableScope.isRedeclaration`).
    const js = await generate(
      actorWith([
        {
          type: 'world_let_number',
          fields: {VAR: COUNT},
          inputs: {VALUE: number(1)},
        },
        {
          type: 'world_let_number',
          fields: {VAR: COUNT},
          inputs: {VALUE: number(3)},
        },
      ]),
    );
    const body = bodyOf(js);

    expect(body.match(/let count = /g)).toHaveLength(1);
    expect(body).toContain('let count = 1;');
    expect(body).toContain('count = 3;');
  });
});

// THE NAME IS TYPED, NOT PICKED.
//
// A declaration is where a name comes from, so the block that declares one
// should be the block you write it in. Blockly's `field_variable` is a
// dropdown of names that already exist — right for a getter, backwards for a
// `let`, where making a second name meant opening a menu whose only entries
// were the names you were trying not to reuse.
//
// So the field is a text box over a REAL variable: what it stores is the id,
// so the getters list it and the generator maps it to one identifier; what it
// shows and edits is the name (`fields/variableName`).
describe('naming a local', () => {
  it('makes the variable, so the getters can find it', async () => {
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('world_let_number');

    block.setFieldValue('tally', 'VAR');

    const made = workspace.getVariableMap().getVariable('tally', 'Number');
    expect(made).not.toBeNull();
    // The field holds the ID, which is what every getter and the generator
    // read — the name is only what it draws.
    expect(block.getFieldValue('VAR')).toBe(made!.getId());
  });

  it('points at the name that is already there, rather than a second one', async () => {
    // Two `let`s of one name are one variable, which is what a reader means by
    // typing it twice — and is what lets the second generate an assignment
    // rather than a second declaration.
    const workspace = new Blockly.Workspace();
    const first = workspace.newBlock('world_let_number');
    const second = workspace.newBlock('world_let_number');

    first.setFieldValue('tally', 'VAR');
    second.setFieldValue('tally', 'VAR');

    expect(second.getFieldValue('VAR')).toBe(first.getFieldValue('VAR'));
    expect(
      workspace
        .getVariableMap()
        .getAllVariables()
        .filter(one => one.getName() === 'tally'),
    ).toHaveLength(1);
  });

  it('draws the variable’s name, so renaming from a getter reaches it', async () => {
    // The other end of the same fact. A getter's menu renames the VARIABLE,
    // and this field draws whatever the variable is called — so the `let`
    // follows without being told.
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('world_let_number');
    block.setFieldValue('tally', 'VAR');
    const made = workspace.getVariableMap().getVariable('tally', 'Number')!;

    workspace.getVariableMap().renameVariable(made, 'total');

    expect(block.getField('VAR')!.getText()).toBe('total');
  });
});

// EDITING A DECLARATION RENAMES WHAT IT DECLARED.
//
// The readers below a `let` go on reading it: Blockly tells every field showing
// that variable and they redraw themselves, so a name typed into the block that
// made it reaches the blocks that use it without anybody arranging anything.
//
// Making a fresh variable instead would leave those readers pointing at the old
// one, which nothing declares any more — so they would quietly become
// out-of-scope reads of a name that had merely been spelled differently.
describe('renaming a local', () => {
  it('renames the variable, so its readers follow', () => {
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('world_let_number');
    block.setFieldValue('tally', 'VAR');
    const made = workspace.getVariableMap().getVariable('tally', 'Number')!;

    block.setFieldValue('total', 'VAR');

    // The SAME variable, wearing a new name — not a second one.
    expect(block.getFieldValue('VAR')).toBe(made.getId());
    expect(made.getName()).toBe('total');
    expect(
      workspace
        .getVariableMap()
        .getAllVariables()
        .filter(one => one.getType() === 'Number'),
    ).toHaveLength(1);
  });

  it('points at a name that already exists rather than colliding', () => {
    // Two variables cannot share a name, so typing one that is taken joins it.
    const workspace = new Blockly.Workspace();
    const taken = workspace.getVariableMap().createVariable('total', 'Number');
    const block = workspace.newBlock('world_let_number');
    block.setFieldValue('tally', 'VAR');

    block.setFieldValue('total', 'VAR');

    expect(block.getFieldValue('VAR')).toBe(taken.getId());
  });
});

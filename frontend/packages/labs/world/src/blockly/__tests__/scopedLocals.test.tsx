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

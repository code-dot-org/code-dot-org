// `define block` — the generalized rule member, designed as the block it makes.
//
// What matters is that ONE authored signature drives three things that used to
// be derived separately: the member's name, its parameters, and the shape of
// the call-site block. If they can drift, the block a learner designs is not
// the block they get.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette, DOMAIN_BLOCKS} from '../domainBlocks';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {shadowsFor} from '../valueShadow';

// The palette and the registry go together and always did: the editor
// registers the project's rules and builds the palette from the same list, in
// the same breath. It has to be said now, because a member block whose rule the
// registry cannot find generates NOTHING — that is how a deleted rule stops
// taking the whole project down with it (domainBlocks, `refResolves`).
const paletteFor = (meta: ReturnType<typeof parseRuleMeta>) => {
  registerProjectRules(meta ? [meta] : []);
  return buildDomainPalette(meta ? [meta] : []);
};

/** A `.rule` whose only member is a designed block. */
const designed = (
  parts: unknown[],
  returns = 'none',
  variables: Array<{id: string; name: string; type: string}> = [],
  description = '',
) =>
  parseRuleMeta(
    'rules/push',
    JSON.stringify({
      type: 'rule',
      name: 'Push',
      ability: 'Has Push',
      members: [
        {
          id: 'block-0',
          kind: 'block',
          parts,
          ...(description ? {description} : {}),
          ...(returns !== 'none' ? {returns} : {}),
        },
      ],
      variables,
    }),
  )!;

const PUSH_PARTS = [
  {kind: 'label', text: 'push'},
  {kind: 'param', type: 'number', var: 'a'},
  {kind: 'label', text: 'toward'},
  {kind: 'param', type: 'actor', var: 'b'},
];
const PUSH_VARS = [
  {id: 'a', name: 'amount', type: 'Number'},
  {id: 'b', name: 'target', type: 'Actor'},
];

describe('a designed block', () => {
  it('is named by its labels, joined', () => {
    // There is no NAME field: the name IS the fixed wording of the block it
    // draws, which is what makes the definition look like the thing defined.
    const meta = designed(PUSH_PARTS, 'none', PUSH_VARS);
    expect(meta.actions[0].name).toBe('push toward');
    expect(meta.actions[0].id).toBe('push_toward');
  });

  it('takes its parameters from the param parts, in order', () => {
    const meta = designed(PUSH_PARTS, 'none', PUSH_VARS);
    expect(meta.actions[0].params).toEqual([
      {name: 'amount', type: 'number'},
      {name: 'target', type: 'actor'},
    ]);
  });

  it('is an action or a query, by what it returns alone', () => {
    // The one thing `define action` and `define query` differed in.
    expect(designed(PUSH_PARTS, 'none', PUSH_VARS).queries).toHaveLength(0);
    const asQuery = designed(PUSH_PARTS, 'boolean', PUSH_VARS);
    expect(asQuery.actions).toHaveLength(0);
    expect(asQuery.queries[0].returns).toBe('boolean');
  });

  it('keeps the whole arrangement, not just the name and the params', () => {
    // The call site is built from this, so "label param label param" survives.
    expect(designed(PUSH_PARTS, 'none', PUSH_VARS).actions[0].parts).toEqual([
      {kind: 'label', text: 'push'},
      {kind: 'param', name: 'amount', type: 'number'},
      {kind: 'label', text: 'toward'},
      {kind: 'param', name: 'target', type: 'actor'},
    ]);
  });

  it('builds a call-site block that reads like the design', () => {
    // `push %1 toward %2 on %3` — the arrangement, not `name arg arg`.
    const meta = designed(PUSH_PARTS, 'none', PUSH_VARS);
    const {blocks} = paletteFor(meta);
    const call = blocks.find(
      b => b.type === 'world_do_Push_PushTowardAction',
    ) as {message0?: string} | undefined;
    expect(call?.message0).toMatch(/^push %\d toward %\d$/);
  });

  it('gives a position parameter one socket, typed as an x and a y', () => {
    // The third way to say a two-number value, and the only one that gives up
    // nothing. `vector` is one socket that takes any vector, but its literal
    // is an arrow grid — a direction, not a place. `point` is an x and a y a
    // learner can type, but they are two INDEPENDENT number sockets, so
    // nothing reporting a whole vector can be dropped in.
    //
    // A position is a VECTOR socket wearing `vector x ⟨⟩ y ⟨⟩` as its shadow:
    // typed as two numbers, and still replaceable by anything that reports a
    // vector. It is what `let position` in an arguments row declares.
    const meta = designed(
      [
        {kind: 'label', text: 'go to'},
        {kind: 'param', type: 'position', var: 'p', default: {x: 3, y: 4}},
      ],
      'none',
      [{id: 'p', name: 'where', type: 'Vector'}],
    );
    const {blocks} = paletteFor(meta);
    const type = 'world_do_Push_GoToAction';
    const call = blocks.find(b => b.type === type) as
      | {args0?: Array<{type: string; name?: string; check?: string}>}
      | undefined;

    // ONE socket, and it takes a vector — not two number sockets.
    expect(call?.args0).toHaveLength(1);
    expect(call?.args0?.[0]).toMatchObject({
      type: 'input_value',
      name: 'VALUE',
      check: 'Vector',
    });
    // …wearing the x/y builder, with the author's default in each socket.
    expect(shadowsFor(type)).toEqual([
      {
        name: 'VALUE',
        shadow: {
          type: 'world_vector_of',
          inputs: {
            X: {shadow: {type: 'math_number', fields: {NUM: 3}}},
            Y: {shadow: {type: 'math_number', fields: {NUM: 4}}},
          },
        },
      },
    ]);
  });

  it('starts a call site with whatever the author built, not just a value', () => {
    // The general form of a default. `argument` can only carry what a field
    // holds — a number, a word, a choice — so the shapes in `typedValueInputs`
    // chose a shadow to put it in. An argument declared by a `let` carries the
    // whole BLOCK that was plugged into it, so a default is anything the author
    // could make: `this actor`, `any ⟨Coin⟩`, or an arithmetic tree.
    const meta = designed(
      [
        {kind: 'label', text: 'nudge'},
        {
          kind: 'param',
          type: 'number',
          var: 'n',
          // The SOCKET as the author left it — a block they plugged in,
          // which stays a block on the row and is flattened into a shadow
          // only here, where it becomes a default.
          shadow: {
            block: {
              type: 'math_arithmetic',
              fields: {OP: 'ADD'},
              inputs: {
                A: {block: {type: 'math_number', fields: {NUM: 2}}},
                B: {shadow: {type: 'math_number', fields: {NUM: 3}}},
              },
            },
          },
        },
      ],
      'none',
      [{id: 'n', name: 'amount', type: 'Number'}],
    );
    const type = 'world_do_Push_NudgeAction';
    paletteFor(meta);

    expect(shadowsFor(type)).toEqual([
      {
        name: 'VALUE',
        shadow: {
          type: 'math_arithmetic',
          fields: {OP: 'ADD'},
          inputs: {
            A: {shadow: {type: 'math_number', fields: {NUM: 2}}},
            B: {shadow: {type: 'math_number', fields: {NUM: 3}}},
          },
        },
      },
    ]);
  });

  it('still gives that socket the type check its parameter asks for', () => {
    // The author-built shadow goes into the same socket the shapes below would
    // have made, and a socket that accepted anything would take a number where
    // an actor was meant.
    const meta = designed(
      [
        {kind: 'label', text: 'chase'},
        {
          kind: 'param',
          type: 'actor',
          var: 'a',
          shadow: {shadow: {type: 'world_this_actor'}},
        },
      ],
      'none',
      [{id: 'a', name: 'who', type: 'Actor'}],
    );
    const {blocks} = paletteFor(meta);
    const call = blocks.find(b => b.type === 'world_do_Push_ChaseAction') as
      | {args0?: Array<{check?: string}>}
      | undefined;

    expect(call?.args0?.[0]).toMatchObject({check: 'Actor'});
  });

  it('gives an enum parameter the dropdown itself, not a socket', () => {
    // A parameter typed by an enum (specs/ENUMS.md) is a FIELD on the block:
    // the choices are the whole of what the argument can be, so there is
    // nothing for a socket to accept that a dropdown cannot say. Naming a
    // choice where a socket IS wanted — a comparison, an `emit … with` — is
    // what the enum's own chip block is for.
    const meta = designed(
      [
        {kind: 'label', text: 'press'},
        {kind: 'param', type: 'enum:Engine#Key', var: 'k'},
      ],
      'none',
      [{id: 'k', name: 'key', type: 'String'}],
    );
    const {blocks} = paletteFor(meta);
    const call = blocks.find(b => b.type === 'world_do_Push_PressAction') as
      | {args0?: Array<{type: string; name?: string; check?: string}>}
      | undefined;

    expect(call?.args0?.[0]).toMatchObject({
      type: 'field_dropdown',
      name: 'VALUE',
    });
    expect(
      (call?.args0?.[0] as {options?: Array<[string, string]>}).options,
    ).toContainEqual(['space', 'space']);
    // No socket, so nothing to seed.
    expect(shadowsFor('world_do_Push_PressAction') ?? []).toEqual([]);
  });

  it('emits the chosen word from the field', () => {
    // The choice is read off the block, not pulled through a socket, and what
    // it stands for is the word itself — an enum is strings by the time any
    // code runs.
    const meta = designed(
      [
        {kind: 'label', text: 'press'},
        {kind: 'param', type: 'enum:Engine#Key', var: 'k'},
      ],
      'none',
      [{id: 'k', name: 'key', type: 'String'}],
    );
    const {blocks} = paletteFor(meta);
    const call = blocks.find(b => b.type === 'world_do_Push_PressAction') as {
      generator: {
        javascript: (
          block: unknown,
          generator: unknown,
          env: unknown,
        ) => string;
      };
    };

    const code = call.generator.javascript(
      {getFieldValue: (name: string) => (name === 'VALUE' ? 'up arrow' : null)},
      {valueToCode: () => '', definitions_: {}},
      {},
    );

    expect(code).toContain('"up arrow"');
  });

  it('offers a dropdown of the enum’s choices on that chip', () => {
    // The chip is one block per enum, built with the palette. Its options are
    // the enum's, so what the argument offers is what the enum declares.
    const chip = DOMAIN_BLOCKS.find(
      b => b.type === 'world_choice_Engine_Key',
    ) as
      | {args0?: Array<{options?: Array<[string, string]>}>; output?: string}
      | undefined;

    expect(chip?.output).toBe('String');
    expect(chip?.args0?.[0]?.options).toContainEqual(['space', 'space']);
    expect(chip?.args0?.[0]?.options).toContainEqual(['A', 'a']);
  });

  it('declares the member in the generated module', () => {
    const meta = designed(PUSH_PARTS, 'none', PUSH_VARS);
    expect(ruleMetaToModule(meta)).toContain(
      'export const PushTowardAction = rule.addAction("push_toward"',
    );
  });

  it('builds a query’s call site from the design too, not just an action’s', () => {
    // A query used to be assembled as "<first argument> name <rest>", which is a
    // sensible default and not what somebody who arranged the block asked for.
    // `<faller> rest height of <ground>` is the arrangement gravity authors.
    const meta = designed(
      [
        {kind: 'param', type: 'actor', var: 'a'},
        {kind: 'label', text: 'rest height of'},
        {kind: 'param', type: 'actor', var: 'b'},
      ],
      'number',
      [
        {id: 'a', name: 'faller', type: 'Actor'},
        {id: 'b', name: 'ground', type: 'Actor'},
      ],
    );
    const {blocks} = paletteFor(meta);
    const call = blocks.find(
      b => b.type === 'world_query_Push_RestHeightOfQuery',
    ) as {message0?: string} | undefined;
    expect(call?.message0).toMatch(/^%\d rest height of %\d$/);
  });

  it('leads an actor query with its subject, then the design', () => {
    // The arrangement describes the block's own words; who it is asked of is
    // the socket in front of them — "this actor is on the ground?".
    const meta = parseRuleMeta(
      'rules/push',
      JSON.stringify({
        type: 'rule',
        name: 'Push',
        ability: 'Has Push',
        traits: [
          {
            name: 'Pushable',
            members: [
              {
                id: 'block-0',
                kind: 'block',
                parts: [{kind: 'label', text: 'is on the ground?'}],
                returns: 'boolean',
              },
            ],
          },
        ],
        variables: [],
      }),
    )!;
    const {blocks} = paletteFor(meta);
    const call = blocks.find(
      b => b.type === 'world_query_Push_IsOnTheGroundQuery',
    ) as {message0?: string} | undefined;
    expect(call?.message0).toBe('%1 is on the ground?');
  });

  it('gives the block it defines the description its author wrote', () => {
    // The tooltip someone reads when they hover it in the toolbox months later,
    // having forgotten what "push toward" meant. The definition is the only
    // place that knows.
    const meta = designed(
      PUSH_PARTS,
      'none',
      PUSH_VARS,
      'Shove an actor toward another one.',
    );
    expect(meta.actions[0].description).toBe(
      'Shove an actor toward another one.',
    );
    const {blocks} = paletteFor(meta);
    const call = blocks.find(
      b => b.type === 'world_do_Push_PushTowardAction',
    ) as {tooltip?: string} | undefined;
    expect(call?.tooltip).toBe('Shove an actor toward another one.');
  });

  it('falls back to the member’s own name when there is no description', () => {
    const meta = designed(PUSH_PARTS, 'none', PUSH_VARS);
    expect(meta.actions[0].description).toBeUndefined();
    const {blocks} = paletteFor(meta);
    const call = blocks.find(
      b => b.type === 'world_do_Push_PushTowardAction',
    ) as {tooltip?: string} | undefined;
    expect(call?.tooltip).toBe('push toward');
  });

  it('ignores a signature with no wording at all', () => {
    // Parameters alone give nothing to call the member, and nothing to read.
    expect(
      designed([{kind: 'param', type: 'number', var: 'a'}]).actions,
    ).toEqual([]);
  });
});

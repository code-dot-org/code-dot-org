// `define block` — the generalized rule member, designed as the block it makes.
//
// What matters is that ONE authored signature drives three things that used to
// be derived separately: the member's name, its parameters, and the shape of
// the call-site block. If they can drift, the block a learner designs is not
// the block they get.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette, DOMAIN_BLOCKS} from '../domainBlocks';
import {
  isActorScoped,
  itemTypeFor,
  paramTypeOf,
  SIGNATURE_BLOCK_TYPES,
} from '../extensions/blockDesigner';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';
import {shadowsFor} from '../valueShadow';

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
      variables,
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Push', ABILITY: 'Has Push'},
            next: {
              block: {
                type: 'world_rule_block',
                fields: {RETURNS: returns, DESCRIPTION: description},
                extraState: {parts},
              },
            },
          },
        ],
      },
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

  it('is an action or a query, by its RETURNS field alone', () => {
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
    const {blocks} = buildDomainPalette([meta]);
    const call = blocks.find(
      b => b.type === 'world_do_Push_PushTowardAction',
    ) as {message0?: string} | undefined;
    expect(call?.message0).toMatch(/^push %\d toward %\d$/);
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
    const {blocks} = buildDomainPalette([meta]);
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
    const {blocks} = buildDomainPalette([meta]);
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
    const {blocks} = buildDomainPalette([meta]);
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
        variables: [],
        blocks: {
          blocks: [
            {type: 'world_rule', fields: {NAME: 'Push', ABILITY: 'Has Push'}},
            {
              type: 'world_rule_trait',
              fields: {NAME: 'Pushable'},
              next: {
                block: {
                  type: 'world_rule_block',
                  fields: {RETURNS: 'boolean'},
                  extraState: {
                    parts: [{kind: 'label', text: 'is on the ground?'}],
                  },
                },
              },
            },
          ],
        },
      }),
    )!;
    const {blocks} = buildDomainPalette([meta]);
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
    const {blocks} = buildDomainPalette([meta]);
    const call = blocks.find(
      b => b.type === 'world_do_Push_PushTowardAction',
    ) as {tooltip?: string} | undefined;
    expect(call?.tooltip).toBe('Shove an actor toward another one.');
  });

  it('falls back to the member’s own name when there is no description', () => {
    const meta = designed(PUSH_PARTS, 'none', PUSH_VARS);
    expect(meta.actions[0].description).toBeUndefined();
    const {blocks} = buildDomainPalette([meta]);
    const call = blocks.find(
      b => b.type === 'world_do_Push_PushTowardAction',
    ) as {tooltip?: string} | undefined;
    expect(call?.tooltip).toBe('push toward');
  });

  it('knows whether it is defining a member with a subject', () => {
    // Placement decides it: under a `define trait` the block it makes is asked
    // OF an actor and grows a socket nobody wrote into the signature — which is
    // what the drawn preview has to show, or the preview is a different block
    // from the one being defined.
    expect(
      isActorScoped({getRootBlock: () => ({type: 'world_rule_trait'})}),
    ).toBe(true);
    expect(isActorScoped({getRootBlock: () => ({type: 'world_rule'})})).toBe(
      false,
    );
    // A definition floating on its own workspace is its own root.
    expect(
      isActorScoped({getRootBlock: () => ({type: 'world_rule_block'})}),
    ).toBe(false);
  });

  it('offers a flyout of blocks that are actually registered', () => {
    // Blockly builds the mutator bubble's flyout by TYPE NAME, and throws on one
    // it cannot find — at the moment the ⚙ is clicked, not at startup. This is
    // the check that a renamed or dropped item block is caught here instead.
    const registered = new Set(DOMAIN_BLOCKS.map(block => block.type));
    for (const type of SIGNATURE_BLOCK_TYPES) {
      expect(registered.has(type), type).toBe(true);
    }
  });

  it('reads every item block back as the part it stands for', () => {
    // The bubble is the only writer of the signature, so this mapping is what
    // makes a design survive being opened and closed.
    for (const part of [
      {kind: 'label', text: 'push'},
      ...['number', 'boolean', 'string', 'vector', 'actor'].map(type => ({
        kind: 'param' as const,
        type,
        var: '',
      })),
    ] as Parameters<typeof itemTypeFor>[0][]) {
      const type = itemTypeFor(part);
      expect(SIGNATURE_BLOCK_TYPES).toContain(type);
      // The item block, as the bubble would hold it: `paramTypeOf` reads the
      // block rather than its type, because the choice item carries which enum
      // it is typed by in a field.
      expect(paramTypeOf({type, getFieldValue: () => null})).toBe(
        part.kind === 'param' ? part.type : undefined,
      );
    }
  });

  it('edits an enum parameter as the one choice item, whichever enum', () => {
    // One item block for every enum — which one is a field on it — so a rule
    // that declares a new set of choices needs no new block type.
    const part = {
      kind: 'param' as const,
      type: 'enum:Engine#Key',
      var: '',
    };
    const type = itemTypeFor(part);

    expect(type).toBe('world_signature_choice');
    expect(SIGNATURE_BLOCK_TYPES).toContain(type);
    expect(paramTypeOf({type, getFieldValue: () => 'Engine#Key'})).toBe(
      'enum:Engine#Key',
    );
    // A choice item with no enum picked yet is not a parameter of any type.
    expect(paramTypeOf({type, getFieldValue: () => ''})).toBeUndefined();
  });

  it('ignores a signature with no wording at all', () => {
    // Parameters alone give nothing to call the member, and nothing to read.
    expect(
      designed([{kind: 'param', type: 'number', var: 'a'}]).actions,
    ).toEqual([]);
  });
});

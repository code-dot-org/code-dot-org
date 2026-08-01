// `define block` — the generalized rule member, designed as the block it makes.
//
// What matters is that ONE authored signature drives three things that used to
// be derived separately: the member's name, its parameters, and the shape of
// the call-site block. If they can drift, the block a learner designs is not
// the block they get.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette, DOMAIN_BLOCKS} from '../domainBlocks';
import {
  itemTypeFor,
  paramTypeFor,
  SIGNATURE_BLOCK_TYPES,
} from '../extensions/blockDesigner';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

/** A `.rule` whose only member is a designed block. */
const designed = (
  parts: unknown[],
  returns = 'none',
  variables: Array<{id: string; name: string; type: string}> = [],
) =>
  parseRuleMeta(
    'rules/push',
    JSON.stringify({
      variables,
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Has Push'},
            next: {
              block: {
                type: 'world_rule_block',
                fields: {RETURNS: returns},
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
      b => b.type === 'world_do_rules_push_PushTowardAction',
    ) as {message0?: string} | undefined;
    expect(call?.message0).toMatch(/^push %\d toward %\d$/);
  });

  it('declares the member in the generated module', () => {
    const meta = designed(PUSH_PARTS, 'none', PUSH_VARS);
    expect(ruleMetaToModule(meta)).toContain(
      'export const PushTowardAction = rule.addAction("push_toward"',
    );
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
      expect(paramTypeFor(type)).toBe(
        part.kind === 'param' ? part.type : undefined,
      );
    }
  });

  it('ignores a signature with no wording at all', () => {
    // Parameters alone give nothing to call the member, and nothing to read.
    expect(
      designed([{kind: 'param', type: 'number', var: 'a'}]).actions,
    ).toEqual([]);
  });
});

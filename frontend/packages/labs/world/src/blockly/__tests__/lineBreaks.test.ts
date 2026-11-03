// A line break in a designed block (specs/ACTOR_BLOCKS_PLAN.md, step 1).
//
// What is pinned is that a break changes where the block wraps and nothing
// else: the same name, the same values, the same sockets in the same order.

import {describe, expect, it} from 'vitest';

import type {ActorMemberPart} from '../../actors/actorData';
import {actorDocument} from '../../actors/actorDocument';
import {endsNothing, settledParts} from '../designParts';
import {buildDomainPalette} from '../domainBlocks';
import {parseActorOwnMeta} from '../ownProperties';

const label = (text: string): ActorMemberPart => ({kind: 'label', text});
const row: ActorMemberPart = {kind: 'row'};
const value = (id: string, name: string): ActorMemberPart => ({
  kind: 'param',
  type: 'number',
  var: id,
  name,
});

/** An `.actor` file with one block and one event, each in two lines. */
const actorFile = (parts: ActorMemberPart[]) =>
  actorDocument({
    name: 'Healer',
    members: [
      {kind: 'block', parts},
      {kind: 'event', parts},
    ],
    variables: [
      {id: 'v1', name: 'amount', type: 'Number'},
      {id: 'v2', name: 'times', type: 'Number'},
    ],
  });

const SPLIT = [
  label('heal by'),
  value('v1', 'amount'),
  row,
  label('for'),
  value('v2', 'times'),
];
const WHOLE = SPLIT.filter(part => part !== row);

/**
 * The inputs a minted definition declares, in order: an end-row input as `|`,
 * a socket by name. Read off the definition, which is what Blockly builds the
 * block from; building one would want the extensions a rendered editor has.
 */
const shapeOf = (definition: {args0?: Array<{type: string; name?: string}>}) =>
  (definition.args0 ?? [])
    .filter(arg => arg.type === 'input_end_row' || arg.type === 'input_value')
    .map(arg => (arg.type === 'input_end_row' ? '|' : arg.name!));

describe('settledParts', () => {
  it('keeps a break between two things', () => {
    expect(settledParts(SPLIT)).toEqual(SPLIT);
  });

  it('drops one at the start, at the end, or after another', () => {
    expect(settledParts([row, ...SPLIT, row])).toEqual(SPLIT);
    expect(settledParts([label('a'), row, row, label('b')])).toEqual([
      label('a'),
      row,
      label('b'),
    ]);
    expect(settledParts([row, row])).toEqual([]);
  });
});

describe('endsNothing', () => {
  it('names the breaks settledParts would drop', () => {
    const parts = [row, label('a'), row, row, label('b'), row];
    expect(parts.map((_, at) => endsNothing(parts, at))).toEqual([
      true,
      false,
      false,
      true,
      false,
      true,
    ]);
  });
});

describe('a design with a line break', () => {
  const split = parseActorOwnMeta('actors/healer', actorFile(SPLIT))!;
  const whole = parseActorOwnMeta('actors/healer', actorFile(WHOLE))!;
  const minted = buildDomainPalette([], {ownProperties: [split]}).blocks.filter(
    block => /ActorsHealer.*HealByFor/.test(block.type),
  ) as Array<{type: string; args0?: Array<{type: string; name?: string}>}>;
  const call = minted.find(block => block.type.startsWith('world_do_'))!;

  it('is named and takes values as it does without one', () => {
    expect(split.actions[0].name).toBe(whole.actions[0].name);
    expect(split.actions[0].params).toEqual(whole.actions[0].params);
    expect(split.events[0].name).toBe(whole.events[0].name);
  });

  it('carries the break through to the parts the palette reads', () => {
    expect(split.actions[0].parts?.map(part => part.kind)).toEqual([
      'label',
      'param',
      'row',
      'label',
      'param',
    ]);
  });

  it('makes a call that wraps where the break is', () => {
    expect(call).toBeDefined();
    const shape = shapeOf(call);
    expect(shape.indexOf('|')).toBeGreaterThan(0);
    // Its two values and its subject, one value before the break.
    expect(shape.filter(input => input !== '|')).toHaveLength(3);
    expect(shape.slice(0, shape.indexOf('|'))).toHaveLength(1);
  });

  it('makes a hat and a raise that wrap there too', () => {
    const others = minted.filter(block => block !== call);
    expect(others.length).toBeGreaterThanOrEqual(2);
    for (const block of others) {
      expect(shapeOf(block), block.type).toContain('|');
    }
  });
});

// A `.rule` written before steps were members.
//
// The failure this guards is silent and total: `world_rule_step_in` has a
// previous connection now, and `DisableOrphansPlugin` reads a top-level block
// with one as an orphan — so an unupgraded step and everything under it draws
// greyed out and generates nothing, with no message saying why.

import {describe, expect, it} from 'vitest';

import {upgradeRuleDocument} from '../ruleUpgrade';

interface Block {
  type?: string;
  fields?: Record<string, string>;
  inputs?: Record<string, {block?: Block}>;
  next?: {block?: Block};
  x?: number;
  y?: number;
}

const doc = (...blocks: Block[]) => ({blocks: {languageVersion: 0, blocks}});

const rule = (...members: Block[]): Block => ({
  type: 'world_rule',
  fields: {NAME: 'Gravity'},
  ...(members.length
    ? {
        next: {
          block: members.reduceRight<Block | undefined>(
            (rest, member) => ({
              ...member,
              ...(rest ? {next: {block: rest}} : {}),
            }),
            undefined,
          )!,
        },
      }
    : {}),
});

const step = (name: string, body?: Block): Block => ({
  type: 'world_rule_step_in',
  fields: {NAME: name, PHASE: 'push'},
  x: 40,
  y: 900,
  ...(body ? {next: {block: body}} : {}),
});

const say = (text: string): Block => ({
  type: 'world_comment',
  fields: {TEXT: text},
});

/** The rule's members, in order. */
const members = (document: unknown): Block[] => {
  const roots =
    (document as {blocks?: {blocks?: Block[]}}).blocks?.blocks ?? [];
  const owner = roots.find(block => block.type === 'world_rule');
  const out: Block[] = [];
  for (let at = owner?.next?.block; at; at = at.next?.block) {
    out.push(at);
  }
  return out;
};

const roots = (document: unknown): string[] =>
  ((document as {blocks?: {blocks?: Block[]}}).blocks?.blocks ?? []).map(
    block => block.type ?? '?',
  );

describe('a rule whose steps stood beside it', () => {
  it('chains them onto the rule, with the body in the mouth', () => {
    const upgraded = upgradeRuleDocument(
      doc(rule(), step('apply velocity', say('work'))),
    );

    expect(roots(upgraded)).toEqual(['world_rule']);
    const [moved] = members(upgraded);
    expect(moved.type).toBe('world_rule_step_in');
    expect(moved.inputs?.DO?.block).toMatchObject({fields: {TEXT: 'work'}});
    // The chain below is the member AFTER it now, and this one is last.
    expect(moved.next).toBeUndefined();
  });

  it('keeps the members the rule already had, and adds after them', () => {
    const upgraded = upgradeRuleDocument(
      doc(
        rule({type: 'world_rule_property', fields: {NAME: 'mass'}}),
        step('apply velocity', say('work')),
      ),
    );

    expect(members(upgraded).map(block => block.type)).toEqual([
      'world_rule_property',
      'world_rule_step_in',
    ]);
  });

  it('keeps several in the order they stood in', () => {
    const upgraded = upgradeRuleDocument(
      doc(rule(), step('first', say('a')), step('second', say('b'))),
    );

    expect(members(upgraded).map(block => block.fields?.NAME)).toEqual([
      'first',
      'second',
    ]);
  });

  it('drops where they sat, which meant nothing once they are members', () => {
    const [moved] = members(
      upgradeRuleDocument(doc(rule(), step('apply velocity', say('work')))),
    );

    expect(moved.x).toBeUndefined();
    expect(moved.y).toBeUndefined();
  });

  it('carries a step that never had a body', () => {
    const [moved] = members(upgradeRuleDocument(doc(rule(), step('empty'))));

    expect(moved.type).toBe('world_rule_step_in');
    expect(moved.inputs?.DO).toBeUndefined();
  });

  it('leaves the traits beside the rule, which is still where they live', () => {
    const upgraded = upgradeRuleDocument(
      doc(
        rule(),
        {type: 'world_rule_trait', fields: {NAME: 'Affected'}},
        step('apply velocity', say('work')),
      ),
    );

    expect(roots(upgraded)).toEqual(['world_rule', 'world_rule_trait']);
  });
});

describe('a rule that needs nothing doing to it', () => {
  it('is handed back untouched, the same object', () => {
    // Every file written since the change, which is all of them but a
    // learner's own saves — so this is the path that runs, and it should cost
    // a scan of the roots and nothing else.
    const already = doc(
      rule({type: 'world_rule_step_in', fields: {NAME: 'x'}}),
    );

    expect(upgradeRuleDocument(already)).toBe(already);
  });

  it('does not invent a rule to hang steps on', () => {
    // Steps and no rule is not a shape this can mend, and guessing would make
    // a worse file than the one it was handed.
    const orphaned = doc(step('apply velocity', say('work')));

    expect(upgradeRuleDocument(orphaned)).toBe(orphaned);
  });
});

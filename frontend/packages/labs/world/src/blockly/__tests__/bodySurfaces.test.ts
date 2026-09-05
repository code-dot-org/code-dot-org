// Splitting a workspace from its bodies, and putting them back.
//
// The failure this guards is silent: a merge that drops a body writes a rule
// whose steps are empty, and nothing throws. So the test that matters is the
// last one — every stock rule, split and merged, byte for byte what it was.

import {describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../../rules/stock';
import {hasBody, merge, reap, split} from '../bodySurfaces';

/** A step whose body is the chain that follows it. */
const ruleStep = (id: string, body: unknown) => ({
  type: 'world_rule_step_in',
  id,
  fields: {NAME: 'applyVelocity', PHASE: 'push'},
  next: {block: body},
});

/** A designed block, whose body is its `DO` socket. */
const designed = (id: string, body: unknown) => ({
  type: 'world_rule_block',
  id,
  fields: {RETURNS: 'none'},
  inputs: {DO: {block: body}},
});

const doc = (...roots: unknown[]) =>
  ({blocks: {languageVersion: 0, blocks: roots}}) as never;

const statement = (text: string) => ({
  type: 'world_comment',
  fields: {TEXT: text},
});

/** One saved block, loosely — a test reads fields the type does not promise. */
interface Saved {
  type: string;
  id?: string;
  inputs?: Record<string, {block?: Saved}>;
  next?: {block: Saved};
}

/** The roots of a document, as blocks a test can look inside. */
const rootsOf = (document: unknown): Saved[] =>
  ((document as {blocks?: {blocks?: Saved[]}}).blocks?.blocks ?? []) as Saved[];

describe('hasBody', () => {
  it('knows the two shapes a body takes, and nothing else', () => {
    expect(hasBody('world_rule_step_in')).toBe(true);
    expect(hasBody('world_rule_step_tick')).toBe(true);
    expect(hasBody('world_rule_block')).toBe(true);
    expect(hasBody('world_trait_step')).toBe(true);
    // A rule's and a trait's `next` is their MEMBER list, not a body.
    expect(hasBody('world_rule')).toBe(false);
    expect(hasBody('world_rule_trait')).toBe(false);
    expect(hasBody('world_rule_property')).toBe(false);
  });
});

describe('split', () => {
  it('takes a hat’s next chain', () => {
    const {shown, bodies} = split(doc(ruleStep('s1', statement('work'))));

    expect(rootsOf(shown)[0]).not.toHaveProperty('next');
    expect(bodies.s1).toMatchObject({type: 'world_comment'});
  });

  it('takes a member’s DO socket', () => {
    const {shown, bodies} = split(doc(designed('b1', statement('work'))));

    expect(rootsOf(shown)[0].inputs).toEqual({});
    expect(bodies.b1).toMatchObject({type: 'world_comment'});
  });

  it('keeps a rule’s members, which are also a `next` chain', () => {
    // The distinction the whole module turns on: `next` under `define rule` is
    // what it declares, and emptying it would empty the file.
    const rule = {
      type: 'world_rule',
      id: 'r1',
      fields: {NAME: 'Gravity'},
      next: {block: {type: 'world_rule_property', id: 'p1'}},
    };
    const {shown, bodies} = split(doc(rule));

    expect(rootsOf(shown)[0].next?.block.type).toBe('world_rule_property');
    expect(bodies).toEqual({});
  });

  it('reaches a step nested under a trait', () => {
    const trait = {
      type: 'world_rule_trait',
      id: 't1',
      fields: {NAME: 'Affected by Gravity'},
      next: {
        block: {
          type: 'world_trait_step',
          id: 'ts1',
          inputs: {DO: {block: statement('fall')}},
        },
      },
    };
    const {shown, bodies} = split(doc(trait));

    expect(rootsOf(shown)[0].next?.block.inputs).toEqual({});
    expect(bodies.ts1).toMatchObject({type: 'world_comment'});
  });

  it('mints an id for a block that has none', () => {
    // The generated stock rules carry no ids; a body has to be keyed by
    // something, so the split is what gives them one.
    const {shown, bodies} = split(
      doc({
        type: 'world_rule_step_in',
        fields: {NAME: 'x', PHASE: 'push'},
        next: {block: statement('work')},
      }),
    );
    const id = rootsOf(shown)[0].id as string;

    expect(id).toBeTruthy();
    expect(Object.keys(bodies)).toEqual([id]);
  });

  it('leaves a step that has no body alone', () => {
    const {shown, bodies} = split(
      doc({type: 'world_rule_step_in', id: 's1', fields: {NAME: 'x'}}),
    );

    expect(bodies).toEqual({});
    expect(rootsOf(shown)[0]).toMatchObject({id: 's1'});
  });
});

describe('merge', () => {
  it('puts a hat’s body back on its `next`', () => {
    const {shown, bodies} = split(doc(ruleStep('s1', statement('work'))));
    expect(merge(shown, bodies)).toEqual(
      doc(ruleStep('s1', statement('work'))),
    );
  });

  it('puts a member’s body back in its socket', () => {
    const before = doc(designed('b1', statement('work')));
    const {shown, bodies} = split(before);
    expect(merge(shown, bodies)).toEqual(before);
  });

  it('writes an empty member when its body has gone', () => {
    // What a save after a delete looks like, and it must not throw: the block
    // is still declared, it just does nothing.
    const {shown} = split(doc(ruleStep('s1', statement('work'))));
    const merged = merge(shown, {});

    expect(rootsOf(merged)[0]).not.toHaveProperty('next');
  });
});

describe('reap', () => {
  it('forgets a body whose block is gone', () => {
    // Otherwise a file grows an orphan every time a step is deleted, for the
    // life of the project.
    const {bodies} = split(
      doc(ruleStep('s1', statement('a')), ruleStep('s2', statement('b'))),
    );
    const afterDelete = split(doc(ruleStep('s1', statement('a')))).shown;

    expect(Object.keys(reap(afterDelete, bodies))).toEqual(['s1']);
  });

  it('keeps a body whose block is nested somewhere', () => {
    const trait = {
      type: 'world_rule_trait',
      id: 't1',
      next: {
        block: {
          type: 'world_trait_step',
          id: 'ts1',
          inputs: {DO: {block: statement('fall')}},
        },
      },
    };
    const {shown, bodies} = split(doc(trait));

    expect(reap(shown, bodies)).toEqual(bodies);
  });
});

describe('every stock rule survives the round trip', () => {
  // THE ONE THAT MATTERS. A merge that drops a body does not throw; it writes
  // a rule whose steps are empty and a game that quietly stops working. Forty-
  // seven rules, split and put back, compared against what went in.
  it.each(STOCK_RULES.map(rule => rule.id))('%s', id => {
    const before = JSON.parse(
      STOCK_RULES.find(rule => rule.id === id)!.contents,
    );
    const {shown, bodies} = split(before);
    const after = merge(shown, bodies);

    // Ids are the one difference the split is allowed to make: the stock
    // rules carry none and a body has to be keyed by something.
    const withoutIds = (node: unknown): unknown => {
      if (Array.isArray(node)) {
        return node.map(withoutIds);
      }
      if (node && typeof node === 'object') {
        return Object.fromEntries(
          Object.entries(node as Record<string, unknown>)
            .filter(([key]) => key !== 'id')
            .map(([key, value]) => [key, withoutIds(value)]),
        );
      }
      return node;
    };
    expect(withoutIds(after)).toEqual(withoutIds(before));
  });

  it('actually hides something in the rules that matter', () => {
    // A round trip that split nothing would pass every test above.
    const solid = JSON.parse(
      STOCK_RULES.find(rule => rule.id === 'solid')!.contents,
    );
    const {shown, bodies} = split(solid);
    const count = (document: {blocks?: {blocks?: unknown[]}}): number => {
      const one = (node: Record<string, unknown>): number => {
        let n = 1;
        for (const socket of Object.values(
          (node.inputs ?? {}) as Record<string, {block?: unknown}>,
        )) {
          if (socket.block) {
            n += one(socket.block as Record<string, unknown>);
          }
        }
        const next = node.next as {block?: unknown} | undefined;
        if (next?.block) {
          n += one(next.block as Record<string, unknown>);
        }
        return n;
      };
      return (document.blocks?.blocks ?? []).reduce(
        (sum: number, block) => sum + one(block as Record<string, unknown>),
        0,
      );
    };

    expect(count(solid)).toBeGreaterThan(400);
    expect(count(shown)).toBeLessThan(30);
    expect(Object.keys(bodies).length).toBeGreaterThan(0);
  });
});

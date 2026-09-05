// Splitting a workspace from its bodies, and putting them back.
//
// The failure this guards is silent: a merge that drops a body writes a rule
// whose steps are empty, and nothing throws. So the test that matters is the
// last one — every stock rule, split and merged, byte for byte what it was.

import {describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../../rules/stock';
import {
  BODY_OWNER_ID,
  createBodySeam,
  hasBody,
  merge,
  reap,
  split,
} from '../bodySurfaces';

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

/** A body surface as the workspace would save it: the head, body under it. */
const surface = (body?: unknown) =>
  ({
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'world_rule_step_in',
          id: BODY_OWNER_ID,
          ...(body ? {next: {block: body}} : {}),
        },
      ],
    },
  }) as never;

/** What a body surface is holding, which is the head's `next`. */
const bodyOn = (document: unknown): unknown =>
  rootsOf(document)[0]?.next?.block;

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

describe('the editor seam', () => {
  // What the editor does with it: `show` on the way in, `read` on the way
  // out, and a workspace in between that never held a body. The falsification
  // that produced this file: with `read` handing back the interface instead of
  // the merged document, all 4,198 tests in the suite still passed — nothing
  // else in the lab can see a body being dropped.

  /** What Blockly hands back: what was loaded, with the ids it kept. */
  const asSaved = (shown: unknown) => JSON.parse(JSON.stringify(shown));

  it('gives the file back whole after a save that changed nothing', () => {
    const before = doc(ruleStep('s1', statement('work')));
    const seam = createBodySeam();

    const shown = seam.show(before);
    expect(rootsOf(shown)[0]).not.toHaveProperty('next');
    expect(seam.read(asSaved(shown))).toEqual(before);
  });

  it('keeps every body through a real rule', () => {
    const solid = JSON.parse(
      STOCK_RULES.find(rule => rule.id === 'solid')!.contents,
    );
    const seam = createBodySeam();

    const shown = seam.show(solid);
    const read = seam.read(asSaved(shown));

    expect(rootsOf(read)).toEqual(rootsOf(seam.read(asSaved(shown))));
    expect(JSON.stringify(read).length).toBeGreaterThan(
      JSON.stringify(shown).length * 5,
    );
  });

  it('leaves the rest of the file alone when a step is deleted', () => {
    // `reap` also forgets the deleted step's body, which this cannot see: an
    // orphan is invisible in the output either way, because `merge` only puts
    // a body back on a block that is still there. That is why reaping is
    // tested against the function above rather than here — it bounds what the
    // editor holds, which is not a claim about the file.
    const seam = createBodySeam();
    const shown = seam.show(
      doc(ruleStep('s1', statement('a')), ruleStep('s2', statement('b'))),
    );
    const roots = rootsOf(shown);

    const afterDelete = {blocks: {...shown.blocks, blocks: [roots[0]]}};
    const read = seam.read(afterDelete as never);

    expect(rootsOf(read)).toHaveLength(1);
    expect(rootsOf(read)[0].next?.block).toMatchObject({
      fields: {TEXT: 'a'},
    });
  });

  it('forgets the old file when it is shown a new one', () => {
    // A rename reloads the whole document. Bodies carried over from the last
    // one would reattach to whatever happens to share an id — so the case
    // that tells is a step which HAD a body and now has none, where a leaked
    // body comes back from a file the learner has moved on from.
    const seam = createBodySeam();
    seam.show(doc(ruleStep('s1', statement('old'))));
    const shown = seam.show(
      doc({
        type: 'world_rule_step_in',
        id: 's1',
        fields: {NAME: 'applyVelocity', PHASE: 'push'},
      }),
    );

    expect(rootsOf(seam.read(asSaved(shown)))[0]).not.toHaveProperty('next');
  });
});

describe('opening one member’s body', () => {
  it('hands back what the split took from that block', () => {
    // What the pencil does: the id comes off a block in the workspace, which
    // is a block the split put there, so the two have to agree.
    const solid = JSON.parse(
      STOCK_RULES.find(rule => rule.id === 'solid')!.contents,
    );
    const seam = createBodySeam();
    const shown = seam.show(solid);

    const steps = rootsOf(shown).filter(
      root => root.type === 'world_rule_step_in',
    );
    expect(steps.length).toBeGreaterThan(0);

    for (const step of steps) {
      const [head, ...rest] = rootsOf(seam.bodyOf(step.id!, shown));

      // One root, and it is the member's own block standing in for itself:
      // same type, same fields, under an id that says which surface this is.
      expect(rest, `${step.id}`).toEqual([]);
      expect(head.id, `${step.id}`).toBe(BODY_OWNER_ID);
      expect(head.type, `${step.id}`).toBe(step.type);
      expect(
        (head as unknown as {fields?: unknown}).fields,
        `${step.id}`,
      ).toEqual((step as unknown as {fields?: unknown}).fields);
      expect(head.next?.block, `${step.id}`).toBeTruthy();
    }
  });

  it('heads the surface even when the body is empty', () => {
    // The head is what a body is attached TO. An empty body that opened an
    // empty workspace would leave nothing to attach to and nothing saying
    // which member the surface belongs to.
    const seam = createBodySeam();
    const shown = seam.show(
      doc({type: 'world_rule_step_in', id: 's1', fields: {NAME: 'x'}}),
    );
    const [head] = rootsOf(seam.bodyOf('s1', shown));

    expect(head.id).toBe(BODY_OWNER_ID);
    expect(head.next).toBeUndefined();
  });

  it('drops the member chain, which belongs to the interface', () => {
    // `define block`'s `next` is the member AFTER it, and the head's `next` is
    // read back as the body. So a member with NOTHING in it is the case that
    // tells: carry the chain over and the rest of the rule becomes this
    // member's implementation, and the next save writes it there. With a body
    // present the bug hides, because the body overwrites the chain.
    const seam = createBodySeam();
    const shown = seam.show(
      doc({
        type: 'world_rule_block',
        id: 'b1',
        fields: {RETURNS: 'none'},
        next: {block: {type: 'world_rule_property', id: 'p1'}},
      }),
    );
    const [head] = rootsOf(seam.bodyOf('b1', shown));

    expect(head.id).toBe(BODY_OWNER_ID);
    expect(head.next).toBeUndefined();
  });

  it('is empty for a block that has no body, rather than throwing', () => {
    const seam = createBodySeam();
    const shown = seam.show(doc(ruleStep('s1', statement('work'))));
    expect(rootsOf(seam.bodyOf('nobody', shown))).toEqual([]);
  });
});

describe('editing one body and writing the file', () => {
  // THE REGRESSION. The editor stored an edited body, wrote the file, and the
  // file came back carrying the ORIGINAL body — 473 blocks where 472 was
  // right. Storing and writing are two calls with the interface held in
  // between, and only the pair is worth testing: `setBody` alone looked
  // correct the whole time it was broken.
  //
  // The other half is the one that looked fine: a write that lost every body
  // EXCEPT the edited one would satisfy any check aimed at the edit.

  /** The block with this id, wherever it sits. */
  const findById = (document: unknown, id: string): Saved | undefined => {
    const walk = (block: Saved): Saved | undefined => {
      if (block.id === id) {
        return block;
      }
      for (const socket of Object.values(block.inputs ?? {})) {
        const hit = socket.block && walk(socket.block);
        if (hit) {
          return hit;
        }
      }
      return block.next?.block ? walk(block.next.block) : undefined;
    };
    for (const root of rootsOf(document)) {
      const hit = walk(root);
      if (hit) {
        return hit;
      }
    }
    return undefined;
  };

  /** What that block runs, whichever of the two places holds it. */
  const bodyIn = (document: unknown, id: string): unknown => {
    const block = findById(document, id);
    return block?.inputs?.DO?.block ?? block?.next?.block;
  };

  const solidDocument = () =>
    JSON.parse(STOCK_RULES.find(rule => rule.id === 'solid')!.contents);

  /** Every block the split took a body from. */
  const owners = (shown: unknown): string[] => {
    const found: string[] = [];
    const walk = (block: Saved): void => {
      if (block.id && hasBody(block.type)) {
        found.push(block.id);
      }
      for (const socket of Object.values(block.inputs ?? {})) {
        if (socket.block) {
          walk(socket.block);
        }
      }
      if (block.next?.block) {
        walk(block.next.block);
      }
    };
    rootsOf(shown).forEach(walk);
    return found;
  };

  it('puts the edit in the file and leaves every other body whole', () => {
    const solid = solidDocument();
    const seam = createBodySeam();
    // What the editor holds while a body is open: the interface, saved.
    const held = seam.show(solid);
    const ids = owners(held);
    expect(ids.length).toBeGreaterThan(1);

    const [edited, ...untouched] = ids;
    const before = Object.fromEntries(
      untouched.map(id => [id, bodyOn(seam.bodyOf(id, held))]),
    );

    seam.setBody(edited, surface(statement('what the learner left')));
    const file = seam.read(held);

    expect(bodyIn(file, edited)).toMatchObject({
      fields: {TEXT: 'what the learner left'},
    });
    for (const id of untouched) {
      expect(bodyIn(file, id), id).toEqual(before[id]);
    }
  });

  it('writes a file the split can take apart again', () => {
    // The editor does not stop after one edit. A file that merged correctly
    // once but could not be re-split would strand every body on the next
    // load, which is the same loss one save later.
    const seam = createBodySeam();
    const held = seam.show(solidDocument());
    const [first] = owners(held);
    seam.setBody(first, surface(statement('again')));

    const again = createBodySeam();
    const reshown = again.show(seam.read(held));

    expect(owners(reshown)).toEqual(owners(held));
    expect(bodyOn(again.bodyOf(first, reshown))).toMatchObject({
      fields: {TEXT: 'again'},
    });
  });

  it('forgets a deleted member’s body, which only the seam can show', () => {
    // Written after the first version of this test passed with `reap` taken
    // out. A dropped orphan is invisible in the file either way — `merge`
    // only puts a body back on a block that is still there — so the claim has
    // to be made against what the seam still holds.
    const seam = createBodySeam();
    const held = seam.show(
      doc(ruleStep('s1', statement('a')), ruleStep('s2', statement('b'))),
    );
    expect(bodyOn(seam.bodyOf('s2', held))).toBeTruthy();

    const afterDelete = {
      blocks: {...held.blocks, blocks: [rootsOf(held)[0]]},
    };
    seam.read(afterDelete as never);

    // Asked against the interface that still names s2, so a head still comes
    // back: what is gone is the body under it.
    expect(bodyOn(seam.bodyOf('s2', held))).toBeUndefined();
  });

  it('ignores a save from a surface that is not a body', () => {
    // The guard the first attempt did without. A workspace holding no head is
    // not "the learner emptied this member" — it is the interface, or a load
    // in progress — and storing it deleted bodies and wrote the result.
    const seam = createBodySeam();
    const held = seam.show(doc(ruleStep('s1', statement('a'))));

    seam.setBody('s1', doc(statement('not a body surface')));

    expect(bodyOn(seam.bodyOf('s1', held))).toMatchObject({
      fields: {TEXT: 'a'},
    });
  });

  it('empties a member when the head comes back with nothing under it', () => {
    // …and the other half: a head with an empty socket IS the learner
    // clearing it out, and has to be written.
    const seam = createBodySeam();
    const held = seam.show(doc(ruleStep('s1', statement('a'))));

    seam.setBody('s1', surface());

    expect(bodyOn(seam.bodyOf('s1', held))).toBeUndefined();
    expect(rootsOf(seam.read(held))[0]).not.toHaveProperty('next');
  });
});

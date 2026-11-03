// Splitting a workspace from its bodies, and putting them back.
//
// The failure this guards is silent: a merge that drops a body writes steps
// and drawings that are empty, and nothing throws. So the test that matters is
// every stock actor's code, split and merged, byte for byte what it was.

import {describe, expect, it} from 'vitest';

import type {ActorData} from '../../actors/actorData';
import {STOCK_ACTORS} from '../../actors/stock';
import {
  BODY_OWNER_ID,
  createBodySeam,
  hasBody,
  merge,
  reap,
  split,
} from '../bodySurfaces';

/** `each frame`, whose body is its `DO` mouth. */
const ruleStep = (id: string, body: unknown) => ({
  type: 'world_trait_step',
  id,
  fields: {NAME: 'applyVelocity', PHASE: 'push'},
  inputs: {DO: {block: body}},
});

/** `define drawing`, whose body is its `DO` socket too. */
const designed = (id: string, body: unknown) => ({
  type: 'world_define_drawing',
  id,
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
const surface = (body?: unknown, fields?: Record<string, unknown>) =>
  ({
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'world_define_drawing',
          id: BODY_OWNER_ID,
          ...(fields ? {fields} : {}),
          ...(body ? {next: {block: body}} : {}),
        },
      ],
    },
  }) as never;

/** What a body surface is holding, which is the head's `next`. */
const bodyOn = (document: unknown): unknown =>
  rootsOf(document)[0]?.next?.block;

describe('hasBody', () => {
  it('knows the two blocks a body hangs off, and nothing else', () => {
    expect(hasBody('world_trait_step')).toBe(true);
    expect(hasBody('world_define_drawing')).toBe(true);
    // A hat's `next` is the handler itself, and stays on the surface.
    expect(hasBody('world_on_Space_CreatedEvent')).toBe(false);
  });
});

describe('split', () => {
  it('takes a step’s `DO` mouth', () => {
    const {shown, bodies} = split(doc(ruleStep('s1', statement('work'))));

    expect(rootsOf(shown)[0].inputs).toEqual({});
    expect(bodies.s1).toMatchObject({type: 'world_comment'});
  });

  it('takes a member’s DO socket', () => {
    const {shown, bodies} = split(doc(designed('b1', statement('work'))));

    expect(rootsOf(shown)[0].inputs).toEqual({});
    expect(bodies.b1).toMatchObject({type: 'world_comment'});
  });

  it('keeps a handler, whose `next` is the handler itself', () => {
    // The distinction the whole module turns on: a hat's `next` is what it
    // does, and taking it would empty the file.
    const hat = {
      type: 'world_on_Space_CreatedEvent',
      id: 'h1',
      next: {block: statement('made')},
    };
    const {shown, bodies} = split(doc(hat));

    expect(rootsOf(shown)[0].next?.block.type).toBe('world_comment');
    expect(bodies).toEqual({});
  });

  it('reaches a step chained under another block', () => {
    const trait = {
      type: 'world_on_Space_CreatedEvent',
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

    expect(rootsOf(shown)[0].next?.block.inputs).toEqual({});
    expect(bodies.ts1).toMatchObject({type: 'world_comment'});
  });

  it('mints an id for a block that has none', () => {
    // A generated file carries no ids; a body has to be keyed by
    // something, so the split is what gives them one.
    const {shown, bodies} = split(
      doc({
        type: 'world_trait_step',
        fields: {NAME: 'x', PHASE: 'push'},
        inputs: {DO: {block: statement('work')}},
      }),
    );
    const id = rootsOf(shown)[0].id as string;

    expect(id).toBeTruthy();
    expect(Object.keys(bodies)).toEqual([id]);
  });

  it('leaves a step that has no body alone', () => {
    const {shown, bodies} = split(
      doc({type: 'world_trait_step', id: 's1', fields: {NAME: 'x'}}),
    );

    expect(bodies).toEqual({});
    expect(rootsOf(shown)[0]).toMatchObject({id: 's1'});
  });
});

describe('merge', () => {
  it('puts a step’s body back in its mouth', () => {
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

    expect(rootsOf(merged)[0].inputs).toEqual({});
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
      type: 'world_on_Space_CreatedEvent',
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

/**
 * A stock actor's drawing, steps and handlers as roots of one workspace: the
 * blocks the surfaces were written for, which are data in the file now
 * (specs/DRAWING_PAGE_PLAN.md).
 */
const rootsOfActor = (contents: string): unknown[] => {
  const data = JSON.parse(contents) as ActorData;
  return [
    ...(data.drawing
      ? [
          {
            type: 'world_define_drawing',
            inputs: {
              WIDTH: data.drawing.width,
              HEIGHT: data.drawing.height,
              ...(data.drawing.body ? {DO: {block: data.drawing.body}} : {}),
            },
          },
        ]
      : []),
    ...(data.steps ?? []).map(step => ({
      type: 'world_trait_step',
      fields: {PHASE: step.phase ?? 'decide', NAME: step.name},
      ...(step.body ? {inputs: {DO: {block: step.body}}} : {}),
    })),
    ...(data.blocks?.blocks?.blocks ?? []),
  ];
};

/** Every stock actor's code as one workspace: drawings, steps and handlers. */
const EVERY_ACTORS_CODE = {
  blocks: {
    languageVersion: 0,
    blocks: STOCK_ACTORS.flatMap(actor => rootsOfActor(actor.contents)),
  },
} as never;

/** A stock actor's code, as the editor opens it. */
const codeOf = (id: string) =>
  ({
    blocks: {
      languageVersion: 0,
      blocks: rootsOfActor(
        STOCK_ACTORS.find(actor => actor.id === id)!.contents,
      ),
    },
  }) as never;

describe('every stock actor’s code survives the round trip', () => {
  // THE ONE THAT MATTERS. A merge that drops a body does not throw; it writes
  // a handler that does nothing and a game that quietly stops working. Every
  // stock actor's code, split and put back, compared against what went in.
  it.each(STOCK_ACTORS.map(actor => actor.id))('%s', id => {
    const before = codeOf(id);
    const {shown, bodies} = split(before);
    const after = merge(shown, bodies);

    // Ids are the one difference the split is allowed to make: the stock
    // actors carry none and a body has to be keyed by something.
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

  it('actually hides something in the actors that matter', () => {
    // A round trip that split nothing would pass every test above.
    const area = EVERY_ACTORS_CODE;
    const {shown, bodies} = split(area);
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

    // Handlers stay on the surface; drawings and steps go behind the pencil.
    expect(count(shown)).toBeLessThan(count(area) * 0.8);
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

  it('keeps every body through every stock actor’s code', () => {
    const code = JSON.parse(JSON.stringify(EVERY_ACTORS_CODE));
    const seam = createBodySeam();

    const shown = seam.show(code);
    const read = seam.read(asSaved(shown));

    expect(rootsOf(read)).toEqual(rootsOf(seam.read(asSaved(shown))));
    expect(JSON.stringify(read).length).toBeGreaterThan(
      JSON.stringify(shown).length,
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
    expect(rootsOf(read)[0].inputs?.DO?.block).toMatchObject({
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
        type: 'world_trait_step',
        id: 's1',
        fields: {NAME: 'applyVelocity', PHASE: 'push'},
      }),
    );

    expect(rootsOf(seam.read(asSaved(shown)))[0].inputs?.DO).toBeUndefined();
  });
});

describe('opening one member’s body', () => {
  it('hands back what the split took from that block', () => {
    // What the pencil does: the id comes off a block in the workspace, which
    // is a block the split put there, so the two have to agree.
    const code = JSON.parse(JSON.stringify(EVERY_ACTORS_CODE));
    const seam = createBodySeam();
    const shown = seam.show(code);

    // Everything with a body, wherever it sits in the document.
    const steps: Saved[] = [];
    const walk = (block: Saved): void => {
      if (block.id && hasBody(block.type)) {
        steps.push(block);
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
      doc({type: 'world_trait_step', id: 's1', fields: {NAME: 'x'}}),
    );
    const [head] = rootsOf(seam.bodyOf('s1', shown));

    expect(head.id).toBe(BODY_OWNER_ID);
    expect(head.next).toBeUndefined();
  });

  it('drops what follows the block, which belongs to the interface', () => {
    // The head's `next` is read back as the body. So a block with NOTHING in
    // it is the case that tells: carry what follows it over and that becomes
    // its implementation, and the next save writes it there. With a body
    // present the bug hides, because the body overwrites it.
    const seam = createBodySeam();
    const shown = seam.show(
      doc({
        type: 'world_define_drawing',
        id: 'b1',
        next: {block: statement('after')},
      }),
    );
    const [head] = rootsOf(seam.bodyOf('b1', shown));

    expect(head.id).toBe(BODY_OWNER_ID);
    expect(head.next).toBeUndefined();
  });

  it('places the head where every workspace puts its root', () => {
    // Not where the member sat on the interface, which in a long workspace
    // is somewhere off the side, and not at the origin either — the
    // lab's own starter files all put a root at 20,20 (`constants.ts`), and a
    // head in the corner is the one workspace that looks wrong.
    const seam = createBodySeam();
    const shown = seam.show(
      doc({...ruleStep('s1', statement('work')), x: 900, y: 640}),
    );
    const [head] = rootsOf(seam.bodyOf('s1', shown));

    expect(head).toMatchObject({x: 20, y: 20});
  });

  it('carries the file’s variables onto the surface', () => {
    // A parameter IS a variable, and the body reads it with an ordinary
    // getter. Load a surface without them and the head binds its parameters
    // against a workspace where the body's variables are strangers — which
    // shows up as a rename to `amount2`, the name taken by the same variable
    // under another identity.
    const seam = createBodySeam();
    const shown = seam.show({
      variables: [{name: 'amount', id: 'v1', type: 'number'}],
      blocks: {languageVersion: 0, blocks: [ruleStep('s1', statement('work'))]},
    } as never);

    expect(
      (seam.bodyOf('s1', shown) as {variables?: unknown}).variables,
    ).toEqual([{name: 'amount', id: 'v1', type: 'number'}]);
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

  const codeDocument = () => JSON.parse(JSON.stringify(EVERY_ACTORS_CODE));

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
    const code = codeDocument();
    const seam = createBodySeam();
    // What the editor holds while a body is open: the interface, saved.
    const held = seam.show(code);
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
    const held = seam.show(codeDocument());
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
    expect(rootsOf(seam.read(held))[0].inputs).toEqual({});
  });
});

describe('a field the head owns', () => {
  // A field changed on the body surface exists in one place only until the
  // file is written. Nothing else in the lab can see it go missing: the block
  // still renders and still compiles, it just quietly says what it said
  // before.

  const stepWith = (returns: string) =>
    doc({
      type: 'world_trait_step',
      id: 'b1',
      fields: {PHASE: returns, NAME: 'how far it fell'},
      inputs: {DO: {block: statement('work')}},
    });

  /** The block with this id in a merged document. */
  const blockIn = (document: unknown, id: string): Saved | undefined =>
    rootsOf(document).find(root => root.id === id);

  it('reaches the file', () => {
    const seam = createBodySeam();
    const held = seam.show(stepWith('decide'));

    seam.setBody('b1', surface(statement('work'), {PHASE: 'move'}));

    expect(
      (blockIn(seam.read(held), 'b1') as unknown as {fields: unknown}).fields,
    ).toMatchObject({PHASE: 'move'});
  });

  it('leaves the fields it says nothing about alone', () => {
    // The head carries every field it draws, and the merge takes them all —
    // so a field the head never had must not be wiped by the ones it did.
    const seam = createBodySeam();
    const held = seam.show(stepWith('decide'));

    seam.setBody('b1', surface(statement('work'), {PHASE: 'move'}));

    expect(
      (blockIn(seam.read(held), 'b1') as unknown as {fields: unknown}).fields,
    ).toMatchObject({NAME: 'how far it fell'});
  });

  it('comes back when the same body is opened again', () => {
    // The interface the editor holds was saved before the change and does not
    // draw this field, so it is the seam that has to remember.
    const seam = createBodySeam();
    const held = seam.show(stepWith('decide'));
    seam.setBody('b1', surface(statement('work'), {PHASE: 'move'}));

    const [head] = rootsOf(seam.bodyOf('b1', held));

    expect((head as unknown as {fields: unknown}).fields).toMatchObject({
      PHASE: 'move',
    });
  });

  it('is forgotten when the editor is shown another file', () => {
    // Otherwise a head's answer follows the learner into a file it was never
    // about, and lands on whatever happens to share an id.
    const seam = createBodySeam();
    seam.show(stepWith('decide'));
    seam.setBody('b1', surface(statement('work'), {PHASE: 'move'}));

    const held = seam.show(stepWith('decide'));

    expect(
      (blockIn(seam.read(held), 'b1') as unknown as {fields: unknown}).fields,
    ).toMatchObject({PHASE: 'decide'});
  });

  it('does not touch a block it does not belong to', () => {
    const seam = createBodySeam();
    const held = seam.show(
      doc({
        type: 'world_trait_step',
        id: 'b1',
        fields: {PHASE: 'decide'},
        inputs: {DO: {block: statement('a')}},
        next: {
          block: {
            type: 'world_trait_step',
            id: 'b2',
            fields: {PHASE: 'decide'},
            inputs: {DO: {block: statement('b')}},
          },
        },
      }),
    );

    seam.setBody('b1', surface(statement('a'), {PHASE: 'move'}));

    const file = seam.read(held);
    const second = rootsOf(file)[0].next?.block as unknown as {fields: unknown};
    expect(second.fields).toMatchObject({PHASE: 'decide'});
  });
});

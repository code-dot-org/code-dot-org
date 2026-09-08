// The typewriter, given to an actor that did not have one — as edits, and then
// as a game.
//
// A Label draws whatever `text` says and nothing else; this makes it say a
// line a few letters at a time. The claim worth checking by running rather
// than by reading is that the SAME blocks the Speech Box ships with work in
// somebody else's file: every own member's block type carries its declaring
// file, so a Label's `say` is a different block from a Speech Box's, and a
// patch that got that wrong would write a file naming blocks nothing defines
// — which compiles, generates nothing, and says so nowhere.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {typesOutTextEnhancement as typesOut} from '../typesOutText';

const LABEL = {
  kind: 'actor' as const,
  path: 'actors/label',
  name: 'Label',
};

const LINE = 'The rain had not stopped for three days.';

/** The empty scenario with a Label in it. */
const withLabel = () =>
  importStockActor(WORLD_SCENARIOS.empty.source, stockActorById('label')!)
    .source;

const at = (source: ReturnType<typeof withLabel>, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

describe('the types-out-text enhancement, as edits', () => {
  it('writes the declarations, the handler and the words it needs', () => {
    const after = typesOut.apply(withLabel(), LABEL);
    const label = at(after, 'actors/label.actor')!;

    // The line it is saying, and the pace — declared under the Label's own
    // `define actor`, so their block types carry `actors/label`.
    expect(label).toContain('the whole line');
    expect(label).toContain('letters a second');
    expect(label).toContain('world_get_ActorsLabel_TheWholeLineProperty');
    // …the event, the two blocks, and the hat that advances a letter.
    expect(label).toContain('world_rule_event');
    expect(label).toContain('world_rule_block');
    expect(label).toContain('world_on_Time_TimerFiresEvent');
    // …and the variable `say ⟨words⟩` binds its parameter to, DECLARED in the
    // workspace's own list. The block names it either way — its id is in the
    // designed signature — so looking for the id anywhere in the file would
    // pass over the case this is about: without the declaration Blockly loads
    // the block with a variable it has never heard of, and the body's getter
    // resolves to nothing.
    const workspace = JSON.parse(label) as {
      variables?: Array<{id?: string; name?: string; type?: string}>;
    };
    expect(workspace.variables).toContainEqual({
      id: 'typewriter_words',
      name: 'words',
      type: 'String',
    });
    // Time, for the clock the letters arrive on. The words themselves are
    // whatever the target already has — a Label's own properties — so there
    // is no second rule to bring (`actors/typewriter`).
    expect(at(after, 'rules/time.rule')).toBeTruthy();
  });

  it('elects the one trait a typewriter needs, once', () => {
    // The clock, and nothing else: the words are the target's own already.
    // Two `use trait` rows for one trait is a duplicate a learner reads past.
    const label = at(typesOut.apply(withLabel(), LABEL), 'actors/label.actor')!;

    expect(label.split('Time#HasATimerTrait').length - 1).toBe(1);
  });

  it('does nothing the second time', () => {
    const once = typesOut.apply(withLabel(), LABEL);
    expect(typesOut.applied(once, LABEL)).toBe(true);

    expect(at(typesOut.apply(once, LABEL), 'actors/label.actor')).toBe(
      at(once, 'actors/label.actor'),
    );
  });

  it('reads the Speech Box as already having one', () => {
    // It ships with the same blocks from the same place (`actors/typewriter`),
    // so offering it again would be offering a second copy of what is there.
    const source = importStockActor(
      WORLD_SCENARIOS.empty.source,
      stockActorById('speechBox')!,
    ).source;

    expect(
      typesOut.applied(source, {
        kind: 'actor',
        path: 'actors/speechBox',
        name: 'Speech Box',
      }),
    ).toBe(true);
  });

  it('refuses an actor a world defines for itself', () => {
    // Its body generates into a block scope, where the `export const` that a
    // `define block` and a `define event` each emit is not legal — so the
    // rows would be written and generate nothing at all (`blockly/fileKind`).
    expect(
      typesOut.refuse!({
        kind: 'actor',
        path: 'worlds/main',
        block: 'someActorDef',
        name: 'Sign',
      }),
    ).toMatch(/file of its own/);
    expect(typesOut.refuse!(LABEL)).toBeUndefined();
  });
});

describe('the types-out-text enhancement, played', () => {
  /** A world that places the enhanced Label and says a line to it. */
  const WORLD = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/label'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_do_ActorsLabel_SayAction',
                    inputs: {
                      ACTOR: {block: {type: 'world_this_actor'}},
                      VALUE: {block: {type: 'text', fields: {TEXT: LINE}}},
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  });

  const project = () => {
    const after = typesOut.apply(withLabel(), LABEL);
    const world = Object.values(after.files).find(
      file => file.name === 'main.world',
    )!;
    return projectFiles({
      ...after,
      files: {...after.files, [world.id]: {...world, contents: WORLD}},
    });
  };

  it('types the line out on the Label, and stops at the end', async () => {
    const {world, modules} = await compileProject(project());
    const text = modules['actors/label'].TextProperty;
    const label = [...world.actors][0];
    const showing = () => label.get(text as never) as string;

    // `say` clears what is showing; the first letter waits for the first
    // firing of the timer the patch gave it.
    expect(showing()).toBe('');

    for (let frame = 0; frame < 30; frame++) {
      world.tick(1 / 60);
    }
    const part = showing();
    expect(part.length).toBeGreaterThan(2);
    expect(part.length).toBeLessThan(LINE.length);
    expect(LINE.startsWith(part)).toBe(true);

    for (let frame = 0; frame < 180; frame++) {
      world.tick(1 / 60);
    }
    expect(showing()).toBe(LINE);
  });

  it('gives the Label its own blocks, not the Speech Box’s', async () => {
    // The reason the patch is built for a module path rather than written out
    // once: an own member's block type and its exported name both carry the
    // file that declared it, so two actors with typewriters have two of each
    // and neither has taken the other's place.
    const {modules} = await compileProject(project());

    expect(modules['actors/label'].SayAction).toBeDefined();
    expect(modules['actors/label'].FinishesRevealingEvent).toMatchObject({
      id: 'finishes_revealing',
      ownerId: 'Label',
    });
  });
});

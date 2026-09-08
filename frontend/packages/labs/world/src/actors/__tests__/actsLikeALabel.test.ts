// A Button and a Speech Box, PLAYED, as the Labels they say they are.
//
// Both used to repeat `use trait ⟨Shows Text⟩` and a size of their own. They
// say `acts like ⟨Label⟩` now, so the words, their size and color, and the box
// they are laid into all come across (specs/UI_ACTORS.md) — which is only
// worth saying if the inherited pieces actually arrive on an instance, and
// that is what running one checks.
//
// AND THEY ARE STILL NOT LABELS. A kind is what an instance was placed from
// and is never inherited, so a scene addressing `any ⟨Label⟩` is not
// addressing its dialogue. That half is the design, not an accident.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {IntrinsicSizeProperty} from '../../engine/rules/spatial';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

/** The empty scenario with one stock actor imported and placed. */
const placed = async (id: string) => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById(id)!,
  ).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  return compileProject(
    projectFiles({
      ...source,
      files: {
        ...source.files,
        [main.id]: {
          ...main,
          contents: JSON.stringify({
            blocks: {
              blocks: [
                {
                  type: 'world_world',
                  fields: {NAME: 'My World'},
                  next: {
                    block: {
                      type: 'world_add_actor',
                      fields: {ACTOR: `actors/${id}`},
                    },
                  },
                },
              ],
            },
          }),
        },
      },
    }),
  );
};

describe('the actors that act like a Label', () => {
  it('brings the Label with it, or it inherits nothing', async () => {
    // `acts like` names a module path, and a path naming a file the project
    // does not hold inherits nothing at all — no words, no box, no picture,
    // and nothing on screen saying why. So the shelf entry asks for it.
    for (const id of ['button', 'speechBox']) {
      const {modules} = await placed(id);
      expect(modules['actors/label'], id).toBeDefined();
    }
  });

  it('has the words, and a box of its own size', async () => {
    // `text` is the Label's trait's, and the box is the Label's own pair of
    // properties — both arrive by acting like one. The SIZES differ because
    // each overrides what it inherited in a row below `acts like`, which is
    // what reading a file downwards should mean.
    const sizes: Record<string, [number, number]> = {
      button: [96, 32],
      speechBox: [280, 96],
    };
    for (const [id, expected] of Object.entries(sizes)) {
      const {world, modules} = await placed(id);
      const actor = [...world.actors][0];
      const size = actor.get(IntrinsicSizeProperty);

      expect([size.x, size.y], id).toEqual(expected);
      // The inherited words, still readable through the rule that owns them.
      expect(
        typeof actor.get(modules['actors/label'].TextProperty as never),
        id,
      ).toBe('string');
    }
  });

  it('is not one of the Labels', async () => {
    // A kind is what an instance was placed from. `any ⟨Label⟩` finds the
    // Labels and not the buttons, which is what makes the trait — what a thing
    // can DO — the relationship worth asking about.
    const {world} = await placed('button');
    const button = [...world.actors][0];

    expect(button.type).toBe('actors/button');
    expect(button.type).not.toBe('actors/label');
  });
});

// A Speech Box typing itself out, end to end.
//
// The composition three separate pieces were built for, and the test that
// says whether they actually meet: `Reveals Text` writes `Writing`'s `text` a
// few letters at a time, and the box draws whatever `text` says right now.
// Neither knows about the other, which is the property worth pinning — it is
// what let the typewriter be written without touching a single drawing.
//
// NOT a "text box": that means a thing you type INTO everywhere else, and
// `specs/UI_ACTORS.md` reserves "Text field" for the one still waiting on a
// keyboard the world does not own.

import {describe, expect, it} from 'vitest';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {importStockRule} from '../rules/importStockRule';
import {stockRuleByName} from '../rules/stock';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const LINE = 'The door creaks open.';
const me = () => ({block: {type: 'world_this_actor'}});

const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/speechBox'},
            inputs: {
              DO: {
                block: {
                  type: 'world_add_trait',
                  fields: {TRAIT: 'Reveals Text#RevealsTextTrait'},
                  inputs: {ACTOR: me()},
                  next: {
                    block: {
                      type: 'world_set_RevealsText_TheWholeLineProperty',
                      inputs: {
                        ACTOR: me(),
                        VALUE: {block: {type: 'text', fields: {TEXT: LINE}}},
                      },
                    },
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
  const withBox = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('speechBox')!,
  ).source;
  const imported = importStockRule(
    withBox,
    stockRuleByName('Reveals Text')!,
  ).source;
  const world = Object.values(imported.files).find(
    file => file.name === 'main.world',
  )!;
  return projectFiles({
    ...imported,
    files: {...imported.files, [world.id]: {...world, contents: WORLD}},
  });
};

const run = async (seconds: number) => {
  const {world, modules} = await compileProject(project());
  const writing = modules['rules/writing'] as unknown as {TextProperty: never};
  const actor = [...world.actors][0];
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
  return {actor, writing};
};

describe('a Speech Box being read', () => {
  it('draws whatever `text` says, which is what the typewriter writes', async () => {
    const {actor, writing} = await run(0.25);
    const shown = actor.get(writing.TextProperty) as string;

    expect(LINE.startsWith(shown)).toBe(true);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.length).toBeLessThan(LINE.length);
  });

  it('ends on the whole line', async () => {
    const {actor, writing} = await run(3);

    expect(actor.get(writing.TextProperty)).toBe(LINE);
  });

  it('is drawn as a paragraph, so a sentence has somewhere to go', async () => {
    // The reason `draw paragraph` had to exist first: canvas draws one line
    // and ignores newlines, so before it a box of dialogue was not something
    // this lab could draw at all.
    const box = stockActorById('speechBox')!;

    expect(box.contents).toContain('world_draw_paragraph');
    expect(box.contents).not.toContain('world_draw_text');
  });

  it('is anchored at its top left, so it fills downward as it is read', async () => {
    // A centered box would jump about as each line arrived.
    const box = stockActorById('speechBox')!;

    expect(box.contents).toContain('top left');
  });
});

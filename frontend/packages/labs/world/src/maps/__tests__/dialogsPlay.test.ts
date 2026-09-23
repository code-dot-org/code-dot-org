// The three arrangements, PLAYED.
//
// Each is a Panel and some Buttons, so what is worth pinning is not that they
// draw — it is what they SAY and what they cover. A confirm that could be
// clicked past would be a picture of a dialog; a tab bar that named the
// project's screens would not be reusable; a message that stopped the app
// would be a dialog (specs/UI_ACTORS.md, specs/MODALITY_PLAN.md).

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import type {Actor, World} from '../../engine';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockMap} from '../importStockMap';
import {stockMapById} from '../stock';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** A button of the project's own, under whatever map is loaded over it. */
const WORLD = (map: string) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/button'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_set_position',
                    inputs: {ACTOR: me(), X: number(160), Y: number(160)},
                  },
                },
              },
              next: {block: {type: 'world_load_map', fields: {MAP: map}}},
            },
          },
        },
      ],
    },
  });

const play = async (id: string) => {
  let source = WORLD_SCENARIOS.empty.source;
  for (const actor of ['label', 'panel', 'button']) {
    source = importStockActor(source, stockActorById(actor)!).source;
  }
  // THE WORLD IS WRITTEN FIRST, and the map imported over it. A map raises the
  // world's events and declares none, so it is the import that writes `define
  // event ⟨yes⟩` into the world file (`maps/declareEvents`) — and a test that
  // replaced the world afterwards would throw those rows away and leave the
  // dialog's `emit` naming a block nothing defines.
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  source = {
    ...source,
    files: {
      ...source.files,
      [main.id]: {...main, contents: WORLD(`maps/${id}`)},
    },
  };
  source = importStockMap(source, stockMapById(id)!).source;
  const {world, modules} = await compileProject(projectFiles(source));
  world.tick(1 / 60);

  const named = (of: string) => [...world.actors].find(one => one.id === of);
  const at = (actor: Actor) => {
    const state = world.renderSnapshot().find(entry => entry.actor === actor)!;
    return {x: state.x, y: state.y};
  };
  return {
    world,
    modules,
    named,
    tap: (actor: Actor) => {
      const point = at(actor);
      world.setPointer(point, ['left']);
      world.tick(1 / 60);
      world.setPointer(point, []);
      world.tick(1 / 60);
    },
    /**
     * Count what one of the WORLD's events says, by listening for it there.
     *
     * On the world's module and not the map's: the map raises it by name and
     * the declaration the export comes from is the world's
     * (specs/MAP_EVENTS_PLAN.md).
     */
    counting: (event: string) => {
      const said: unknown[] = [];
      world.on(
        modules['worlds/main'][event] as never,
        ((_w: World, value: unknown) => said.push(value)) as never,
      );
      return said;
    },
  };
};

describe('the confirm dialog', () => {
  it('covers what it is asking about', async () => {
    const {world, named} = await play('confirm');
    // The project's own button is behind it and must not be reachable, or the
    // thing being confirmed could be done again while the question is up.
    const behind = [...world.actors].find(
      one =>
        one.type === 'actors/button' && one.id !== 'Yes' && one.id !== 'No',
    )!;
    expect(world.canReach(behind)).toBe(false);
    expect(world.canReach(named('Yes')!)).toBe(true);
  });

  it('says yes, and takes itself away', async () => {
    const {named, tap, counting} = await play('confirm');
    const said = counting('YesEvent');
    tap(named('Yes')!);
    expect(said).toHaveLength(1);
    expect(named('Ask')).toBeFalsy();
  });

  it('says no, and takes itself away too', async () => {
    const {named, tap, counting} = await play('confirm');
    const said = counting('NoEvent');
    tap(named('No')!);
    expect(said).toHaveLength(1);
    expect(named('Ask')).toBeFalsy();
  });
});

describe('the tab bar', () => {
  it('says which tab, by the word on it', async () => {
    const {named, tap, counting} = await play('tabs');
    const said = counting('ATabIsChosenEvent');
    tap(named('Tab SEARCH')!);
    expect(said).toEqual(['SEARCH']);
  });

  it('stays, because a tab bar is the thing that does not go away', async () => {
    const {named, tap} = await play('tabs');
    tap(named('Tab HOME')!);
    expect(named('Bar')).toBeTruthy();
  });

  it('does not cover the app under it', async () => {
    const {world} = await play('tabs');
    const behind = [...world.actors].find(
      one => one.type === 'actors/button' && !one.id.startsWith('Tab '),
    )!;
    expect(world.canReach(behind)).toBe(true);
  });
});

describe('the message', () => {
  it('goes when it is dismissed, and says so', async () => {
    const {named, tap, counting} = await play('message');
    const said = counting('DismissedEvent');
    expect(named('Note')).toBeTruthy();

    tap(named('Dismiss')!);
    expect(said).toHaveLength(1);
    expect(named('Note')).toBeFalsy();
  });

  it('leaves the app usable while it is up', async () => {
    const {world} = await play('message');
    const behind = [...world.actors].find(
      one => one.type === 'actors/button' && one.id !== 'Dismiss',
    )!;
    expect(world.canReach(behind)).toBe(true);
  });
});

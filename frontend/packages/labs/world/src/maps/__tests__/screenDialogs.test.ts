// A stock dialog imported into a project whose game is a Main Screen
// (specs/SCREEN_MAP_PLAN.md, step 4).
//
// A stock map raises the world's events by block types minted against
// `worlds/main`. In this shape the events are the Main Screen's, declared
// in its data, so the import has to declare them there and rename the
// map's blocks to match — or the dialog's buttons raise nothing at all.
// PLAYED, since that is the only way to see an event arrive.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import type {World} from '../../engine';
import {EMPTY_APP_PROJECT} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {declareScreenEvents} from '../declareEvents';
import {importStockMap} from '../importStockMap';
import {stockMapById} from '../stock';

/** The empty app, with what the stock dialogs are made of. */
function emptyScreenProject() {
  let source = EMPTY_APP_PROJECT;
  for (const actor of ['label', 'panel', 'button']) {
    source = importStockActor(source, stockActorById(actor)!).source;
  }
  return source;
}

describe('a stock dialog on a Main Screen', () => {
  it("declares the dialog's events in the screen's data", () => {
    const source = importStockMap(
      emptyScreenProject(),
      stockMapById('confirm')!,
    ).source;
    const screen = JSON.parse(projectFiles(source)['screens/main.screen']) as {
      events: Array<{name: string}>;
    };

    expect(screen.events.map(event => event.name).sort()).toEqual([
      'no',
      'yes',
    ]);
    // A screen of its own now (specs/SCREEN_STACK_PLAN.md, step 5).
    const map = Object.values(source.files).find(
      file => file.name === 'confirm.screen',
    )!;
    expect(map.contents).toContain('world_emit_ScreensMain_YesEvent');
    expect(map.contents).not.toContain('WorldsMain');
  });

  it('raises them on the screen when its buttons are pressed', async () => {
    const source = importStockMap(
      emptyScreenProject(),
      stockMapById('confirm')!,
    ).source;
    const {world, modules} = await compileProject(projectFiles(source));
    world.showScreen('screens/confirm');
    world.tick(1 / 60);
    const said: unknown[] = [];
    world.on(
      modules['screens/main'].YesEvent as never,
      ((_w: World, value: unknown) => said.push(value)) as never,
    );

    const yes = [...world.actors].find(one => one.id === 'Yes')!;
    const point = world.renderSnapshot().find(entry => entry.actor === yes)!;
    world.setPointer({x: point.x, y: point.y}, ['left']);
    world.tick(1 / 60);
    world.setPointer({x: point.x, y: point.y}, []);
    world.tick(1 / 60);

    expect(said).toHaveLength(1);
  });
});

describe('declareScreenEvents', () => {
  it('adds only the events the screen lacks, and keeps the rest', () => {
    const before = JSON.stringify({
      name: 'App',
      events: [{name: 'quit'}],
      actors: [],
    });
    const after = JSON.parse(
      declareScreenEvents(before, [{name: 'quit'}, {name: 'resume'}]),
    ) as {name: string; events: Array<{name: string}>};

    expect(after.events.map(event => event.name)).toEqual(['quit', 'resume']);
    expect(after.name).toBe('App');
  });

  it('leaves the file alone when nothing is missing', () => {
    const before = JSON.stringify({events: [{name: 'quit'}]});
    expect(declareScreenEvents(before, [{name: 'quit'}])).toBe(before);
  });
});

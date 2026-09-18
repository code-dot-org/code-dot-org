// A `.map` file as a generated module (specs/MAP_FIRST.md, "What it compiles
// to"; specs/MAP_SCRIPTS_PLAN.md).
//
// The file is JSON with a workspace on each placement and one for the map.
// What comes out is the arrangement as data, the map's own events as exports,
// and a script that registers each placement's hats on the actor the load
// placed under that id.

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import {assembleMapModule} from '../assembleActorModule';
import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';
import {DOMAIN_BLOCKS} from '../domainBlocks';
import {NONE_VALUE, setCurrentPlacements} from '../moduleOptions';
import {parseMapOwnMeta} from '../ownProperties';
import {projectOwnMetas} from '../projectModules';

/** A workspace holding `tops` as its top blocks. */
const workspace = (...tops: object[]) => ({blocks: {blocks: tops}});

const defineEvent = (text: string) => ({
  type: 'world_rule_event',
  extraState: {parts: [{kind: 'label', text}]},
});

/**
 * `when this actor leaves the map` → `then…` — a built-in actor hat, so the
 * generator needs no project rules to know it. A Button's click is the same
 * shape with a rule behind it (`pauseMenuPlays.test`).
 */
const whenClicked = (...then: object[]) => ({
  type: 'world_on_Space_LeftMapEvent',
  inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
  next: {
    block: then.reduceRight((next, block) => ({...block, next: {block: next}})),
  },
});

const MENU = JSON.stringify({
  type: 'map',
  size: {width: 10, height: 10},
  actors: [
    {type: 'actors/panel', id: 'Pause'},
    {
      type: 'actors/button',
      id: 'Resume',
      blocks: workspace(
        whenClicked(
          {type: 'world_resume_game'},
          {type: 'world_unload_this_map'},
        ),
      ),
    },
    {
      type: 'actors/button',
      id: 'Quit',
      blocks: workspace(
        whenClicked({type: 'world_emit_MapsMenu_QuitEvent'}),
        // …and a neighbour named as a value, plugged into `remove actor`.
        whenClicked({
          type: 'world_remove_actor',
          inputs: {
            ACTOR: {block: {type: 'world_placement', fields: {NAME: 'Pause'}}},
          },
        }),
      ),
    },
  ],
  blocks: workspace(defineEvent('quit'), {type: 'world_on_map_unloads'}),
});

/**
 * Generate one map, through the generator the runtime uses, with the map's
 * own events in the palette as the runtime would have them.
 */
const generate = async (
  contents: string,
  path = 'maps/menu.map',
): Promise<string> => {
  const ref = createRef<BlocklyGeneratorHandle>();
  const files = {[path]: contents};
  render(
    <BlocklyGenerator
      ref={ref}
      ownProperties={projectOwnMetas(files)}
      blocklyFiles={files}
    />,
  );
  await new Promise(resolve => setTimeout(resolve, 50));
  return ref.current!.generate(contents, path);
};

describe('a map’s own events', () => {
  it('are read from the map’s workspace, world-scoped, owned by the map', () => {
    const meta = parseMapOwnMeta('maps/menu', MENU, 'Menu');
    expect(meta).toMatchObject({
      modulePath: 'maps/menu',
      name: 'Menu',
      properties: [],
      actions: [],
    });
    expect(meta!.events).toEqual([
      expect.objectContaining({
        id: 'quit',
        name: 'quit',
        scope: 'world',
        ref: expect.objectContaining({
          exportName: 'QuitEvent',
          modulePath: 'maps/menu',
          own: true,
        }),
      }),
    ]);
  });

  it('are nothing for a map with no workspace, which is not listed', () => {
    expect(
      parseMapOwnMeta('maps/level', '{"type":"map","actors":[]}', 'Level'),
    ).toBeUndefined();
    expect(projectOwnMetas({'maps/menu.map': MENU})).toHaveLength(1);
  });
});

describe('the module a map compiles to', () => {
  it('exports the arrangement without its workspaces', async () => {
    const js = await generate(MENU);
    const data = JSON.parse(js.match(/^const mapData = (.*);$/m)![1]) as {
      actors: Array<Record<string, unknown>>;
      blocks?: unknown;
    };

    expect(data).toMatchObject({type: 'map', size: {width: 10, height: 10}});
    expect(data.blocks).toBeUndefined();
    expect(data.actors.map(actor => actor.id)).toEqual([
      'Pause',
      'Resume',
      'Quit',
    ]);
    expect(data.actors.every(actor => !('blocks' in actor))).toBe(true);
    expect(js).toContain('export default mapData;');
  });

  it('declares the map’s events as exports the world can import', async () => {
    const js = await generate(MENU);
    expect(js).toContain(
      'export const QuitEvent = {id: "quit", name: "quit", ownerId: "maps/menu"};',
    );
  });

  it('registers each placement’s hats on the actor placed under its id', async () => {
    const js = await generate(MENU);
    const script = js.slice(js.indexOf('mapData.script'));

    expect(script).toContain('mapData.script = (world, placed, map) => {');
    expect(script).toContain('const actor = placed["Resume"];');
    expect(script).toContain('const actor = placed["Quit"];');
    // The panel says nothing, so it has no block of its own.
    expect(script).not.toContain('placed["Pause"];');
    // An actor file's own generators, unchanged: the hat on `actor`, the
    // world's blocks, and the map's.
    expect(script).toContain('actor.on(');
    expect(script).toContain('world.resume();');
    expect(script).toContain('map.unload();');
  });

  it('raises the map’s own event locally, and names a neighbour', async () => {
    const js = await generate(MENU);
    // The map's own module: the const, not an import of itself.
    expect(js).toContain('world.emitToWorld(QuitEvent);');
    expect(js).not.toContain("from 'maps/menu'");
    expect(js).toContain('world.removeActor(placed["Pause"]);');
  });

  it('puts the map’s own hats in the script', async () => {
    const js = await generate(MENU);
    expect(js).toContain('map.onUnload((world) => {');
  });

  it('has no script when nothing in the map says anything', async () => {
    const js = await generate(
      JSON.stringify({type: 'map', actors: [{type: 'actors/coin', id: 'c'}]}),
    );
    expect(js).not.toContain('mapData.script');
    expect(js).toContain('export default mapData;');
  });
});

describe('assembleMapModule', () => {
  it('orders data, events, script, export', () => {
    const js = assembleMapModule(
      {type: 'map', actors: []},
      [
        {type: 'world_rule_event', code: 'export const E = 1;\n'},
        {type: 'world_on_map_loads', code: '(() => {\n})();\n'},
      ],
      [{id: 'a', blocks: [{type: 'x', code: 'actor.on();\n'}]}],
    );
    expect(js).toBe(
      'const mapData = {"type":"map","actors":[]};\n' +
        'export const E = 1;\n' +
        'mapData.script = (world, placed, map) => {\n' +
        '(() => {\n})();\n' +
        '{\n  const actor = placed["a"];\nactor.on();\n}\n' +
        '};\n' +
        'export default mapData;\n',
    );
  });
});

describe('the ⟨placement⟩', () => {
  const emit = (name: string): string => {
    const definition = DOMAIN_BLOCKS.find(b => b.type === 'world_placement')!;
    const [code] = definition.generator.javascript(
      {getFieldValue: () => name} as never,
      {} as never,
      {} as never,
    ) as [string, number];
    return code;
  };

  it('is the actor the load placed under that id', () => {
    setCurrentPlacements(['Door']);
    expect(emit('Door')).toBe('placed["Door"]');
  });

  it('is nobody when the map has nothing to name', () => {
    expect(emit(NONE_VALUE)).toBe('[]');
  });
});

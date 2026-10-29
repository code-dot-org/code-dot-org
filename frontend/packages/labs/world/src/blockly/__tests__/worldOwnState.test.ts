// A world's own state (specs/WORLD_STATE.md).
//
// The gap this closes is one sentence long and had been written at the end of
// three specs: nothing in a world could remember a number. What these pin is
// that closing it introduced NO NEW CONCEPT — the Main Screen's values compile
// by the same emitter, and mint the same get/set blocks a rule's world-scoped
// property mints.

import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
} from '../../engine';
import {buildDomainPalette} from '../domainBlocks';
import {
  parseActorOwnMeta,
  screenOwnMeta,
  worldOwnPropertyDeclarations,
} from '../ownProperties';
import type {ScreenEvent, ScreenProperty} from '../screenData';

/** The Main Screen of a game called Tapper, declaring what it is given. */
const screen = (
  properties: ScreenProperty[] = [],
  events: ScreenEvent[] = [],
  name = 'Tapper',
) => screenOwnMeta('worlds/main', {name, properties, events});

const COUNT: ScreenProperty = {name: 'score', type: 'number', value: '0'};

/** A boolean ⟨ready⟩ starting at ⟨…⟩, however the file spells it. */
const truth = (stored: string): ScreenProperty => ({
  name: 'ready',
  type: 'boolean',
  value: stored,
});

describe('a Main Screen’s own properties', () => {
  it('are read off its data, world-scoped', () => {
    // The scope is the whole of what differs from an actor's own. Everything
    // downstream follows from it: no subject socket, and `world.get(…)`.
    const meta = screen([COUNT]);

    expect(meta.name).toBe('Tapper');
    expect(meta.properties).toHaveLength(1);
    expect(meta.properties[0]).toMatchObject({
      id: 'score',
      name: 'score',
      type: 'number',
      default: 0,
      scope: 'world',
    });
  });

  it('read a boolean default the way the field that edits it does', () => {
    // A boolean's default is edited by a dropdown offering `true` and `false`;
    // a file saying `TRUE` once read as false on the next save
    // (`BooleanDefaultField`).
    for (const stored of ['true', 'TRUE', ' True ']) {
      expect(screen([truth(stored)]).properties[0]).toMatchObject({
        id: 'ready',
        default: true,
      });
    }
    for (const stored of ['false', 'FALSE', '', 'nonsense']) {
      expect(screen([truth(stored)]).properties[0]).toMatchObject({
        id: 'ready',
        default: false,
      });
    }
  });

  it('compile to `world.defineProperty`, the builder’s own', () => {
    // NO RULE IS INVENTED. The World seeds these slots directly, the way an
    // Actor seeds a kind's own from the overrides it is built with.
    expect(worldOwnPropertyDeclarations(screen([COUNT]))).toBe(
      'export const ScoreProperty = world.defineProperty("score", "number", 0, ' +
        '{"name":"score"});\n',
    );
  });

  it('mint a getter and a setter with no subject socket', () => {
    // A world's property has nobody to name, which is what makes `set score to`
    // read the way it does — the same shape a rule's world-scoped property has.
    const {blocks} = buildDomainPalette([], {
      fileKind: 'world',
      ownProperties: [screen([COUNT])],
    });
    const getter = blocks.find(
      block => block.type === 'world_get_WorldsMain_ScoreProperty',
    ) as {message0: string} | undefined;

    expect(getter?.message0).toBe('get score');
    expect(
      blocks.some(block => block.type === 'world_set_WorldsMain_ScoreProperty'),
    ).toBe(true);
  });
});

describe('a Main Screen’s own EVENTS', () => {
  // THE APP'S VOCABULARY: the words its maps raise. A map used to declare its
  // own and the world heard them, which meant a hundred level maps minted a
  // hundred different `complete` events — and a world that wanted to hear "a
  // level finished" needed a hundred handlers, because many maps raising ONE
  // signal was a sentence the language could not say
  // (specs/MAP_EVENTS_PLAN.md).
  const DONE: ScreenEvent = {name: 'level complete'};

  it('are read off its data, world-scoped', () => {
    // No subject, which is the whole of what differs from an actor's. An
    // event ABOUT something is an actor's, and that is untouched.
    const meta = screen([], [DONE]);

    expect(meta.events).toHaveLength(1);
    expect(meta.events[0]).toMatchObject({
      id: 'level_complete',
      scope: 'world',
    });
  });

  it('mint a hat and an emit, as an actor’s and a map’s do', () => {
    const types = buildDomainPalette([], {ownProperties: [screen([], [DONE])]})
      .blocks.map(block => block.type)
      .filter(type => type.includes('LevelComplete'));

    expect(types.sort()).toEqual([
      'world_emit_WorldsMain_LevelCompleteEvent',
      'world_on_WorldsMain_LevelCompleteEvent',
    ]);
  });

  it('compile to an identity AND a registration', () => {
    // The second line is the whole plan. The export is what a hat in this
    // module refers to; the registration puts the same identity in the
    // world's registry under the words a MAP raises it by, because a map
    // cannot import this module — the world loads the map, which is a cycle
    // (specs/MAP_EVENTS_PLAN.md).
    expect(worldOwnPropertyDeclarations(screen([], [DONE]))).toBe(
      'export const LevelCompleteEvent = {id: "level_complete", ' +
        'name: "level complete", ownerId: "worlds/main"};\n' +
        'world.defineEvent("level complete", LevelCompleteEvent);\n',
    );
  });

  it('are raised BY NAME from a map, and offered there', () => {
    // A map is not a reader of the world's vocabulary, it is one of the two
    // places that speaks it — so the `emit` beside the hat is offered in a
    // placement's workspace and the map's own, and generates a named raise
    // rather than an import that would be a cycle.
    const palette = buildDomainPalette([], {
      ownProperties: [screen([], [DONE])],
      ownMapModule: 'maps/level',
    });
    // Named for the world, as every own-declaration drawer is — while the
    // block TYPES are namespaced by the module, which is `worlds/main`.
    const drawer = (
      palette.toolbox as Array<{name?: string; blocks?: unknown[]}>
    ).find(one => one.name === 'Tapper');
    expect(
      (drawer?.blocks ?? []).map(one =>
        typeof one === 'string' ? one : (one as {type: string}).type,
      ),
    ).toContain('world_emit_WorldsMain_LevelCompleteEvent');

    const emit = palette.blocks.find(
      one => one.type === 'world_emit_WorldsMain_LevelCompleteEvent',
    ) as unknown as {
      generator: {javascript: (block: unknown, generator: unknown) => unknown};
    };
    expect(
      emit.generator.javascript(
        {
          getFieldValue: () => null,
          getParent: () => null,
          workspace: {getTopBlocks: () => []},
        },
        {
          valueToCode: () => '',
          statementToCode: () => '',
          __mapModule: 'maps/level',
        },
      ),
    ).toBe('world.emitNamed("level complete");\n');
  });
});

describe('another screen’s words', () => {
  // specs/SCREEN_STACK_PLAN.md, step 4: a screen's own drawer is offered in
  // its own file, and the Main Screen's everywhere.
  const SETTINGS = screenOwnMeta('screens/settings', {
    name: 'Settings',
    properties: [{name: 'volume', type: 'number', value: '5'}],
    events: [],
  });
  const MAIN = screenOwnMeta('screens/main', {
    name: 'Tapper',
    properties: [COUNT],
    events: [],
  });
  const drawers = (ownMapModule?: string) =>
    (
      buildDomainPalette([], {
        ownProperties: [MAIN, SETTINGS],
        ownMapModule,
      }).toolbox as Array<{name?: string}>
    ).map(one => one.name);

  it('are offered in that screen’s own file, beside the game’s', () => {
    expect(drawers('screens/settings')).toEqual(
      expect.arrayContaining(['Settings', 'Tapper']),
    );
  });

  it('are offered nowhere else, though their blocks are defined', () => {
    expect(drawers('maps/level')).not.toContain('Settings');
    expect(drawers()).not.toContain('Settings');
    expect(drawers('maps/level')).toContain('Tapper');
    const types = buildDomainPalette([], {
      ownProperties: [MAIN, SETTINGS],
    }).blocks.map(block => block.type);
    expect(types).toContain('world_get_ScreensSettings_VolumeProperty');
  });
});

describe('renaming', () => {
  /** The block types minted for a file's own property, whatever it is called. */
  const typesFor = (root: string, name: string, path: string) => {
    const meta =
      root === 'screen'
        ? screen([COUNT], [], name)
        : parseActorOwnMeta(
            path,
            JSON.stringify({
              blocks: {
                blocks: [
                  {
                    type: root,
                    fields: {NAME: name},
                    next: {
                      block: {
                        type: 'world_rule_property',
                        fields: {
                          TYPE: 'number',
                          ACCESS: 'writable',
                          NAME: 'score',
                          DEFAULT: '0',
                        },
                      },
                    },
                  },
                ],
              },
            }),
          )!;
    return buildDomainPalette([], {ownProperties: [meta]})
      .blocks.map(block => block.type)
      .filter(type => type.includes('Score'))
      .sort();
  };

  it('a world changes nothing about its own state’s blocks', () => {
    // The bug this closes. `memberKey` namespaced an own property by the
    // DECLARING NAME, so renaming ⟨Tapper⟩ to ⟨Coins⟩ re-minted every block as
    // `world_get_Coins_…`; the saved ones matched nothing, became stand-ins,
    // and told the learner their project no longer had a RULE called Tapper.
    expect(typesFor('screen', 'Coins', 'worlds/main')).toEqual(
      typesFor('screen', 'Tapper', 'worlds/main'),
    );
  });

  it('an actor changes nothing about its own state’s blocks either', () => {
    expect(typesFor('world_actor', 'Hero', 'actors/player')).toEqual(
      typesFor('world_actor', 'Player', 'actors/player'),
    );
  });

  it('is namespaced by the file, so two files’ same-named state differs', () => {
    // What the name was doing in the key, and the only thing it was doing:
    // keeping one project's two `score`s apart. The file does it and does not
    // change when a learner retitles something.
    expect(typesFor('world_actor', 'Player', 'actors/player')).not.toEqual(
      typesFor('world_actor', 'Player', 'actors/enemy'),
    );
    expect(typesFor('world_actor', 'Player', 'actors/player')).toEqual([
      'world_get_ActorsPlayer_ScoreProperty',
      'world_set_ActorsPlayer_ScoreProperty',
    ]);
  });
});

describe('a world that carries its own state', () => {
  const built = () => {
    const builder = new WorldBuilder({id: 'w', name: 'Tapper'});
    const score = builder.defineProperty('score', 'number', 0, {name: 'score'});
    return {builder, score, world: builder.getWorld()};
  };

  it('has a slot for it, seeded from the default', () => {
    const {world, score} = built();

    expect(world.get(score)).toBe(0);
    world.set(score, 7);
    expect(world.get(score)).toBe(7);
  });

  it('invents no rule to hold it', () => {
    // The failure this avoids is visible to a learner: a synthesized rule would
    // appear in the rules panel and in the count on their world block.
    const before = new WorldBuilder({id: 'w', name: 'W'})
      .getWorld()
      .activeRules().length;
    const {world} = built();

    expect(world.activeRules()).toHaveLength(before);
  });

  it('puts it in the snapshot, so an edit patches instead of restarting', () => {
    // What choosing a property over a module-level `let` bought. A `let` is
    // invisible to the snapshot, so every edit to the world would restart the
    // game and reset the score.
    const {world, score} = built();
    world.set(score, 12);

    expect(world.snapshot().world['w.score']).toBe(12);
    expect(world.setWorldProperty('w.score', 3)).toBe(true);
    expect(world.get(score)).toBe(3);
  });

  it('is the world’s, not an actor’s', () => {
    // A world property is reached without naming a subject; an actor placed in
    // the world has no slot for it and never asks.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const score = builder.defineProperty('score', 'number', 0);
    const actor = builder.addActor(
      new ActorBuilder({id: 'a', name: 'A'}).set(
        PositionProperty,
        new Vector(0, 0),
      ),
    );

    expect(actor.hasProperty(score)).toBe(false);
    expect(builder.getWorld().get(score)).toBe(0);
  });
});

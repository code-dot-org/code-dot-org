// A world's own state (specs/WORLD_STATE.md).
//
// The gap this closes is one sentence long and had been written at the end of
// three specs: nothing in a world could remember a number. What these pin is
// that closing it introduced NO NEW CONCEPT — the same `define property` block
// in a fourth home, parsed by the same walk, compiled by the same emitter, and
// minting the same get/set blocks a rule's world-scoped property mints.

import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
} from '../../engine';
import {buildDomainPalette} from '../domainBlocks';
import {ROOT_HOMES} from '../fileKind';
import {
  parseActorOwnMeta,
  parseWorldOwnMeta,
  worldOwnPropertyDeclarations,
} from '../ownProperties';

/** A `.world` file declaring `count`, and whatever else is chained under it. */
const worldFile = (rows: object[] = []) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Tapper'},
          next: {
            block: rows.reduceRight<object | undefined>(
              (next, block) => ({
                ...block,
                ...(next ? {next: {block: next}} : {}),
              }),
              undefined,
            ),
          },
        },
      ],
    },
  });

const COUNT = {
  type: 'world_rule_property',
  fields: {TYPE: 'number', ACCESS: 'writable', NAME: 'score', DEFAULT: '0'},
};

/** `define boolean ⟨ready⟩ with default ⟨…⟩`, however the file spells it. */
const truth = (stored: string) => ({
  type: 'world_rule_property',
  fields: {
    TYPE: 'boolean',
    ACCESS: 'writable',
    NAME: 'ready',
    DEFAULT: stored,
  },
});

/** The `define world` block, out of the palette, with its generator. */
const worldBlock = () =>
  buildDomainPalette([]).blocks.find(
    block => block.type === 'world_world',
  ) as unknown as {
    generator: {
      javascript: (block: unknown, generator: unknown, env: unknown) => unknown;
    };
  };

describe('a `.world` file’s own properties', () => {
  it('are read off the `define world` chain, world-scoped', () => {
    // The scope is the whole of what differs from an actor's own. Everything
    // downstream follows from it: no subject socket, and `world.get(…)`.
    const meta = parseWorldOwnMeta('worlds/main', worldFile([COUNT]))!;

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

  it('read a boolean default the way the FIELD that edits it does', () => {
    // THE ONE STRING THE EDITOR AND THE RUNTIME DISAGREED ABOUT. A boolean's
    // default is edited by a dropdown offering `true` and `false`, and Blockly
    // checks a stored value against a dropdown's options before any validator
    // runs — so a file saying `TRUE` was refused with "Cannot set the
    // dropdown's value to an unavailable option", the field kept what it had,
    // and the next save wrote that down instead. Notes' `saved` defaults true
    // and would have been quietly written as false (`BooleanDefaultField`).
    //
    // The parse was never strict, which is why it only ever showed up as
    // console noise. This pins the reading both ends now share.
    for (const stored of ['true', 'TRUE', ' True ']) {
      expect(
        parseWorldOwnMeta('worlds/main', worldFile([truth(stored)]))!
          .properties[0],
      ).toMatchObject({id: 'ready', default: true});
    }
    for (const stored of ['false', 'FALSE', '', 'nonsense']) {
      expect(
        parseWorldOwnMeta('worlds/main', worldFile([truth(stored)]))!
          .properties[0],
      ).toMatchObject({id: 'ready', default: false});
    }
  });

  it('are nobody else’s: an actor parse finds none in a world', () => {
    // Two roots, two parses. A file is one or the other, and reading a world
    // as an actor has to come back empty rather than half-right.
    expect(
      parseActorOwnMeta('worlds/main', worldFile([COUNT])),
    ).toBeUndefined();
  });

  it('compile to `world.defineProperty`, the builder’s own', () => {
    // NO RULE IS INVENTED. The World seeds these slots directly, the way an
    // Actor seeds a kind's own from the overrides it is built with.
    const meta = parseWorldOwnMeta('worlds/main', worldFile([COUNT]))!;

    expect(worldOwnPropertyDeclarations(meta)).toBe(
      'export const ScoreProperty = world.defineProperty("score", "number", 0, ' +
        '{"name":"score"});\n',
    );
  });

  it('are emitted by the world block, before the body that reads them', () => {
    // NOT by the module assembler, which was the first attempt and was wrong:
    // a world's body is part of the world block's own code, so declarations
    // appended after that block landed after `add actor … set text to ⟨score⟩`
    // and compiled to a use before the declaration. esbuild rewrites the const,
    // so it threw as "Cannot read properties of undefined" rather than as the
    // temporal-dead-zone error it was.
    const world = worldBlock();
    const code = String(
      world.generator.javascript(
        {
          getFieldValue: (name: string) => (name === 'NAME' ? 'Tapper' : null),
          getNextBlock: () => null,
          getInputTargetBlock: () => null,
          workspace: {},
        },
        {
          statementToCode: () => 'world.addActor(A);\n',
          blockToCode: () => 'world.addActor(A);\n',
          valueToCode: () => '',
          definitions_: {},
          __worldOwn: 'const ScoreProperty = world.defineProperty("score");\n',
        },
        {},
      ),
    );

    expect(code.indexOf('const world')).toBeLessThan(
      code.indexOf('ScoreProperty'),
    );
    expect(code.indexOf('ScoreProperty')).toBeLessThan(
      code.indexOf('world.addActor'),
    );
  });

  it('mint a getter and a setter with no subject socket', () => {
    // A world's property has nobody to name, which is what makes `set score to`
    // read the way it does — the same shape a rule's world-scoped property has.
    const meta = parseWorldOwnMeta('worlds/main', worldFile([COUNT]))!;
    const {blocks} = buildDomainPalette([], {
      fileKind: 'world',
      ownProperties: [meta],
    });
    const getter = blocks.find(
      block => block.type === 'world_get_WorldsMain_ScoreProperty',
    ) as {message0: string} | undefined;

    expect(getter?.message0).toBe('get score');
    expect(
      blocks.some(block => block.type === 'world_set_WorldsMain_ScoreProperty'),
    ).toBe(true);
  });

  it('is not offered a setter when it is read-only', () => {
    // Where an `.actor`'s read-only property IS offered one, inside the file
    // that declared it (`domainBlocks`, the actors' drawers). The difference
    // is that an `.actor` has bodies to run a `set` in — `each frame`, a
    // `define block`, a handler for its own event — and a `.world` file's
    // declaring scope is a declaration with none. So read-only here is a
    // per-world constant.
    //
    // The block is DEFINED, and only unlisted. Every own property's pair is
    // minted whatever the palette shows, because the headless generator
    // compiles every file with one palette and a type it did not mint is a
    // file that will not compile.
    const meta = parseWorldOwnMeta(
      'worlds/main',
      worldFile([{...COUNT, fields: {...COUNT.fields, ACCESS: 'readonly'}}]),
    )!;
    const {blocks} = buildDomainPalette([], {
      fileKind: 'world',
      ownProperties: [meta],
    });

    expect(
      blocks.some(block => block.type === 'world_get_WorldsMain_ScoreProperty'),
    ).toBe(true);
    const {toolbox} = buildDomainPalette([], {
      fileKind: 'world',
      ownProperties: [meta],
    });
    const offered = (toolbox as Array<{blocks?: string[]}>).flatMap(
      category => category.blocks ?? [],
    );

    expect(offered).toContain('world_get_WorldsMain_ScoreProperty');
    expect(offered).not.toContain('world_set_WorldsMain_ScoreProperty');
  });
});

describe('a `.world` file’s own EVENTS', () => {
  // THE APP'S VOCABULARY: the words its maps raise. A map used to declare its
  // own and the world heard them, which meant a hundred level maps minted a
  // hundred different `complete` events — and a world that wanted to hear "a
  // level finished" needed a hundred handlers, because many maps raising ONE
  // signal was a sentence the language could not say
  // (specs/MAP_EVENTS_PLAN.md).
  const DONE = {
    type: 'world_rule_event',
    extraState: {parts: [{kind: 'label', text: 'level complete'}]},
  };

  it('are read off the `define world` chain, world-scoped', () => {
    // No subject, which is the whole of what differs from an actor's. An
    // event ABOUT something is an actor's, and that is untouched.
    const meta = parseWorldOwnMeta('worlds/main', worldFile([DONE]))!;

    expect(meta.events).toHaveLength(1);
    expect(meta.events[0]).toMatchObject({
      id: 'level_complete',
      scope: 'world',
    });
  });

  it('mint a hat and an emit, as an actor’s and a map’s do', () => {
    const meta = parseWorldOwnMeta('worlds/main', worldFile([DONE]))!;
    const types = buildDomainPalette([], {ownProperties: [meta]})
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
    const meta = parseWorldOwnMeta('worlds/main', worldFile([DONE]))!;

    expect(worldOwnPropertyDeclarations(meta)).toBe(
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
    const meta = parseWorldOwnMeta('worlds/main', worldFile([DONE]))!;
    const palette = buildDomainPalette([], {
      ownProperties: [meta],
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

  it('were refused by a rule that outlived its reason', () => {
    // `fileKind` banned `define event` from a `.world` because "a world's own
    // `define actor` generates into a block scope" — and a world has not been
    // able to hold a `define actor` since every actor became a file, which
    // the same file enforces by throwing. The block scope that reason turns
    // on cannot be created, so the ban was a leftover rather than a policy.
    expect(ROOT_HOMES.get('world_rule_event')?.has('world')).toBe(true);
    expect(ROOT_HOMES.get('world_actor')?.has('world')).toBe(false);
    // …and the same dead reason read the other way: `acts like` was offered
    // in a `.world` so it could be a row under that definition.
    expect(ROOT_HOMES.get('world_acts_like')?.has('world')).toBe(false);
  });
});

describe('renaming', () => {
  /** The block types minted for a file's own property, whatever it is called. */
  const typesFor = (root: string, name: string, path: string) => {
    const contents = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: root,
            fields: {NAME: name},
            next: {block: COUNT},
          },
        ],
      },
    });
    const meta =
      root === 'world_world'
        ? parseWorldOwnMeta(path, contents)!
        : parseActorOwnMeta(path, contents)!;
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
    expect(typesFor('world_world', 'Coins', 'worlds/main')).toEqual(
      typesFor('world_world', 'Tapper', 'worlds/main'),
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

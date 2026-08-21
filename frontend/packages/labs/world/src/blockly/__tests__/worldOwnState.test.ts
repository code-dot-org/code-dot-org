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

  it('gets no setter at all when it is read-only', () => {
    // As in an `.actor` file, and for the same reason: a world's declaring
    // scope is a DECLARATION with no body to run a `set` in, so read-only means
    // a per-world constant rather than a setter confined to one place.
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
    expect(
      blocks.some(block => block.type === 'world_set_WorldsMain_ScoreProperty'),
    ).toBe(false);
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

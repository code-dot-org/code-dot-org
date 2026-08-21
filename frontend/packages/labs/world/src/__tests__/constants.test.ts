// The starter project's shape, and the one rule its ids have to keep.
//
// Codebridge allocates the next id by taking the highest integer id already in
// the project and adding one. A starter shipping an id that is not an integer
// used to poison that sum for the whole session, and two files written in a row
// then landed on the same key — the second silently replacing the first. The
// helpers no longer choke on it, but the starter is where world's ids come from,
// so this is where the contract is kept.

import {describe, expect, it} from 'vitest';

import {getNextFileId, getNextFolderId} from '@code-dot-org/codebridge';

import {healthBarActor} from '../actors/stock/healthBar';
import {DEFAULT_PROJECT, starterFile} from '../constants';

const source = DEFAULT_PROJECT.source;
const files = Object.values(source.files);
const folders = Object.values(source.folders);

/** A stringified non-negative integer, which is what an id is. */
const isId = (id: string) => /^\d+$/.test(id);

describe('the starter project', () => {
  it('numbers every file and folder', () => {
    expect(files.length).toBeGreaterThan(0);
    expect(files.map(file => file.id).filter(id => !isId(id))).toEqual([]);
    expect(folders.map(folder => folder.id).filter(id => !isId(id))).toEqual(
      [],
    );
  });

  it('keys each file and folder by its own id', () => {
    for (const [key, file] of Object.entries(source.files)) {
      expect(file.id).toBe(key);
    }
    for (const [key, folder] of Object.entries(source.folders)) {
      expect(folder.id).toBe(key);
    }
  });

  it('leaves the id helpers able to allocate', () => {
    // The bug this file exists for: both of these were the string "NaN".
    expect(isId(getNextFileId(files))).toBe(true);
    expect(isId(getNextFolderId(folders))).toBe(true);
    expect(source.files[getNextFileId(files)]).toBeUndefined();
    expect(source.folders[getNextFolderId(folders)]).toBeUndefined();
  });

  it('puts every file in a folder the project has', () => {
    for (const file of files) {
      expect(source.folders[file.folderId]).toBeDefined();
    }
  });

  it('opens files it holds, and activates one of them', () => {
    for (const id of source.openFiles ?? []) {
      expect(source.files[id]).toBeDefined();
    }
    const active = files.filter(file => file.active);
    expect(active).toHaveLength(1);
    expect(source.openFiles).toContain(active[0].id);
    expect(active[0].name).toBe('main.world');
  });

  it('says every actor in blocks, so every actor can be opened', () => {
    // The starter is read before it is understood, and a `.js` actor is a file
    // a learner cannot edit with the only editor they have been shown. The
    // project can still hold a JS module — the compiler treats every module
    // alike — but nothing in the starter is one, least of all an ACTOR.
    const actorFolder = folders.find(folder => folder.name === 'actors')!.id;
    const actors = files.filter(file => file.folderId === actorFolder);

    expect(actors.length).toBeGreaterThan(0);
    for (const actor of actors) {
      expect(actor.name).toMatch(/\.actor$/);
      expect(actor.language).toBe('actor');
      // …and each is a workspace with a `define actor` in it, rather than an
      // empty file that merely has the right extension.
      expect(actor.contents).toContain('world_actor');
    }
  });

  it('grounds the tile on both of the rules it needs', () => {
    // Landable and a wall. Either one alone is a bug that reads as physics
    // being broken: no "Acts as Ground" and the player falls through the floor
    // forever, no "Solid" and it is held up by nothing.
    const ground = starterFile('ground').contents;
    expect(ground).toContain('Gravity#ActsAsGroundTrait');
    expect(ground).toContain('Solid Bodies#SolidTrait');
  });

  it('wires collecting across all four of the places it takes', () => {
    // Collecting is the starter's only mechanic that no single file states.
    // Four things have to agree, and three of the four failures are SILENT —
    // the game runs and coins simply do not disappear, with nothing in the
    // console to say why. So they are checked together.
    //
    // The first of the four used to be a `use rule Collects Things` row in the
    // world. It is the FILE now: holding it is what puts it in play
    // (blockly/projectModules), so the rule being here is the whole of the
    // world's half.
    expect(starterFile('collectRule').name).toBe('collect.rule');
    expect(starterFile('coin').contents).toContain(
      'Collection#CanBeCollectedTrait',
    );
    expect(starterFile('player').contents).toContain(
      'Collection#CollectsTrait',
    );
  });

  it('ships the stock health bar, pointed at the player by the map', () => {
    // The bar used to be one the starter kept for itself, asking the world for
    // the first actor with health — which works for exactly one game: the one
    // with a single hurtable thing in it. This is the file a learner gets by
    // importing, so the starter is a worked example of the shelf rather than a
    // thing beside it.
    //
    // WHO IT IS ABOUT IS IN THE MAP and in no blocks at all: a placement holds
    // the id of another placement, and `loadMap` resolves it once every entry
    // exists (specs/MAPS.md).
    expect(starterFile('healthBar').contents).toBe(healthBarActor);

    const map = JSON.parse(starterFile('level1').contents) as {
      actors: Array<{
        id?: string;
        properties?: Record<string, Record<string, unknown>>;
      }>;
    };
    const bar = map.actors.find(actor => actor.id === 'HealthBar');
    const named = bar?.properties?.Health_Bar?.subject;

    // …and the placement it names is really there, since a reference to
    // nothing is left unset and would draw an empty bar for ever.
    expect(named).toBe('Player');
    expect(map.actors.some(actor => actor.id === named)).toBe(true);
  });

  it('gives the player a jump, in one block instead of four', () => {
    // Three things have to agree, and two of the three failures are silent:
    // the rule has to be in the project at all, the player has to elect the
    // trait, and the space bar has to reach `make ⟨who⟩ jump`. Miss the trait
    // and the action simply does nothing; miss the rule and the block is not
    // in the palette to place.
    expect(starterFile('jumpRule').name).toBe('jump.rule');

    const player = starterFile('player').contents;
    expect(player).toContain('Jumping#JumpsTrait');
    expect(player).toContain('world_do_Jumping_MakeJumpAction');

    // …and the hand-rolled version it replaced is GONE, which is the point of
    // the change rather than a tidy. It was
    //
    //     if ⟨this actor⟩ is on the ground?
    //       apply force ⟨0, -5⟩ on ⟨this actor⟩
    //
    // — a jump that refuses a press one frame late and pushes rather than
    // sets. Leaving it beside the new block would give the space bar two
    // handlers and a doubled jump.
    expect(player).not.toContain('world_do_Physics_ApplyForceAction');
    expect(player).not.toContain('world_query_Gravity_IsOnTheGroundQuery');
  });

  it('gives the count something to count', () => {
    // The player prints how many coins it has taken. With one coin in the map
    // that number is only ever 1, which makes `how many ⟨Coin⟩ in ⟨collected⟩`
    // look like decoration rather than a question — so the map ships three.
    const map = JSON.parse(starterFile('level1').contents) as {
      actors: Array<{type: string}>;
    };
    const coins = map.actors.filter(actor => actor.type === 'actors/coin');
    expect(coins.length).toBeGreaterThan(1);

    // And what it counts is the kind, by the module path a placed actor
    // carries — the same string the map places them under.
    expect(starterFile('player').contents).toContain('"TYPE": "actors/coin"');
  });
});

describe('starterFile', () => {
  it('finds a file by the name it is written under', () => {
    expect(starterFile('main').name).toBe('main.world');
    expect(starterFile('gravityRule').name).toBe('gravity.rule');
    expect(starterFile('sprite-coin').name).toBe('coin.png');
  });

  it('throws on a name the starter does not have', () => {
    // A typo in a test should say so, not read as an empty file.
    expect(() => starterFile('nope')).toThrow(/no starter file/);
  });
});

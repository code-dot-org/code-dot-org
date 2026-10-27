// A property of an actor's own, renamed or deleted (specs/ACTOR_EDITOR_PLAN.md,
// step 6).

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {compileProject} from '../../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {
  deleteProperty,
  deletePropertyInProject,
  propertyUses,
  renameProblem,
  renameProperty,
} from '../selfProperties';

const file = (id: string, name: string, contents: unknown): ProjectFile => ({
  id,
  name,
  folderId: 'actors',
  language: 'actor',
  contents: JSON.stringify(contents),
});

/** A Player with lives, set to 3, and a Coin whose code takes one away. */
const project = (): MultiFileSource => ({
  folders: {actors: {id: 'actors', name: 'actors', parentId: '0', open: true}},
  files: {
    p: file('p', 'player.actor', {
      type: 'actor',
      name: 'Player',
      properties: [{name: 'lives', type: 'number', access: 'writable'}],
      values: [
        {
          setter: 'world_set_ActorsPlayer_LivesProperty',
          type: 'number',
          value: 3,
        },
      ],
      blocks: {
        blocks: {
          languageVersion: 0,
          blocks: [{type: 'world_get_ActorsPlayer_LivesProperty', x: 0, y: 0}],
        },
      },
    }),
    c: file('c', 'coin.actor', {
      blocks: {
        blocks: [
          {type: 'world_actor', fields: {NAME: 'Coin'}},
          {type: 'world_set_ActorsPlayer_LivesProperty'},
        ],
      },
    }),
    o: file('o', 'other.actor', {
      blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Other'}}]},
    }),
  },
  openFiles: [],
});

describe('a property of its own', () => {
  it('says where its blocks are, leaving out the value it starts at', () => {
    expect(propertyUses(project(), 'actors/player', 'lives')).toEqual([
      'p',
      'c',
    ]);
  });

  it('renames every block that reads or sets it, in every file', () => {
    const next = renameProperty(
      project(),
      'p',
      'actors/player',
      'lives',
      'hearts',
    );
    const player = JSON.parse(next.files.p.contents);
    expect(player.properties[0].name).toBe('hearts');
    expect(player.values[0].setter).toBe(
      'world_set_ActorsPlayer_HeartsProperty',
    );
    expect(player.blocks.blocks.blocks[0].type).toBe(
      'world_get_ActorsPlayer_HeartsProperty',
    );
    expect(next.files.c.contents).toContain(
      'world_set_ActorsPlayer_HeartsProperty',
    );
    // A file that never named it is left as it was.
    expect(next.files.o.contents).toBe(project().files.o.contents);
  });

  it('moves what a placement set it to, in every map and screen', () => {
    // A placement keeps the value under the kind that declared it and the
    // property's id, which is its name — so a rename that left it there would
    // quietly put every placed Player back to its starting lives.
    const placed = (properties: object) => ({
      type: 'map',
      actors: [{type: 'actors/player', id: 'P', properties}],
    });
    const source = project();
    source.files.m = {
      ...file('m', 'level.map', placed({Player: {lives: 5}, positional: {}})),
      folderId: 'maps',
    };
    source.files.s = {
      ...file('s', 'main.screen', placed({Other: {lives: 1}})),
      folderId: 'screens',
    };
    const next = renameProperty(
      source,
      'p',
      'actors/player',
      'lives',
      'hearts',
    );

    expect(JSON.parse(next.files.m.contents).actors[0].properties).toEqual({
      Player: {hearts: 5},
      positional: {},
    });
    // Another kind's property of the same name is its own.
    expect(next.files.s.contents).toBe(source.files.s.contents);
  });

  it('forgets what a placement set it to when it is deleted', () => {
    const source = project();
    source.files.m = {
      ...file('m', 'level.map', {
        type: 'map',
        actors: [
          {
            type: 'actors/player',
            id: 'P',
            properties: {Player: {lives: 5}, positional: {}},
          },
        ],
      }),
      folderId: 'maps',
    };
    const next = deletePropertyInProject(source, 'p', 'actors/player', 'lives');

    expect(JSON.parse(next.files.p.contents).properties).toBeUndefined();
    expect(JSON.parse(next.files.m.contents).actors[0].properties).toEqual({
      positional: {},
    });
  });

  it('refuses a name it has, or none', () => {
    const data = JSON.parse(project().files.p.contents);
    expect(renameProblem(data, 'lives', ' ')).toMatch(/needs a name/);
    expect(
      renameProblem(
        {...data, properties: [...data.properties, {name: 'hearts'}]},
        'lives',
        'hearts',
      ),
    ).toMatch(/already has/);
    const source = project();
    expect(renameProperty(source, 'p', 'actors/player', 'lives', '')).toBe(
      source,
    );
  });

  it('is deleted with the value it starts at', () => {
    const data = JSON.parse(project().files.p.contents);
    const gone = deleteProperty(data, 'actors/player', 'lives');
    expect(gone.properties).toBeUndefined();
    expect(gone.values).toBeUndefined();
  });
});

describe('a placed actor’s own property, renamed', () => {
  it('keeps the value its placement gave it, in the game', async () => {
    // The key a placement's value is kept under is a guess until a game
    // reads it: by the declaring kind's name and the property's id.
    const source = structuredClone(WORLD_SCENARIOS.empty.source);
    source.files.p = {
      ...file('p', 'player.actor', {
        type: 'actor',
        name: 'Player',
        properties: [{name: 'lives', type: 'number', access: 'writable'}],
      }),
      folderId: Object.values(source.folders).find(
        folder => folder.name === 'actors',
      )!.id,
    };
    const mapId = fileIdAt(source, 'maps/main.map')!;
    const map = JSON.parse(source.files[mapId].contents);
    map.actors = [
      {type: 'actors/player', id: 'P', properties: {Player: {lives: 5}}},
    ];
    source.files[mapId] = {
      ...source.files[mapId],
      contents: JSON.stringify(map),
    };
    const renamed = renameProperty(
      source,
      'p',
      'actors/player',
      'lives',
      'hearts',
    );

    const {world, modules} = await compileProject(projectFiles(renamed));
    const {HeartsProperty} = modules['actors/player'] as unknown as {
      HeartsProperty: never;
    };
    const player = [...world.actors].find(actor => actor.id === 'P')!;
    expect(player.get(HeartsProperty)).toBe(5);
  }, 60000);
});

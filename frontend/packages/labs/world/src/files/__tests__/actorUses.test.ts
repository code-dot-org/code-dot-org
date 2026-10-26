// Where an actor is used, for the palette's Delete (specs/SHELL_PLAN.md,
// step 2).

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {actorUses, withoutPlacementsOf} from '../actorUses';

const file = (
  id: string,
  name: string,
  folderId: string,
  contents: unknown,
): ProjectFile => ({
  id,
  name,
  folderId,
  language: name.split('.').pop()!,
  contents: JSON.stringify(contents),
});

const project = (): MultiFileSource => ({
  folders: {
    actors: {id: 'actors', name: 'actors', parentId: '0', open: true},
    maps: {id: 'maps', name: 'maps', parentId: '0', open: true},
    screens: {id: 'screens', name: 'screens', parentId: '0', open: true},
  },
  files: {
    player: file('player', 'player.actor', 'actors', {
      blocks: {blocks: [{type: 'world_get_ActorsPlayer_IdProperty'}]},
    }),
    chaser: file('chaser', 'chaser.actor', 'actors', {
      blocks: {
        blocks: [{type: 'world_near', fields: {KIND: 'actors/player'}}],
      },
    }),
    note: file('note', 'note.actor', 'actors', {
      // Prose that says the path is not a reference.
      blocks: {blocks: [{type: 'text', fields: {TEXT: 'actors/player'}}]},
    }),
    level: file('level', 'level.map', 'maps', {
      type: 'map',
      actors: [
        {id: 'Player', type: 'actors/player'},
        {
          id: 'Coin',
          type: 'actors/coin',
          blocks: {
            blocks: {
              blocks: [{type: 'world_get_ActorsPlayer_IdProperty'}],
            },
          },
        },
      ],
    }),
    main: file('main', 'main.screen', 'screens', {
      type: 'map',
      actors: [{id: 'game', type: 'actors/viewport'}],
    }),
  },
  openFiles: [],
});

describe('where an actor is used', () => {
  it('is the maps that place it, and the other code that names it', () => {
    expect(actorUses(project(), 'actors/player')).toEqual({
      placedIn: ['level'],
      // Not its own file, and not the prose.
      namedIn: ['chaser', 'level'],
    });
  });

  it('is a screen too', () => {
    expect(actorUses(project(), 'actors/viewport')).toEqual({
      placedIn: ['main'],
      namedIn: [],
    });
  });
});

describe('an actor taken off the maps', () => {
  it('leaves every other placement where it was', () => {
    const next = withoutPlacementsOf(project(), 'actors/player');
    const level = JSON.parse(next.files.level.contents) as {
      actors: Array<{id: string}>;
    };
    expect(level.actors.map(actor => actor.id)).toEqual(['Coin']);
    expect(next.files.main.contents).toBe(project().files.main.contents);
  });

  it('is the same project when it was placed nowhere', () => {
    const source = project();
    expect(withoutPlacementsOf(source, 'actors/chaser')).toBe(source);
  });
});

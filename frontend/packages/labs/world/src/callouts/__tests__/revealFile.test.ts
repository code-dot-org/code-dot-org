// Which file a `file` reveal means (specs/SHOW_ME_PLAN.md): a lesson names
// the actor, and the project answers with the file that declares one.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {actorDocument} from '../../actors/actorDocument';
import {fileToReveal} from '../revealFile';

const actor = (name: string) => actorDocument({name});

const SOURCE: MultiFileSource = {
  folders: {
    '1': {id: '1', name: 'actors', parentId: '0'},
    '2': {id: '2', name: 'worlds', parentId: '0'},
  },
  files: {
    // The file's stem and the name it declares differ, which is the whole
    // reason a lesson names the actor rather than the file.
    a: {
      id: 'a',
      name: 'walker.actor',
      language: 'actor',
      contents: actor('Hero'),
      folderId: '1',
    },
    b: {
      id: 'b',
      name: 'ground.actor',
      language: 'actor',
      contents: actor('Ground'),
      folderId: '1',
    },
    c: {
      id: 'c',
      name: 'main.world',
      language: 'world',
      contents: JSON.stringify({blocks: {blocks: []}}),
      folderId: '2',
    },
  },
  openFiles: [],
};

describe('fileToReveal', () => {
  it('finds an actor by the name its file declares, whatever the case', () => {
    expect(fileToReveal(SOURCE, {actor: 'Hero'})).toBe('a');
    expect(fileToReveal(SOURCE, {actor: 'ground'})).toBe('b');
  });

  it('finds the level and the Main Screen of a game', () => {
    const game: MultiFileSource = {
      ...SOURCE,
      folders: {
        ...SOURCE.folders,
        '3': {id: '3', name: 'screens', parentId: '0'},
        '4': {id: '4', name: 'maps', parentId: '0'},
      },
      files: {
        ...SOURCE.files,
        d: {
          id: 'd',
          name: 'main.screen',
          language: 'screen',
          contents: '{}',
          folderId: '3',
        },
        e: {
          id: 'e',
          name: 'main.map',
          language: 'map',
          contents: '{}',
          folderId: '4',
        },
      },
    };
    expect(fileToReveal(game, {level: true})).toBe('e');
    expect(fileToReveal(game, {screen: true})).toBe('d');
  });

  it('takes the Main Screen for the level when it is the level', () => {
    // adventure/rooms: a window onto a room, with no map of its own.
    const rooms: MultiFileSource = {
      ...SOURCE,
      folders: {
        ...SOURCE.folders,
        '3': {id: '3', name: 'screens', parentId: '0'},
      },
      files: {
        ...SOURCE.files,
        d: {
          id: 'd',
          name: 'main.screen',
          language: 'screen',
          contents: '{}',
          folderId: '3',
        },
      },
    };
    expect(fileToReveal(rooms, {level: true})).toBe('d');
  });

  it('answers nothing for a name the project has not got', () => {
    expect(fileToReveal(SOURCE, {actor: 'Dragon'})).toBeUndefined();
    expect(fileToReveal(SOURCE, {})).toBeUndefined();
  });
});

// Which file a `file` reveal means (specs/SHOW_ME_PLAN.md): a lesson names
// the actor, and the project answers with the file that declares one.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileToReveal} from '../revealFile';

const actor = (name: string) =>
  JSON.stringify({
    blocks: {blocks: [{type: 'world_actor', fields: {NAME: name}}]},
  });

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

  it('finds the world', () => {
    expect(fileToReveal(SOURCE, {world: true})).toBe('c');
  });

  it('answers nothing for a name the project has not got', () => {
    expect(fileToReveal(SOURCE, {actor: 'Dragon'})).toBeUndefined();
    expect(fileToReveal(SOURCE, {})).toBeUndefined();
  });
});

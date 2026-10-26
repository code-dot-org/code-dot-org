// What counts as a change to the project, and what does not.
//
// The whole point is the second half: selecting a file writes to the sources
// (`active`, `open` live on the files), and treating that as an edit cost a
// full regenerate + compile + preview reload for identical output.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {DEFAULT_PROJECT, starterFile} from '../../constants';
import {projectSignature} from '../projectSignature';

const source = DEFAULT_PROJECT.source;

// The starter's ids are numbers, so its files and folders are named here and
// looked up — see `numbered` in constants.
const MAIN = starterFile('main').id;
const PLAYER = starterFile('player').id;

/** A starter folder's id, by name. */
const folder = (name: string): string => {
  const found = Object.values(source.folders).find(f => f.name === name);
  if (!found) {
    throw new Error(`no starter folder called “${name}”`);
  }
  return found.id;
};

/** The same project with one file's fields changed. */
const withFile = (
  key: string,
  change: Partial<MultiFileSource['files'][string]>,
): MultiFileSource => {
  const id = starterFile(key).id;
  return {
    ...source,
    files: {...source.files, [id]: {...source.files[id], ...change}},
  };
};

describe('projectSignature', () => {
  it('is the same when only the selection moves', () => {
    const before = projectSignature(source);

    expect(projectSignature(withFile('main', {active: false}))).toBe(before);
    expect(projectSignature(withFile('main', {open: false}))).toBe(before);
    expect(projectSignature({...source, openFiles: [PLAYER, MAIN]})).toBe(
      before,
    );
  });

  it('changes when a file’s contents change', () => {
    expect(projectSignature(withFile('main', {contents: '{}'}))).not.toBe(
      projectSignature(source),
    );
  });

  it('changes when a file is added, removed, or renamed', () => {
    const {[MAIN]: main, ...rest} = source.files;
    expect(main).toBeDefined();
    expect(projectSignature({...source, files: rest})).not.toBe(
      projectSignature(source),
    );
    expect(projectSignature(withFile('main', {name: 'other.world'}))).not.toBe(
      projectSignature(source),
    );
  });

  it('changes when a file moves to another folder', () => {
    // Its module path changes, and paths are what imports resolve against.
    expect(
      projectSignature(withFile('main', {folderId: folder('rules')})),
    ).not.toBe(projectSignature(source));
  });

  it('notices an image, which carries no contents at all', () => {
    // An image is bytes on a `url`; adding or repainting one is a change the
    // preview needs, and `projectFiles` cannot see it.
    const added: MultiFileSource = {
      ...source,
      files: {
        ...source.files,
        '900': {
          id: '900',
          name: 'hero.png',
          language: 'png',
          contents: '',
          folderId: folder('sprites'),
          url: 'data:image/png;base64,AAA',
        },
      },
    };
    const repainted = {
      ...added,
      files: {
        ...added.files,
        '900': {...added.files['900'], url: 'data:image/png;base64,BBB'},
      },
    };

    expect(projectSignature(added)).not.toBe(projectSignature(source));
    expect(projectSignature(repainted)).not.toBe(projectSignature(added));
  });

  it('does not depend on the order files are listed in', () => {
    const reversed: MultiFileSource = {
      ...source,
      files: Object.fromEntries(Object.entries(source.files).reverse()),
    };

    expect(projectSignature(reversed)).toBe(projectSignature(source));
  });

  it('is empty for no project', () => {
    expect(projectSignature(undefined)).toBe('');
  });
});

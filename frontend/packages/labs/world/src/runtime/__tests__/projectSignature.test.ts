// What counts as a change to the project, and what does not.
//
// The whole point is the second half: selecting a file writes to the sources
// (`active`, `open` live on the files), and treating that as an edit cost a
// full regenerate + compile + preview reload for identical output.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {DEFAULT_PROJECT} from '../../constants';
import {projectSignature} from '../projectSignature';

const source = DEFAULT_PROJECT.source;

/** The same project with one file's fields changed. */
const withFile = (
  id: string,
  change: Partial<MultiFileSource['files'][string]>,
): MultiFileSource => ({
  ...source,
  files: {...source.files, [id]: {...source.files[id], ...change}},
});

describe('projectSignature', () => {
  it('is the same when only the selection moves', () => {
    const before = projectSignature(source);

    expect(projectSignature(withFile('main', {active: false}))).toBe(before);
    expect(projectSignature(withFile('main', {open: false}))).toBe(before);
    expect(projectSignature({...source, openFiles: ['player', 'main']})).toBe(
      before,
    );
  });

  it('changes when a file’s contents change', () => {
    expect(projectSignature(withFile('main', {contents: '{}'}))).not.toBe(
      projectSignature(source),
    );
  });

  it('changes when a file is added, removed, or renamed', () => {
    const {main, ...rest} = source.files;
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
    expect(projectSignature(withFile('main', {folderId: 'rules'}))).not.toBe(
      projectSignature(source),
    );
  });

  it('notices an image, which carries no contents at all', () => {
    // An image is bytes on a `url`; adding or repainting one is a change the
    // preview needs, and `projectFiles` cannot see it.
    const added: MultiFileSource = {
      ...source,
      files: {
        ...source.files,
        pic: {
          id: 'pic',
          name: 'hero.png',
          language: 'png',
          contents: '',
          folderId: 'sprites',
          url: 'data:image/png;base64,AAA',
        },
      },
    };
    const repainted = {
      ...added,
      files: {
        ...added.files,
        pic: {...added.files.pic, url: 'data:image/png;base64,BBB'},
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

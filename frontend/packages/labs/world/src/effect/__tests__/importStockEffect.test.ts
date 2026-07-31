// Copying a stock effect into a project: where the file lands and what it is
// called. Both are easy to get subtly wrong and hard to notice — a file in the
// wrong folder is invisible to the `use effect` dropdown, and a name collision
// silently destroys work.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockEffect} from '../importStockEffect';
import {parseEffectDocument} from '../model';
import {stockEffect} from '../stock';

const ripple = stockEffect('ripple')!;
const tint = stockEffect('tint')!;

/** A project with an `effects/` folder and whatever files are given. */
const project = (
  files: Record<string, {name: string; folderId: string}> = {},
): MultiFileSource => ({
  files: Object.fromEntries(
    Object.entries(files).map(([id, file]) => [
      id,
      {id, contents: '{}', language: 'effect', ...file},
    ]),
  ),
  folders: {
    effects: {id: 'effects', name: 'effects', parentId: '0'},
  },
  openFiles: [],
});

describe('importStockEffect', () => {
  it('writes the effect into effects/, where the dropdown looks', () => {
    const {source, path} = importStockEffect(project(), ripple);

    const added = Object.values(source.files)[0];
    expect(added.name).toBe('ripple.effect');
    expect(added.folderId).toBe('effects');
    expect(added.language).toBe('effect');
    expect(path).toBe('effects/ripple');
  });

  it('writes a document that parses back', () => {
    // It goes to disk as text and is read back by the editor and the bundler.
    const {source} = importStockEffect(project(), ripple);

    const contents = Object.values(source.files)[0].contents;
    expect(parseEffectDocument(contents).name).toBe('Ripple');
  });

  it('creates the effects/ folder when the project has none', () => {
    const bare: MultiFileSource = {files: {}, folders: {}, openFiles: []};

    const {source, path} = importStockEffect(bare, ripple);

    const folder = Object.values(source.folders).find(
      f => f.name === 'effects',
    );
    expect(folder).toBeDefined();
    expect(Object.values(source.files)[0].folderId).toBe(folder?.id);
    expect(path).toBe('effects/ripple');
  });

  it('does not overwrite an effect of the same name', () => {
    // The worst possible failure: the learner has changed their copy, imports
    // again, and their work is gone with nothing to show it happened.
    const existing = project({
      f1: {name: 'ripple.effect', folderId: 'effects'},
    });

    const {source, path} = importStockEffect(existing, ripple);

    expect(source.files.f1.contents).toBe('{}');
    expect(path).toBe('effects/ripple-2');
    expect(
      Object.values(source.files)
        .map(file => file.name)
        .sort(),
    ).toEqual(['ripple-2.effect', 'ripple.effect']);
  });

  it('keeps counting past the second copy', () => {
    const existing = project({
      f1: {name: 'ripple.effect', folderId: 'effects'},
      f2: {name: 'ripple-2.effect', folderId: 'effects'},
    });

    expect(importStockEffect(existing, ripple).path).toBe('effects/ripple-3');
  });

  it('ignores same-named files in other folders', () => {
    // `actors/ripple.js` is a different thing entirely; only the effects folder
    // constrains the name.
    const existing = project({f1: {name: 'ripple.effect', folderId: '0'}});

    expect(importStockEffect(existing, ripple).path).toBe('effects/ripple');
  });

  it('leaves the original source untouched', () => {
    // A pure transform: the caller decides when to commit it.
    const before = project();
    const snapshot = JSON.stringify(before);

    importStockEffect(before, tint);

    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('does not steal the active tab', () => {
    // The import is started from a block's dropdown and the point is to get
    // back to that block with the effect chosen. Opening the new file instead
    // would leave the learner looking at a graph while the change they asked
    // for happened somewhere off screen.
    const before = project();

    const {source} = importStockEffect(before, tint);

    expect(source.openFiles).toEqual(before.openFiles);
  });
});

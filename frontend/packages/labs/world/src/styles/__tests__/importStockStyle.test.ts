// Copying a theme into a project.
//
// The simplest of the importers, because a theme is a leaf: it names no rules,
// no actors and no pictures. What it still has to keep is the promise every
// import makes — it never writes over one the project already has.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockStyle, stockStyleById} from '../importStockStyle';
import {STOCK_STYLES} from '../stock';

const empty = (): MultiFileSource => ({files: {}, folders: {}, openFiles: []});

const modern = STOCK_STYLES[0];

const fileNames = (source: MultiFileSource) =>
  Object.values(source.files).map(file => file.name);

describe('importing a theme', () => {
  it('writes the file and answers the path a `use theme` stores', () => {
    const {source, path} = importStockStyle(empty(), modern);
    expect(path).toBe('styles/modern');
    expect(fileNames(source)).toEqual(['modern.style']);
    expect(Object.values(source.files)[0].language).toBe('style');
  });

  it('makes the folder, and then reuses it', () => {
    const first = importStockStyle(empty(), modern);
    const second = importStockStyle(first.source, STOCK_STYLES[1]);
    const folders = Object.values(second.source.folders).filter(
      folder => folder.name === 'styles',
    );
    expect(folders).toHaveLength(1);
    expect(fileNames(second.source).sort()).toEqual([
      'classic.style',
      'modern.style',
    ]);
  });

  it('never writes over one the project already has', () => {
    // A learner who has been editing `modern.style` and clicks Modern again
    // keeps their edits. Every importer in the lab promises this.
    const first = importStockStyle(empty(), modern);
    const edited = {
      ...first.source,
      files: Object.fromEntries(
        Object.entries(first.source.files).map(([id, file]) => [
          id,
          {...file, contents: '{"name":"Mine"}'},
        ]),
      ),
    };
    const again = importStockStyle(edited, modern);
    expect(Object.values(again.source.files)).toHaveLength(1);
    expect(Object.values(again.source.files)[0].contents).toBe(
      '{"name":"Mine"}',
    );
    expect(again.path).toBe('styles/modern');
  });

  it('finds one by id, and nothing by a name that is not one', () => {
    expect(stockStyleById('classic')?.name).toBe('Classic');
    expect(stockStyleById('nope')).toBeUndefined();
  });
});

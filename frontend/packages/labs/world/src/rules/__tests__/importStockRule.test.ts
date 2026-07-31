// Copying a stock rule into a project: where the file lands and what it is
// called. Both are easy to get subtly wrong and hard to notice — a rule in the
// wrong folder is invisible to the `use rule` dropdown, and a name collision
// silently destroys a learner's mechanics.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../importStockRule';
import {STOCK_RULES, stockRule} from '../stock';

const gravity = stockRule('gravity')!;

/** A project with a `rules/` folder and whatever files are given. */
const project = (
  files: Record<string, {name: string; folderId: string}> = {},
): MultiFileSource => ({
  files: Object.fromEntries(
    Object.entries(files).map(([id, file]) => [
      id,
      {id, contents: '{}', language: 'rule', ...file},
    ]),
  ),
  folders: {rules: {id: 'rules', name: 'rules', parentId: '0'}},
  openFiles: [],
});

describe('importStockRule', () => {
  it('writes the rule into rules/, where the dropdown looks', () => {
    const {source, path} = importStockRule(project(), gravity);

    const added = Object.values(source.files)[0];
    expect(added.name).toBe('gravity.rule');
    expect(added.folderId).toBe('rules');
    expect(added.language).toBe('rule');
    expect(path).toBe('rules/gravity');
  });

  it('writes a workspace that parses back', () => {
    // It goes to disk as text and is read back by the editor, the metadata
    // parser, and the generator.
    const {source} = importStockRule(project(), gravity);

    const contents = Object.values(source.files)[0].contents;
    expect(JSON.parse(contents).blocks.blocks[0].type).toBe('world_rule');
  });

  it('creates the rules/ folder when the project has none', () => {
    const bare: MultiFileSource = {files: {}, folders: {}, openFiles: []};

    const {source, path} = importStockRule(bare, gravity);

    const folder = Object.values(source.folders).find(f => f.name === 'rules');
    expect(folder).toBeDefined();
    expect(Object.values(source.files)[0].folderId).toBe(folder?.id);
    expect(path).toBe('rules/gravity');
  });

  it('does not overwrite a rule of the same name', () => {
    // The worst possible failure: the learner has changed their copy, imports
    // again, and their mechanics are gone with nothing to show it happened.
    const existing = project({f1: {name: 'gravity.rule', folderId: 'rules'}});

    const {source, path} = importStockRule(existing, gravity);

    expect(source.files.f1.contents).toBe('{}');
    expect(path).toBe('rules/gravity-2');
  });

  it('counts a same-stem file of ANY extension as taken', () => {
    // A project may hold a `gravity.js` shim from before rules were authorable.
    // Two modules differing only by extension make `rules/gravity` ambiguous to
    // the compiler's extension search.
    const existing = project({f1: {name: 'gravity.js', folderId: 'rules'}});

    expect(importStockRule(existing, gravity).path).toBe('rules/gravity-2');
  });

  it('ignores same-named files in other folders', () => {
    const existing = project({f1: {name: 'gravity.rule', folderId: '0'}});

    expect(importStockRule(existing, gravity).path).toBe('rules/gravity');
  });

  it('leaves the original source untouched', () => {
    const before = project();
    const snapshot = JSON.stringify(before);

    importStockRule(before, gravity);

    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('does not steal the active tab', () => {
    // The import is started from a `use rule` dropdown and the point is to get
    // back to that block with the rule chosen.
    const before = project();

    expect(importStockRule(before, gravity).source.openFiles).toEqual(
      before.openFiles,
    );
  });
});

describe('the stock rule library', () => {
  it('describes each rule well enough to choose from', () => {
    // The dialog shows a name, a sentence, and the traits it provides; a rule
    // reaches actors through its traits, so that is what a learner is picking.
    for (const rule of STOCK_RULES) {
      expect(rule.name).toBeTruthy();
      expect(rule.description).toMatch(/\w+ \w+/);
      expect(rule.provides.length).toBeGreaterThan(0);
    }
  });

  it('ships gravity, which is no longer built in', () => {
    expect(gravity.name).toBe('Has Gravity');
    expect(gravity.provides).toEqual(['Affected by Gravity', 'Acts as Ground']);
  });
});

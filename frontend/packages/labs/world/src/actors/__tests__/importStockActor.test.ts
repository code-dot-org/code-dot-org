// Copying a stock actor into a project: where the file lands, and what lands
// with it.
//
// `importStockRule`'s sibling and the same two hazards — an actor in the wrong
// folder is invisible to the ACTOR dropdown, and an import that overwrote would
// take a learner's edits with it and give no sign. The one thing this adds is
// the rules: a Label without the Text rule elects a trait nothing declares, and
// that fails at compile time with nothing on screen to say why.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {actorRequirements, importStockActor} from '../importStockActor';
import {STOCK_ACTORS, stockActorById} from '../stock';

const label = stockActorById('label')!;
const button = stockActorById('button')!;

/** A project with `actors/` and `rules/` folders and whatever files are given. */
const project = (
  files: Record<string, {name: string; folderId: string}> = {},
): MultiFileSource => ({
  files: Object.fromEntries(
    Object.entries(files).map(([id, file]) => [
      id,
      {id, contents: '{}', language: 'actor', ...file},
    ]),
  ),
  folders: {
    actors: {id: 'actors', name: 'actors', parentId: '0'},
    rules: {id: 'rules', name: 'rules', parentId: '0'},
  },
  openFiles: [],
});

const named = (source: MultiFileSource, name: string) =>
  Object.values(source.files).find(file => file.name === name);

describe('importStockActor', () => {
  it('writes the actor into actors/, where the dropdown looks', () => {
    const {source, path} = importStockActor(project(), label);

    expect(named(source, 'label.actor')?.folderId).toBe('actors');
    expect(named(source, 'label.actor')?.language).toBe('actor');
    expect(path).toBe('actors/label');
  });

  it('writes a workspace that parses back', () => {
    const {source} = importStockActor(project(), label);

    expect(() =>
      JSON.parse(named(source, 'label.actor')!.contents),
    ).not.toThrow();
  });

  it('brings the rules whose traits it elects', () => {
    const {source} = importStockActor(project(), button);

    expect(named(source, 'writing.rule')).toBeDefined();
    expect(named(source, 'mouse.rule')).toBeDefined();
    expect(named(source, 'writing.rule')?.folderId).toBe('rules');
  });

  it('brings those rules’ own dependencies too', () => {
    // `importStockRule` walks them, so this asks for two rules and may write
    // more. What matters is that nothing named is left dangling.
    const {source} = importStockActor(project(), button);
    const files = Object.values(source.files).map(file => file.name);

    for (const rule of actorRequirements(button)) {
      expect(files).toContain(`${rule.id}.rule`);
    }
  });

  it('creates the folders a bare project has not got', () => {
    const bare: MultiFileSource = {files: {}, folders: {}, openFiles: []};
    const {source} = importStockActor(bare, label);

    const folders = Object.values(source.folders).map(folder => folder.name);
    expect(folders).toContain('actors');
    expect(folders).toContain('rules');
  });

  it('never overwrites what is already there', () => {
    // The failure that would matter most: a learner's edited Label replaced by
    // the stock one, silently. Importing twice is a no-op that hands back what
    // is already in the project.
    const mine = project({f1: {name: 'label.actor', folderId: 'actors'}});
    const {source, path} = importStockActor(mine, label);

    expect(named(source, 'label.actor')?.contents).toBe('{}');
    expect(path).toBe('actors/label');
    expect(
      Object.values(source.files).filter(file => file.name === 'label.actor'),
    ).toHaveLength(1);
  });

  it('leaves an already-imported rule alone as well', () => {
    const mine = project({f1: {name: 'writing.rule', folderId: 'rules'}});
    const {source} = importStockActor(mine, label);

    expect(named(source, 'writing.rule')?.contents).toBe('{}');
  });
});

describe('the catalogue', () => {
  it('names a rule that exists for every requirement', () => {
    // A requirement naming a rule the library does not have would be silently
    // dropped by `actorRequirements`, and the import would write an actor
    // electing a trait nothing declares.
    for (const actor of STOCK_ACTORS) {
      expect(actorRequirements(actor)).toHaveLength(actor.requires.length);
    }
  });
});

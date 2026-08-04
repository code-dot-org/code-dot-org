// Copying a stock rule into a project: where the file lands and what it is
// called. Both are easy to get subtly wrong and hard to notice — a rule in the
// wrong folder is invisible to the `use rule` dropdown, and a name collision
// silently destroys a learner's mechanics.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule, stockRequirements} from '../importStockRule';
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
  /** The file an import wrote, by name — an import may write several. */
  const fileNamed = (source: MultiFileSource, name: string) =>
    Object.values(source.files).find(file => file.name === name)!;

  it('writes the rule into rules/, where the dropdown looks', () => {
    const {source, path} = importStockRule(project(), gravity);

    const added = fileNamed(source, 'gravity.rule');
    expect(added.name).toBe('gravity.rule');
    expect(added.folderId).toBe('rules');
    expect(added.language).toBe('rule');
    expect(path).toBe('rules/gravity');
  });

  it('writes a workspace that parses back', () => {
    // It goes to disk as text and is read back by the editor, the metadata
    // parser, and the generator.
    const {source} = importStockRule(project(), gravity);

    const contents = fileNamed(source, 'gravity.rule').contents;
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

  it('leaves a rule the project already has exactly as it is', () => {
    // The worst possible failure would be overwriting a learner's edited copy.
    // The second worst is what renaming did: `gravity-2.rule` still names
    // ITSELF `rules/gravity` — its traits, its events, the block types of its
    // members — so the copy imports its own exports and the project stops
    // compiling. Importing a rule that is already here hands back where it is.
    const existing = project({f1: {name: 'gravity.rule', folderId: 'rules'}});

    const {source, path} = importStockRule(existing, gravity);

    expect(source.files.f1.contents).toBe('{}');
    expect(path).toBe('rules/gravity');
    // Its dependencies still arrive: the learner's file may be a rule of their
    // own by that name, and either way the chain below it has to be there.
    expect(
      Object.values(source.files)
        .map(f => f.name)
        .sort(),
    ).toEqual([
      'collision.rule',
      'contacts.rule',
      'gravity.rule',
      'motion.rule',
    ]);
  });

  it('counts a same-stem file of ANY extension as already there', () => {
    // A project may hold a `gravity.js` shim from before rules were authorable.
    // Both answer to `rules/gravity`, and the compiler's extension search would
    // pick one — so writing a second file beside it would only make which one
    // ambiguous. Whatever is there is what `use rule rules/gravity` means.
    const existing = project({f1: {name: 'gravity.js', folderId: 'rules'}});

    const {source, path} = importStockRule(existing, gravity);
    expect(path).toBe('rules/gravity');
    expect(
      Object.values(source.files).filter(f => f.name.startsWith('gravity')),
    ).toHaveLength(1);
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

describe('importing what a rule needs', () => {
  /** The `.rule` files in the project, by module path. */
  const rulePaths = (source: MultiFileSource): string[] =>
    Object.values(source.files)
      .filter(file => file.name.endsWith('.rule'))
      .map(file => `rules/${file.name.replace(/\.rule$/, '')}`)
      .sort();

  it('brings the rules the imported one is written against', () => {
    // Gravity is written against collision's traits and motion's step; without
    // them its `use rule` names a file that is not there, and the project fails
    // to compile with nothing on screen to say why.
    const {source} = importStockRule(project(), gravity);
    expect(rulePaths(source)).toEqual([
      'rules/collision',
      'rules/contacts',
      'rules/gravity',
      'rules/motion',
    ]);
  });

  it('follows the chain, not just the first step', () => {
    // Gravity needs collision; collision needs motion. Motion arrives because
    // collision asked for it, not because gravity did.
    const {source} = importStockRule(project(), gravity);
    const collision = Object.values(source.files).find(
      f => f.name === 'collision.rule',
    )!;
    expect(collision.contents).toContain('"RULE": "Physics"');
  });

  it('gives a dependency its own name, never a renamed one', () => {
    // Two copies of a rule are two rules answering to one name, and a reference
    // that names "Collisions" would then be a question with two answers.
    const {source} = importStockRule(project(), gravity);
    expect(rulePaths(source)).toContain('rules/collision');
  });

  it('leaves a dependency the project already has alone', () => {
    // Importing collision and then gravity must not copy collision again — and
    // must not touch the learner's, which they may have edited.
    const first = importStockRule(project(), stockRule('collision')!);
    const edited = {
      ...first.source,
      files: Object.fromEntries(
        Object.entries(first.source.files).map(([id, file]) => [
          id,
          file.name === 'collision.rule'
            ? {...file, contents: '{"mine": true}'}
            : file,
        ]),
      ),
    };
    const second = importStockRule(edited, gravity);
    expect(rulePaths(second.source)).toEqual([
      'rules/collision',
      'rules/contacts',
      'rules/gravity',
      'rules/motion',
    ]);
    expect(
      Object.values(second.source.files).find(f => f.name === 'collision.rule')
        ?.contents,
    ).toBe('{"mine": true}');
  });

  it('says in advance what else it will add', () => {
    // The dialog shows this before a learner picks, so files appearing in
    // `rules/` are something they were told about rather than a surprise.
    // Deepest first, as they are copied: gravity wants collision, collision
    // wants contacts, and both of them want motion.
    expect(stockRequirements(gravity).map(r => r.id)).toEqual([
      'motion',
      'contacts',
      'collision',
    ]);
    expect(stockRequirements(stockRule('motion')!)).toEqual([]);
  });

  it('imports a rule that needs nothing without extras', () => {
    const {source} = importStockRule(project(), stockRule('motion')!);
    expect(rulePaths(source)).toEqual(['rules/motion']);
  });
});

describe('the stock rule library', () => {
  it('describes each rule well enough to choose from', () => {
    // The dialog shows a name, a sentence, and the traits it provides. A rule
    // reaches actors through its traits, so those are what a learner is usually
    // picking — but not every rule has one: the keyboard rule contributes
    // EVENTS, which every actor can hear without electing anything, and the
    // dialog omits the line rather than showing an empty list.
    for (const rule of STOCK_RULES) {
      expect(rule.name).toBeTruthy();
      // Two readings: what it is, and what a world that uses it has.
      expect(rule.ability).toBeTruthy();
      expect(rule.description).toMatch(/\w+ \w+/);
      for (const trait of rule.provides) {
        expect(trait).toMatch(/\w/);
      }
    }
  });

  it('ships gravity, which is no longer built in', () => {
    expect(gravity.name).toBe('Gravity');
    expect(gravity.ability).toBe('Has Gravity');
    expect(gravity.provides).toEqual(['Affected by Gravity', 'Acts as Ground']);
  });
});

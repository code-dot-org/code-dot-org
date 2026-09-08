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

import {importStockAnimation} from '../../appearance/importStock';
import {STOCK_ANIMATIONS} from '../../appearance/stock';
import {actorRequirements, importStockActor} from '../importStockActor';
import {STOCK_ACTORS, stockActorById} from '../stock';

const label = stockActorById('label')!;
const button = stockActorById('button')!;
const coin = stockActorById('coin')!;
const ground = stockActorById('ground')!;

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

    expect(named(source, 'mouse.rule')).toBeDefined();
    expect(named(source, 'mouse.rule')?.folderId).toBe('rules');
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
    // A COIN, which asks for rules. The Label asks for none any more — its
    // words are its own `define property` rows rather than a rule's trait —
    // so it would only ever make one of the two folders.
    const {source} = importStockActor(bare, coin);

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
    const mine = project({f1: {name: 'collisions.rule', folderId: 'rules'}});
    const {source} = importStockActor(mine, coin);

    expect(named(source, 'collisions.rule')?.contents).toBe('{}');
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

// An actor whose rows name a picture as well as a trait. Everything below is
// about the same hazard the rules answer: a field whose value must be among
// options the project supplies, and which says nothing when it is not.
describe('importStockActor, for an actor with a picture', () => {
  const names = (source: MultiFileSource) =>
    Object.values(source.files).map(file => file.name);

  it('writes the animation, the strip it reads, and the strip\u2019s grid', () => {
    const {source} = importStockActor(project(), coin);

    // Three files for one animation, and the third is the one that is easy to
    // forget: without the `.sheet`, `coinSpin.png` is a wide picture and the
    // animation has no frames to play.
    expect(names(source)).toEqual(
      expect.arrayContaining([
        'coinSpin.anim',
        'coinSpin.png',
        'coinSpin.sheet',
      ]),
    );
  });

  it('brings the rule the trait needs, and the rules that rule needs', () => {
    const {source} = importStockActor(project(), coin);

    // Collection is the only rule asked for. "Can Be Collected" requires "Can
    // Collide", so the rule importer brings Collisions, and Collisions brings
    // Motion — which is why a shelf entry naming ONE rule leaves three in the
    // project, and why the dependency walk belongs to the rule importer rather
    // than to a list written out by hand here.
    expect(names(source)).toEqual(
      expect.arrayContaining([
        'collect.rule',
        'collisions.rule',
        'motion.rule',
      ]),
    );
  });

  it('writes seven files for one click', () => {
    const {source} = importStockActor(project(), coin);

    expect(names(source).sort()).toEqual([
      'coin.actor',
      'coinSpin.anim',
      'coinSpin.png',
      'coinSpin.sheet',
      'collect.rule',
      'collisions.rule',
      'motion.rule',
    ]);
  });

  it('plays an animation the import actually registered', () => {
    // THE POINT OF THE WHOLE EXERCISE. A `play animation` field stores the
    // animation's key INSIDE its file, which is not always the file's stem —
    // the stock "switch" animation holds "switchFlip". An actor naming a key
    // the import does not write is a dropdown value with no option behind it,
    // and nothing anywhere reports that.
    const played = [...coin.contents.matchAll(/"ANIMATION": "([^"]+)"/g)].map(
      match => match[1],
    );
    const registered = (coin.animations ?? []).map(
      id =>
        importStockAnimation(
          project(),
          STOCK_ANIMATIONS.find(entry => entry.id === id)!,
        ).value,
    );

    expect(played).toEqual(registered);
  });

  it('is unchanged by a second import, pictures and all', () => {
    const once = importStockActor(project(), coin).source;
    const twice = importStockActor(once, coin).source;

    // Never-overwrite has to hold for every file the aggregate writes, not just
    // the actor: a learner who repainted `coinSpin.png` and imported a second
    // Coin would otherwise lose the painting.
    expect(names(twice).sort()).toEqual(names(once).sort());
    expect(twice.files).toEqual(once.files);
  });
});

// The other half of the aggregate: a still picture rather than an animation.
// An animation carries its own strip, so until something named a sprite
// DIRECTLY this path had no caller and no test.
describe('importStockActor, for an actor with a still picture', () => {
  const names = (source: MultiFileSource) =>
    Object.values(source.files).map(file => file.name);

  it('writes the image its `set sprite` row names', () => {
    const {source} = importStockActor(project(), ground);

    expect(names(source)).toEqual(expect.arrayContaining(['ground.png']));
  });

  it('names an image that exists, spelling and all', () => {
    // A `set sprite` field holds a FILE NAME, and the importer writes one from
    // the sprite id. Nothing but this checks that the two agree — a Ground
    // asking for `ground.PNG` would import a file and point at nothing.
    const {source} = importStockActor(project(), ground);
    const named = [...ground.contents.matchAll(/"SPRITE": "([^"]+)"/g)].map(
      match => match[1],
    );

    for (const file of named) {
      expect(names(source)).toContain(file);
    }
  });

  it('brings no `.sheet`, because a still picture is not a grid', () => {
    const {source} = importStockActor(project(), ground);

    expect(names(source).filter(name => name.endsWith('.sheet'))).toEqual([]);
  });
});

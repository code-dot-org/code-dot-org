// What a Blockly file is, and what may be put in it.
//
// Two things have to agree about a file's kind: the palette, which decides what
// a learner may place, and the generator, which decides what the file compiles
// to. The interesting tests here are the ones that hold them together — a root
// the palette offers and the generator then refuses is a project a learner
// cannot get out of, and a root the generator accepts anywhere is the silent
// retyping this all exists to stop.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette, heldNotOffered} from '../domainBlocks';
import {fileKindOf, moduleShape, ROOT_HOMES, type FileKind} from '../fileKind';

const KINDS: FileKind[] = ['actor', 'screen', 'rule', 'map', 'placement'];

/** Every block type a file kind's toolbox lists, categories flattened. */
const offeredTypes = (fileKind?: FileKind): string[] => {
  const {toolbox} = buildDomainPalette([], {fileKind});
  return (toolbox as Array<{blocks?: unknown[]}>).flatMap(category =>
    (category.blocks ?? []).filter(
      (item): item is string => typeof item === 'string',
    ),
  );
};

/** The names of the categories a file kind's toolbox has. */
const categoryNames = (fileKind?: FileKind): string[] =>
  (buildDomainPalette([], {fileKind}).toolbox as Array<{name: string}>).map(
    category => category.name,
  );

describe('fileKindOf', () => {
  it('reads the four extensions, and nothing else', () => {
    expect(fileKindOf('player.actor')).toBe('actor');
    expect(fileKindOf('screens/main.screen')).toBe('screen');
    // A world is no file's kind any more: a game is its Main Screen.
    expect(fileKindOf('levels/one.world')).toBeUndefined();
    expect(fileKindOf('rules/gravity.rule')).toBe('rule');
    // A map is generated too, now that it carries workspaces
    // (specs/MAP_FIRST.md); `placement` is a kind no file has.
    expect(fileKindOf('maps/level1.map')).toBe('map');
    expect(fileKindOf('main.js')).toBeUndefined();
    expect(fileKindOf('')).toBeUndefined();
    expect(fileKindOf()).toBeUndefined();
  });

  it('does not match an extension in the middle of a name', () => {
    // `isBlocklyPath` is this function, so a false positive here is a `.js`
    // file handed to the Blockly generator to parse as JSON.
    expect(fileKindOf('my.actor.js')).toBeUndefined();
    expect(fileKindOf('actor')).toBeUndefined();
  });
});

describe('which definition roots a file may hold', () => {
  it('offers `define actor` nowhere, and holds it at home', () => {
    // What an actor is, is the Actor Editor's (specs/ACTORS_AS_DATA_PLAN.md,
    // step 6). A file written with one still holds it.
    for (const kind of KINDS) {
      expect(offeredTypes(kind)).not.toContain('world_actor');
    }
    expect(heldNotOffered('actor')).toContain('world_actor');
    expect(heldNotOffered('screen')).not.toContain('world_actor');
  });

  it('gives the Rule category to a rule alone', () => {
    expect(categoryNames('rule')).toContain('Rule');
    expect(categoryNames('actor')).not.toContain('Rule');
    expect(categoryNames('screen')).not.toContain('Rule');
  });

  it('does not offer `use rule` to a screen', () => {
    // A game runs the rules the project holds (blockly/projectModules), so
    // the block would be a row that does nothing. It is still OFFERED to a
    // rule, where it declares a dependency and means something, and still
    // REGISTERED everywhere so a project saved with one keeps loading.
    expect(offeredTypes('screen')).not.toContain('world_use_rule');
    // …and a rule's are its data, chosen on its view.
    expect(offeredTypes('rule')).not.toContain('world_use_rule');
  });

  it('offers everything when the file kind is unknown', () => {
    const anything = offeredTypes();

    expect(anything).toContain('world_return');
    expect(heldNotOffered(undefined)).toContain('world_actor');
    expect(categoryNames()).toContain('Rule');
  });

  it('never offers a root the generator would refuse', () => {
    // The invariant that binds the palette to the generator. A block offered in
    // a file that will not compile with it is worse than one simply missing:
    // the learner is invited to make a project that cannot run.
    for (const kind of KINDS) {
      const path = `thing.${kind}`;
      for (const type of offeredTypes(kind)) {
        expect(() => moduleShape(path, [type])).not.toThrow();
      }
    }
  });
});

describe('what a file compiles to', () => {
  it('is decided by the extension, not by the blocks', () => {
    // The whole point: the blocks do not make the file what it is, its name
    // does — and a root that disagrees with the name is refused (below),
    // never allowed to redirect it.
    expect(moduleShape('player.actor', ['world_actor'])).toBe('actor');
    expect(moduleShape('rules/g.rule', ['world_rule'])).toBe('rule');
  });

  it('is an actor even before the actor block exists', () => {
    expect(moduleShape('player.actor', [])).toBe('actor');
  });

  it('is a rule even with no rule block, rather than an actor', () => {
    expect(moduleShape('rules/g.rule', [])).toBe('rule');
  });

  it('refuses a `define actor` outside an actor file', () => {
    expect(() => moduleShape('rules/g.rule', ['world_actor'])).toThrow(
      /can only be in a \.actor file, and this is a \.rule/,
    );
    expect(() => moduleShape('player.actor', ['world_actor'])).not.toThrow();
  });

  it('names the file in the error, since a project has many', () => {
    expect(() => moduleShape('rules/gravity.rule', ['world_actor'])).toThrow(
      /rules\/gravity\.rule/,
    );
  });

  it('lets a merely inert root through', () => {
    // A trait or a step in an actor file generates nothing — no walk matches
    // it — exactly as a misplaced event hat does. The palette is what keeps it
    // out; failing the compile over one would take a project down to no end.
    expect(() =>
      moduleShape('player.actor', [
        'world_rule_trait',
        'world_rule_step_in',
        'world_on_Input_IsPressedEvent',
      ]),
    ).not.toThrow();
  });

  it('is an actor’s when there is no path', () => {
    // Callers without a path have nothing better to go on, and nothing is
    // refused — there is no kind for a root to contradict.
    expect(moduleShape(undefined, ['world_actor'])).toBe('actor');
    expect(moduleShape(undefined, ['world_map'])).toBe('actor');
    expect(moduleShape(undefined, [])).toBe('actor');
  });
});

describe('ROOT_HOMES', () => {
  it('gives every root at least one home', () => {
    // A root with no home could never be offered anywhere, and `moduleShape`
    // would have no `.<kind>` to name in its error.
    for (const [type, homes] of ROOT_HOMES) {
      expect(homes.size, type).toBeGreaterThan(0);
    }
  });
});

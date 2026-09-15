// What a Blockly file is, and what may be put in it.
//
// Two things have to agree about a file's kind: the palette, which decides what
// a learner may place, and the generator, which decides what the file compiles
// to. The interesting tests here are the ones that hold them together — a root
// the palette offers and the generator then refuses is a project a learner
// cannot get out of, and a root the generator accepts anywhere is the silent
// retyping this all exists to stop.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../domainBlocks';
import {fileKindOf, moduleShape, ROOT_HOMES, type FileKind} from '../fileKind';

const KINDS: FileKind[] = ['actor', 'world', 'rule'];

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
  it('reads the three extensions, and nothing else', () => {
    expect(fileKindOf('player.actor')).toBe('actor');
    expect(fileKindOf('levels/one.world')).toBe('world');
    expect(fileKindOf('rules/gravity.rule')).toBe('rule');
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
  it('offers `define actor` to an actor file alone', () => {
    // Every actor is a file. A world once held its own; nothing offers one
    // there now, and one that reaches a world anyway is refused (below).
    expect(offeredTypes('actor')).toContain('world_actor');
    expect(offeredTypes('world')).not.toContain('world_actor');
    expect(offeredTypes('rule')).not.toContain('world_actor');
  });

  it('offers `define world` to a world alone', () => {
    expect(offeredTypes('world')).toContain('world_world');
    expect(offeredTypes('actor')).not.toContain('world_world');
    expect(offeredTypes('rule')).not.toContain('world_world');
  });

  it('gives the Rule category to a rule alone', () => {
    expect(categoryNames('rule')).toContain('Rule');
    expect(categoryNames('actor')).not.toContain('Rule');
    expect(categoryNames('world')).not.toContain('Rule');
  });

  it('keeps `use trait` when the Rule category goes', () => {
    // It is listed in Actor as well, which is why dropping the whole category
    // is safe. If that duplication ever went, this fails rather than an actor
    // quietly losing the block that gives it a trait.
    expect(offeredTypes('actor')).toContain('world_use_trait');
  });

  it('offers `each frame` wherever there is an owner to name', () => {
    // Two readings, both the same sentence about whoever owns it: a trait's
    // member in a `.rule`, and a kind's own work in an `.actor`. A world
    // once had a third, for the actors it defined itself, and has nothing
    // for a step to be about now.
    expect(offeredTypes('actor')).toContain('world_trait_step');
    expect(offeredTypes('rule')).toContain('world_trait_step');
    expect(offeredTypes('world')).not.toContain('world_trait_step');
  });

  it('offers `define drawing` to an actor file alone', () => {
    expect(offeredTypes('actor')).toContain('world_define_drawing');
    expect(offeredTypes('world')).not.toContain('world_define_drawing');
    expect(offeredTypes('rule')).not.toContain('world_define_drawing');
  });

  it('gives `each frame` one shape, in every kind of file', () => {
    // It used to have two. A definition root must not have a previous
    // connection — `DisableOrphansPlugin` reads a top-level block with one as
    // an orphan and grays it out along with everything under it — so an
    // `.actor` file got a rootless `each frame` and every other file got the
    // chaining one. It is a ROW under `define actor` now, in an `.actor` file
    // as in a world, so there is nothing left to vary.
    const shapeIn = (fileKind: FileKind) => {
      const matches = buildDomainPalette([], {fileKind}).blocks.filter(
        block => block.type === 'world_trait_step',
      ) as Array<{previousStatement?: boolean}>;
      // Exactly one definition per type: two would leave which one lands on
      // the workspace up to registration order.
      expect(matches).toHaveLength(1);
      return matches[0].previousStatement;
    };

    expect(shapeIn('actor')).toBe(true);
    expect(shapeIn('rule')).toBe(true);
    expect(shapeIn('world')).toBe(true);
  });

  it('gives `define drawing` one shape too, in every kind of file', () => {
    // The last block that had two, and it lost them for the same reasons
    // `each frame` did: `Blockly.Blocks` holds one definition per type for the
    // whole process, so a shape that varied by file was never local to the
    // file that wanted it. It is a ROW under `define actor` in both homes now,
    // with the pen and the shapes on a surface of its own.
    const shapeIn = (fileKind: FileKind) => {
      const matches = buildDomainPalette([], {fileKind}).blocks.filter(
        block => block.type === 'world_define_drawing',
      ) as Array<{previousStatement?: boolean}>;
      expect(matches).toHaveLength(1);
      return matches[0].previousStatement;
    };

    expect(shapeIn('actor')).toBe(true);
    expect(shapeIn('rule')).toBe(true);
    expect(shapeIn('world')).toBe(true);
  });

  it('does not offer `use rule` to a world', () => {
    // A world runs the rules the project holds (blockly/projectModules), so
    // the block would be a row that does nothing. It is still OFFERED to a
    // rule, where it declares a dependency and means something, and still
    // REGISTERED everywhere so a project saved with one keeps loading.
    expect(offeredTypes('world')).not.toContain('world_use_rule');
    expect(offeredTypes('rule')).toContain('world_use_rule');
  });

  it('offers everything when the file kind is unknown', () => {
    const anything = offeredTypes();

    expect(anything).toContain('world_actor');
    expect(anything).toContain('world_world');
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
    expect(moduleShape('one.world', ['world_world'])).toBe('world');
    expect(moduleShape('rules/g.rule', ['world_rule'])).toBe('rule');
  });

  it('is a world even before the world block exists', () => {
    // A half-built `.world` has no root yet. Compiling it as an ACTOR — which
    // is what looking for `world_world` did — reports the wrong problem.
    expect(moduleShape('one.world', [])).toBe('world');
    expect(moduleShape('player.actor', [])).toBe('actor');
  });

  it('is a rule even with no rule block, rather than an actor', () => {
    expect(moduleShape('rules/g.rule', [])).toBe('rule');
  });

  it('refuses a `define world` outside a world', () => {
    expect(() => moduleShape('player.actor', ['world_world'])).toThrow(
      /can only be in a \.world file, and this is a \.actor/,
    );
    expect(() => moduleShape('rules/g.rule', ['world_world'])).toThrow();
  });

  it('refuses a `define rule` outside a rule', () => {
    expect(() => moduleShape('player.actor', ['world_rule'])).toThrow(
      /can only be in a \.rule file, and this is a \.actor/,
    );
    expect(() => moduleShape('one.world', ['world_rule'])).toThrow();
  });

  it('refuses a `define actor` outside an actor file', () => {
    // As invalid in a world as a `define rule` is, and refused the same way:
    // a world once held its own actors, and does not now.
    expect(() => moduleShape('one.world', ['world_actor'])).toThrow(
      /can only be in a \.actor file, and this is a \.world/,
    );
    expect(() => moduleShape('rules/g.rule', ['world_actor'])).toThrow();
    expect(() => moduleShape('player.actor', ['world_actor'])).not.toThrow();
  });

  it('names the file in the error, since a project has many', () => {
    expect(() => moduleShape('actors/player.actor', ['world_world'])).toThrow(
      /actors\/player\.actor/,
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

  it('falls back to the blocks when there is no path', () => {
    // Callers without a path have nothing better to go on, and nothing is
    // refused — there is no kind for a root to contradict.
    expect(moduleShape(undefined, ['world_rule'])).toBe('rule');
    expect(moduleShape(undefined, ['world_world'])).toBe('world');
    expect(moduleShape(undefined, ['world_actor'])).toBe('actor');
    expect(moduleShape(undefined, [])).toBe('actor');
  });

  it('reads a rule as a rule even beside a world block, with no path', () => {
    // Order of the checks, pinned: the rule branch generates a whole different
    // kind of module, so it wins.
    expect(moduleShape(undefined, ['world_world', 'world_rule'])).toBe('rule');
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

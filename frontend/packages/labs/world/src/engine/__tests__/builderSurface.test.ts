// Everything the blocks call on `world` has to exist wherever that block is
// allowed to sit.
//
// Inside a `.world` file the name `world` is a `WorldBuilder`; in an event
// handler or a rule step it is the live `World`. One block generates one call,
// so a method added to only one of them is a crash carrying the block's own
// name — `world.setLayerParallax is not a function` — at the moment a learner
// runs their game rather than at the moment anyone wrote the block. That has
// happened twice, which is what this file is for.
//
// Some methods ARE deliberately one-sided, and those are the two guarded
// families: placement and declaration belong to the builder, removal and input
// belong to the running world. Each is listed below with its reason, and
// anything not listed must exist on both. The default is therefore the safe
// one: a new method is assumed to need both sides until someone writes down why
// it does not.

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

import {World, WorldBuilder} from '../index';

/**
 * Builder-only, because the live World cannot answer them after the fact.
 *
 * Their blocks carry `builderWorldExtension`, or throw through
 * `requireUnbuilt`. The guard warns; it does not prevent, so a learner who
 * ignores it still reaches the missing method — which is why these are written
 * down rather than merely tolerated.
 */
const BUILDER_ONLY: Record<string, string> = {
  define: 'registering a template is part of describing a world',
  defineLayer: 'a layer cannot be spliced into a scene graph that exists',
  loadMap: 'placement instantiates templates; World.addActor takes made Actors',
  useAnimations: 'the animation registry is seeded once, at construction',
  useRules: 'rules decide trait membership for every actor, at construction',
};

/**
 * Runtime-only, because the builder has no counterpart.
 *
 * Their blocks carry `runtimeWorldExtension`. Removing an actor that has not
 * been placed, raising an event before anything can hear it, or asking which
 * key is down while the world is still being described are all questions with
 * no answer at build time.
 */
const RUNTIME_ONLY: Record<string, string> = {
  clearActors: 'there is nothing placed to clear while the world is described',
  emit: 'nothing can hear an event before the actors exist',
  isKeyDown: 'there is no frame yet, so no key is down',
  query: 'a query reads a running world',
  removeActor: 'nothing is placed to remove',
};

/** Every `world.<name>(` the block generators can emit. */
const called = (): string[] => {
  // From the package root, which is vitest's cwd — `import.meta.url` is a
  // transformed module URL here, not a file path.
  const source = readFileSync(
    join(process.cwd(), 'src/blockly/domainBlocks.ts'),
    'utf8',
  );
  const names = new Set<string>();
  for (const match of source.matchAll(/\bworld\.(\w+)\(/g)) {
    names.add(match[1]);
  }
  return [...names].sort();
};

const has = (target: object, name: string): boolean =>
  typeof (target as unknown as Record<string, unknown>)[name] === 'function';

describe('the `world` surface the blocks generate against', () => {
  it('finds the call sites at all', () => {
    // A guard on the guard: a regex that quietly matched nothing would pass
    // every assertion below, for every possible engine.
    const names = called();

    expect(names.length).toBeGreaterThanOrEqual(15);
    expect(names).toContain('addActor');
    expect(names).toContain('setBackgroundColor');
  });

  it('exists on the WorldBuilder unless it is runtime-only', () => {
    const missing = called().filter(
      name => !RUNTIME_ONLY[name] && !has(WorldBuilder.prototype, name),
    );

    expect(missing).toEqual([]);
  });

  it('exists on the live World unless it is builder-only', () => {
    const missing = called().filter(
      name => !BUILDER_ONLY[name] && !has(World.prototype, name),
    );

    expect(missing).toEqual([]);
  });

  it('does not excuse a method that is actually on both', () => {
    // The lists are exemptions, and an exemption nobody needs is a lie about
    // the design that would hide the next real one.
    const stale = [
      ...Object.keys(BUILDER_ONLY).filter(name => has(World.prototype, name)),
      ...Object.keys(RUNTIME_ONLY).filter(name =>
        has(WorldBuilder.prototype, name),
      ),
    ];

    expect(stale).toEqual([]);
  });
});

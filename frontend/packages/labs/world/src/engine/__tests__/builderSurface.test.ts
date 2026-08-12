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
//
// Since the builder became a call log the compiler catches most of this — a
// deferred method names a `keyof World`, so it cannot forward to something that
// is not there. What the compiler cannot see is a method MISSING from the
// builder entirely, because the call sites are generated strings. That is this
// file's remaining job, and it is the one that actually bit.

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

import {GENERATED_WORLD_CALLS} from '../../blockly/domainBlocks';
import {World, WorldBuilder} from '../index';

/**
 * Builder-only, because the live World cannot answer them after the fact.
 *
 * Their blocks carry `builderWorldExtension`, or throw through
 * `requireNoActors`. The guard warns; it does not prevent, so a learner who
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
 * Runtime-only, because the question has no answer while a world is described.
 *
 * This list used to be longer. `clearActors` and `removeActor` were on it —
 * "nothing is placed to remove" — which stopped being true once `loadMap`
 * placed actors into a world the builder holds: `load map`, `clear world`,
 * `load map` is a world replacing its level, not a mistake. What is left is
 * the three that need a world that is RUNNING, not merely populated.
 */
const RUNTIME_ONLY: Record<string, string> = {
  emit: 'nothing can hear an event before a tick dispatches it',
  emitToWorld: 'the same, for an event that happened to nobody in particular',
  isKeyDown: 'there is no frame yet, so no key is down',
  isButtonDown: 'the same, for the mouse',
  mousePosition: 'the pointer is somewhere on a screen there is not one of yet',
  query: 'a query reads a running world',
};

/**
 * Every `world.<name>(` the block generators can emit.
 *
 * Two sources, because one is not enough. The regex finds the calls written
 * out literally; the FACTORIES cannot be found that way at all, since they emit
 * `world.set${slot.method}Repeat(…)` and the name never appears in the source.
 * Scanning alone reported a clean surface while `setBackgroundRepeat` was
 * missing from the builder — so the factories declare what they call, and both
 * sets are checked.
 */
const called = (): string[] => {
  // From the package root, which is vitest's cwd — `import.meta.url` is a
  // transformed module URL here, not a file path.
  const source = readFileSync(
    join(process.cwd(), 'src/blockly/domainBlocks.ts'),
    'utf8',
  );
  // Comments first. They are prose ABOUT the calls and full of examples —
  // "generate `world.get(…)` and fail at runtime" is a sentence explaining a
  // bug, not a call site. Scanning them made writing a comment about a method
  // fail this test, and the obvious way to make that green again is to weaken
  // the guard, which is exactly the wrong repair.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const names = new Set<string>();
  for (const match of code.matchAll(/\bworld\.(\w+)\(/g)) {
    names.add(match[1]);
  }
  for (const name of GENERATED_WORLD_CALLS) {
    names.add(name);
  }
  return [...names].sort();
};

/**
 * Whether `name` is a member of `target`, WITHOUT reading it.
 *
 * Descriptors rather than a property access, because some members are getters
 * (`WorldBuilder.actors`) and reading one off the prototype would run it with
 * `this` bound to the prototype — a test that asks "does this exist" would
 * build a world to find out, and throw.
 */
const has = (target: object, name: string): boolean => {
  const descriptor = Object.getOwnPropertyDescriptor(target, name);
  return Boolean(
    descriptor && (typeof descriptor.value === 'function' || descriptor.get),
  );
};

describe('the `world` surface the blocks generate against', () => {
  it('finds the call sites at all', () => {
    // A guard on the guard: a regex that quietly matched nothing would pass
    // every assertion below, for every possible engine.
    const names = called();

    expect(names.length).toBeGreaterThanOrEqual(25);
    expect(names).toContain('addActor');
    expect(names).toContain('setBackgroundColor');
    // A factory-generated one, which the regex alone cannot see.
    expect(names).toContain('setBackgroundRepeat');
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

  it('sees through the block FACTORIES, which no regex can', () => {
    // The hole this file had. A factory emits `world.set${slot.method}Repeat`,
    // so the name `setBackgroundRepeat` appears nowhere in the source, and the
    // scan reported a clean surface while seven builder methods were missing.
    // The factories declare what they call; this pins that they still do.
    const names = called();

    for (const name of [
      'setBackground',
      'setBackgroundOffset',
      'setBackgroundRepeat',
      'setForeground',
      'setForegroundOffset',
      'setForegroundRepeat',
      'addLayerEffect',
      'removeForegroundEffect',
    ]) {
      expect(names, name).toContain(name);
    }
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

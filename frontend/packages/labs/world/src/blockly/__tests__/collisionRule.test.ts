// The default project's `rules/collision.rule` — impenetrability, in blocks.
//
// The last of the engine's physics to move out, and the one that had to be
// decomposed to stay readable: the step says "for each mover, for each solid,
// push it out", and the arithmetic lives in members with names. This checks the
// shape the rest of the project depends on — the two traits an actor elects, the
// box query gravity asks, and the step ordering that puts resolution after
// Motion has moved things and before gravity decides who is standing on what.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

const source = DEFAULT_PROJECT.source.files.collisionRule.contents;
const meta = parseRuleMeta('rules/collision', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/collision.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(DEFAULT_PROJECT.source.files.collisionRule.name).toBe(
      'collision.rule',
    );
    expect(source).not.toContain('world-lab');
  });

  it('keeps the two traits apart, as the engine did', () => {
    // A Solid blocks every side; gravity's "Acts as Ground" is a surface you may
    // pass up through. A tile carries both, and they were never the same thing.
    expect(meta.name).toBe('Has Collisions');
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'CanCollideTrait',
      'SolidTrait',
    ]);
    expect(meta.traits[1].requires).toEqual([
      'rules/collision#CanCollideTrait',
    ]);
  });

  it('names its own trait rather than importing its own module', () => {
    // Solid requires Can Collide, which is declared a few lines above it. An
    // import there is not redundant but fatal: "The symbol CanCollideTrait has
    // already been declared", and the project stops building.
    expect(module_).toContain('SolidTrait.requires([CanCollideTrait]);');
    expect(module_).not.toContain("from 'rules/collision'");
  });

  it('carries the size override, with its “auto” default', () => {
    const size = meta.properties.find(p => p.id === 'size');
    expect(size?.type).toBe('point');
    expect(size?.scope).toBe('actor');
    // (0, 0) means "fit the sprite" — which is why the resolved box is a QUERY
    // and reading this property answers a different question.
    expect(size?.default).toEqual({x: 0, y: 0});
  });

  it('answers what a box actually is, and whether two overlap', () => {
    expect(meta.queries.map(query => query.ref.exportName)).toEqual([
      'CollisionSizeOfQuery',
      'IsTouchingQuery',
    ]);
    expect(meta.queries[0].returns).toBe('vector');
    expect(meta.queries[1].returns).toBe('boolean');
  });

  it('resolves one pair at a time, through a named block', () => {
    // The decomposition that keeps the step readable: the step loops, this does
    // the geometry for a single body against a single solid.
    const push = meta.actions.find(a => a.id === 'push_out_of_over');
    expect(push?.params.map(p => p.type)).toEqual(['actor', 'actor', 'number']);
  });

  it('explains each block it defines', () => {
    // The tooltip a learner gets when they hover the block in the toolbox. A
    // member with none has a tooltip that repeats its name back at them.
    for (const member of [...meta.queries, ...meta.actions]) {
      expect(member.description, member.name).toMatch(/\w+ \w+/);
    }
  });

  it('runs after Motion has moved everything', () => {
    // Resolution operates on the positions Motion just integrated, which is what
    // makes the per-tick order a chain: velocity → move → resolve → land.
    const [step] = meta.steps;
    expect(step.id).toBe('resolve');
    expect(step.order.kind).toBe('after');
    expect(step.order.anchor?.ownerRef.modulePath).toBe('rules/motion');
    expect(step.order.anchor?.stepId).toBe('reposition');
  });
});

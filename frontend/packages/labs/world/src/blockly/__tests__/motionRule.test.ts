// The default project's `rules/motion.rule` — moving, in blocks.
//
// The last of the engine's physics to leave, and the one everything else stands
// on: gravity adds to the speed this rule keeps, arrows set it, collision undoes
// the move it made. All three anchor their steps to `reposition`, so what this
// pins is the shape they depend on — the trait, the speed, the rewind query, and
// the scale between speeds and pixels that used to be a constant inside the
// engine.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

const source = DEFAULT_PROJECT.source.files.motionRule.contents;
const meta = parseRuleMeta('rules/motion', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/motion.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(DEFAULT_PROJECT.source.files.motionRule.name).toBe('motion.rule');
    expect(source).not.toContain('world-lab');
  });

  it('gives an actor a speed, on a trait that can be positioned', () => {
    expect(meta.name).toBe('Has Physics');
    expect(meta.requires).toEqual(['SpatialRule']);
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'CanMoveTrait',
    ]);
    expect(meta.traits[0].requires).toEqual(['PositionalTrait']);
    const velocity = meta.properties.find(p => p.id === 'velocity');
    expect(velocity?.scope).toBe('actor');
    expect(velocity?.type).toBe('vector');
  });

  it('gets the scale from the engine, not from a property of its own', () => {
    // Speeds are in units and positions are in pixels; `pixels per unit` is the
    // number between them. It is a fact about the coordinate system the renderer
    // draws in — an Engine block — rather than a knob this rule owns, so the two
    // places that convert both reach for the same one.
    expect(meta.properties.map(p => p.id)).toEqual(['velocity']);
    expect(source).toContain('world_pixels_per_unit');
  });

  it('offers the shove and the rewind the other rules use', () => {
    // `apply force` is on the trait, so it is asked OF an actor; `position
    // before` is the world's, because it is a question about a pair of numbers.
    const force = meta.actions.find(a => a.id === 'apply_force');
    expect(force?.scope).toBe('actor');
    const before = meta.queries.find(q => q.id === 'position_before');
    expect(before?.scope).toBe('world');
    expect(before?.returns).toBe('vector');
    expect(before?.params.map(p => p.type)).toEqual(['actor', 'number']);
  });

  it('runs a step called `reposition`, which everything else anchors to', () => {
    // Gravity runs before it, collision after it, arrows before it. The NAME is
    // load-bearing: an anchor is `<module>#<stepId>`.
    const [step] = meta.steps;
    expect(step.id).toBe('reposition');
    expect(step.order.kind).toBe('free');
    expect(module_).toContain('rule.addStep("reposition"');
  });

  it('explains each block it defines', () => {
    for (const member of [...meta.queries, ...meta.actions]) {
      expect(member.description, member.name).toMatch(/\w+ \w+/);
    }
  });
});

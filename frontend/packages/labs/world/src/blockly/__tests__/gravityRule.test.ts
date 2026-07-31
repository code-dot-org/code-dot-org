// The default project's `rules/gravity.rule` — the first rule authored in
// Blockly rather than shimmed from the engine.
//
// It is checked here rather than left to the browser because it is the proof
// that a `.rule` can be a real rule: parse the shipped file, and assert the
// module that comes out declares what the built-in `GravityRule` declares.
// Everything a `.actor` or `.world` in the same project references by name —
// the traits, the properties, the events — has to survive that round trip, or
// the default project does not load.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

const source = DEFAULT_PROJECT.source.files.gravityRule.contents;
const meta = parseRuleMeta('rules/gravity', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/gravity.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(DEFAULT_PROJECT.source.files.gravityRule.name).toBe('gravity.rule');
    expect(source).not.toContain('world-lab');
  });

  it('parses to the rule the built-in declares', () => {
    expect(meta.name).toBe('Has Gravity');
    expect(meta.requires).toEqual(['MotionRule', 'CollisionRule']);
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'AffectedByGravityTrait',
      'ActsAsGroundTrait',
    ]);
    expect(meta.properties.map(property => property.ref.exportName)).toEqual([
      'DirectionProperty',
      'StrengthProperty',
      'GravityScaleProperty',
      'FallingProperty',
    ]);
    expect(meta.events.map(event => event.ref.exportName)).toEqual([
      'StartsFallingEvent',
      'StopsFallingEvent',
    ]);
  });

  it('marks `falling` read-only, because a step owns it', () => {
    // The property the landing step writes. Without this the palette offers a
    // `set falling` block whose value the next tick overwrites.
    const falling = meta.properties.find(p => p.id === 'falling');
    expect(falling?.readonly).toBe(true);
    expect(module_).toContain('readonly: true');
  });

  it('orders its step before Motion integrates', () => {
    // The reason step anchors exist: gravity must add to the velocity before
    // Motion turns velocity into position, or it lags a frame behind.
    const [step] = meta.steps;
    expect(step.order.kind).toBe('before');
    expect(step.order.anchor?.ownerRef.exportName).toBe('MotionRule');
    expect(step.order.anchor?.stepId).toBe('reposition');
    expect(module_).toContain(
      'rule.addStepBefore("applyVelocity", WorldLab.MotionRule.steps["reposition"]',
    );
  });

  it('names its members where the rest of the project reaches for them', () => {
    // `player.actor` carries `rules/gravity#AffectedByGravityTrait` and handles
    // `rules_gravity_StartsFallingEvent`. Those strings are built from the
    // export names above, so a rename here silently unhooks the tutorial.
    const player = DEFAULT_PROJECT.source.files.player.contents;
    expect(player).toContain('rules/gravity#AffectedByGravityTrait');
    expect(player).toContain('world_on_rules_gravity_StartsFallingEvent');
  });

  it('declares the query that reads its read-only property', () => {
    // `falling` is step-owned, so it has no `set` block — but it must still be
    // READABLE, and this query is how. (Generating the getter only for settable
    // properties made a read-only one unreadable even from its own rule.)
    //
    // Only the DECLARATION is checked here: an action's or query's body is
    // generated from live blocks, not from this static parse, so `module_`
    // carries an empty one. The bodies are verified in the browser.
    const query = meta.queries.find(q => q.id.startsWith('is_on_the_ground'));
    expect(query?.scope).toBe('actor');
    expect(query?.ownerTraitId).toBe('Affected_by_Gravity');
    expect(query?.returns).toBe('boolean');
    expect(module_).toContain('AffectedByGravityTrait.addQuery(');
  });

  it('declares the invert action on the rule, not on a trait', () => {
    // Gravity's direction is world-scoped, so inverting it is the world's to do.
    const action = meta.actions.find(a => a.id === 'Invert_Gravity');
    expect(action?.scope).toBe('world');
    expect(module_).toContain('rule.addAction("Invert_Gravity", (world) =>');
  });

  it('names its own members locally, not through an import of itself', () => {
    // The self-reference case: a rule's body referencing its own member uses
    // the local `export const`. Importing the module into itself would be a
    // cycle that resolves to undefined.
    expect(module_).not.toContain("from 'rules/gravity'");
  });

  it('is what the world puts in play', () => {
    expect(DEFAULT_PROJECT.source.files.main.contents).toContain(
      'rules/gravity',
    );
  });
});

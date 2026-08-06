// The default project's `rules/arrows.rule` — walking, as a mechanic.
//
// It was the engine's Input rule until the split: the engine kept READING the
// keyboard (key events, and the `key … is down` block), and the decision that
// the right arrow means "go right at this speed" moved into blocks. What that
// buys is a learner who wants WASD, or acceleration instead of a constant
// speed, editing a rule instead of the engine — so this checks that the rule
// really declares what the engine used to, and that its step still lands in the
// right place in the frame.

import {describe, expect, it} from 'vitest';

import {starterFile} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

// Its `use rule`s name other rules of this project, which have to be registered
// before a module can be generated from it — the same call the editor makes.
registerDefaultProjectRules();

const source = starterFile('arrowsRule').contents;
const meta = parseRuleMeta('rules/arrows', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/arrows.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(starterFile('arrowsRule').name).toBe('arrows.rule');
    expect(source).not.toContain('world-lab');
  });

  it('declares what the engine rule declared', () => {
    expect(meta.name).toBe('Arrow Keys');
    expect(meta.ability).toBe('Moves with Arrow Keys');
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'ControlledByArrowKeysTrait',
    ]);
    expect(meta.properties.map(property => property.ref.exportName)).toEqual([
      'MoveSpeedProperty',
    ]);
  });

  it('needs an actor that can move, and nothing else', () => {
    // Not the keyboard RULE: reading which keys are held is the World's job
    // (`key … is down`), so walking works in a project that never imported the
    // rule that raises key events.
    expect(meta.requires).toEqual(['Physics']);
    expect(meta.traits[0].requires).toEqual(['Physics#CanMoveTrait']);
  });

  it('carries a walk speed in units, not pixels', () => {
    // 1.5 units/s is 150 px/s — the same walk, in the numbers a learner can
    // reason about (engine/core/units).
    const speed = meta.properties.find(p => p.id === 'move_speed');
    expect(speed?.default).toBe(1.5);
    expect(speed?.scope).toBe('actor');
  });

  it('runs before Motion integrates, so a held key moves this frame', () => {
    const [step] = meta.steps;
    expect(step.order.kind).toBe('before');
    expect(step.order.anchor?.ownerRef.ruleName).toBe('Physics');
    expect(step.order.anchor?.stepId).toBe('reposition');
  });

  it('declares the members the project references', () => {
    // The player's `use trait` names this export; a rename here breaks the
    // default project, which is what this pins.
    expect(module_).toContain(
      'export const ControlledByArrowKeysTrait = rule.addTrait(',
    );
    expect(module_).toContain('export const MoveSpeedProperty =');
  });
});

// The default project's `rules/motion.rule` — moving, in blocks.
//
// The last of the engine's physics to leave, and the one everything else stands
// on: gravity adds to the speed this rule keeps, arrows set it, collision undoes
// the move it made. All three anchor their steps to `reposition`, so what this
// pins is the shape they depend on — the trait, the speed, the rewind query, and
// the scale between speeds and pixels that used to be a constant inside the
// engine.

import {describe, expect, it} from 'vitest';

import {starterFile} from '../../constants';
import {resolveRuleContents} from '../../rules/ruleReference';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

// Its `use rule`s name other rules of this project, which have to be registered
// before a module can be generated from it — the same call the editor makes.
registerDefaultProjectRules();

// Through the same resolution production uses: the starter holds a
// REFERENCE to the library's rule, not a copy of it (rules/ruleReference,
// specs/NEXT.md §2), and `projectFiles` is what resolves one everywhere
// else. What is asserted below is the rule, either way.
const source = resolveRuleContents(starterFile('motionRule').contents);
const meta = parseRuleMeta('rules/motion', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/motion.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(starterFile('motionRule').name).toBe('motion.rule');
    expect(source).not.toContain('world-lab');
  });

  it('gives an actor a speed, on a trait that can be positioned', () => {
    expect(meta.name).toBe('Physics');
    expect(meta.ability).toBe('Has Physics');
    expect(meta.requires).toEqual(['Space']);
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'CanMoveTrait',
    ]);
    expect(meta.traits[0].requires).toEqual(['Space#PositionalTrait']);
    const velocity = meta.properties.find(p => p.id === 'velocity');
    expect(velocity?.scope).toBe('actor');
    expect(velocity?.type).toBe('vector');
  });

  it('gets the scale from the engine, not from a property of its own', () => {
    // Speeds are in units and positions are in pixels; `pixels per unit` is the
    // number between them. It is a fact about the coordinate system the renderer
    // draws in — an Engine block — rather than a knob this rule owns, so the two
    // places that convert both reach for the same one.
    //
    // The list is short on purpose and this test is what keeps it short.
    // Every entry is a fact about a BODY rather than a setting on this rule,
    // and each is here because some other rule has to be able to ask it of
    // anything that moves without depending on whoever answers:
    //
    //   velocity       how fast it is going
    //   held still     whether something is holding it there ON PURPOSE, which
    //                  a wall and a teleport pad look identical without
    //   ignores walls  whether solid bodies stop it — the mover's fact, not
    //                  the wall's, and a mover need not elect `Solid` at all
    //   corner reach   how far off a corner may be and still be slipped round,
    //                  which is the mover's fact for the same reason
    //   position before
    //                  where it stood at the top of the frame — RECORDED here
    //                  by this rule's own `sense` step, so that Solid, Gravity
    //                  and Climbing read a fact rather than working backwards
    //                  from a velocity that may not be what moved it
    //
    // `ignores walls` and `corner reach` are read by `rules/solid` alone and
    // live here rather than there because `Solid Bodies` declares exactly one
    // trait on purpose: the one that says what a WALL is.
    expect(meta.properties.map(p => p.id)).toEqual([
      'velocity',
      'held_still',
      'ignores_walls',
      'corner_reach',
      'position_before',
    ]);
    expect(source).toContain('world_pixels_per_unit');
  });

  it('offers the shove, and keeps the record the other rules read', () => {
    // `apply force` is on the trait, so it is asked OF an actor. `position
    // before` used to be a query beside it — `⟨actor⟩ position before
    // ⟨seconds⟩`, answered as position less velocity times seconds — and is a
    // property now, because there is nothing left to compute: the rule writes
    // it down at the top of the frame and the answer is a fact about the
    // frame rather than a guess from the speed. Read-only, since a project
    // writing to it would be writing history.
    const force = meta.actions.find(a => a.id === 'apply_force');
    expect(force?.scope).toBe('actor');
    expect(meta.queries.map(q => q.id)).not.toContain('position_before');
    const before = meta.properties.find(p => p.id === 'position_before');
    expect(before?.scope).toBe('actor');
    expect(before?.type).toBe('point');
    expect(before?.readonly).toBe(true);
  });

  it('is the moment velocity becomes position, and nothing anchors to it', () => {
    // Four rules used to name this step to place themselves around it, so its
    // NAME was load-bearing — an anchor is `<RuleName>#<stepId>`, and renaming
    // it broke them. They each name a phase now, and this one names `move`, so
    // the name is a label again.
    const step = meta.steps.find(s => s.id === 'reposition');
    expect(step?.order.kind).toBe('phase');
    expect(step?.order.phase).toBe('move');
    expect(module_).toContain('rule.addStepIn("reposition", "move"');
  });

  it('writes down where every mover is before anything moves it', () => {
    // The record behind `position before`, in `sense` — the first moment —
    // and it has to be that early: `push` is where a teleport pad sets a
    // traveler down, and a record taken after that would say the traveler
    // had always stood at the far pad. The rule's own step rather than the
    // trait's, because `sense` is a moment of the WORLD and a trait's step may
    // only name the moments its subject takes part in (engine/core/phases).
    const step = meta.steps.find(s => s.id === 'note_where_each_body_starts');
    expect(step?.order.kind).toBe('phase');
    expect(step?.order.phase).toBe('sense');
    expect(step?.scope).toBe('world');
  });

  it('explains each block it defines', () => {
    for (const member of [...meta.queries, ...meta.actions]) {
      expect(member.description, member.name).toMatch(/\w+ \w+/);
    }
  });
});

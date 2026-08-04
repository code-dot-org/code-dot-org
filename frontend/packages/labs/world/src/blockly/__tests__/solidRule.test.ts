// The default project's `rules/solid.rule` — impenetrability, in blocks.
//
// The RESPONDING half: what measures overlap is `rules/collisions.rule` now
// (specs/COLLISION.md), and this reads what that wrote. What is left here is
// the Solid trait, the geometry of pushing one body out of another, and the
// step that walks the movers — ordered after `find`, so it acts on contacts
// that are this tick's.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

// Its `use rule`s name other rules of this project, which have to be registered
// before a module can be generated from it — the same call the editor makes.
registerDefaultProjectRules();

const source = DEFAULT_PROJECT.source.files.solidRule.contents;
const meta = parseRuleMeta('rules/solid', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/solid.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(DEFAULT_PROJECT.source.files.solidRule.name).toBe('solid.rule');
    expect(source).not.toContain('world-lab');
  });

  it('declares only the trait that says "you cannot pass"', () => {
    // A Solid blocks every side; being able to collide at all is Contacts'
    // (every actor with a box has that, whether or not anything pushes it), and
    // gravity's "Acts as Ground" is a surface you may pass up through. A tile
    // carries several of these, and they were never the same thing.
    expect(meta.name).toBe('Solid Bodies');
    expect(meta.ability).toBe('Has Solid Bodies');
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'SolidTrait',
    ]);
    expect(meta.traits[0].requires).toEqual(['Collisions#CanCollideTrait']);
  });

  it('is written against Contacts, and says so', () => {
    expect(meta.requires).toEqual(['Physics', 'Collisions']);
    expect(module_).toContain('from "rules/collisions"');
    expect(module_).not.toContain('rules/solid');
  });

  it('resolves one pair at a time, one axis at a time', () => {
    // The decomposition that keeps the step readable — the step loops, these do
    // the geometry for a single body against a single solid — and the split by
    // AXIS, which is what stops a jump sticking to a wall: the caller decides
    // which axis a pass resolves, rather than each pair deciding for itself.
    const [sideways, upOrDown] = meta.actions;

    expect(meta.actions).toHaveLength(2);
    expect(sideways.name).toContain('sideways');
    expect(upOrDown.name).toContain('up or down');
    for (const push of meta.actions) {
      expect(push.params.map(param => param.type)).toEqual([
        'actor',
        'actor',
        'number',
      ]);
    }
  });

  it('explains each block it defines', () => {
    // The tooltip a learner gets when they hover the block in the toolbox. A
    // member with none has a tooltip that repeats its name back at them.
    for (const member of [...meta.queries, ...meta.actions]) {
      expect(member.description, member.name).toMatch(/\w+ \w+/);
    }
  });

  it('takes the response as numbers on the solid, defaulting to a dead stop', () => {
    // The trampoline is bouncy and the ice is slippery — properties of the
    // SOLID, not of whatever hits it (specs/COLLISION.md). They sit on this
    // rule's own trait, so every solid has them and the push actions need no
    // "if it has trait" guard; and 0 and 0 are what the rule did before there
    // were numbers for it.
    const numbers = meta.properties.filter(
      property => property.ownerTraitId === 'Solid',
    );

    expect(numbers.map(property => property.id)).toEqual([
      'bounciness',
      'friction',
    ]);
    for (const property of numbers) {
      expect(property.type).toBe('number');
      expect(property.default).toBe(0);
      expect(property.scope).toBe('actor');
    }
  });

  it('keeps both numbers between 0 and 1', () => {
    // Above one, bounciness hands back more speed than arrived — energy from
    // nowhere, every bounce; friction runs the tangent backwards. Below zero,
    // both do the opposite. Neither is a thing a learner meant to ask for, so
    // the two reads go through a query that says so once, by name.
    const clamp = meta.queries.find(
      query => query.ref.exportName === 'KeptBetween0And1Query',
    );

    expect(clamp?.returns).toBe('number');
    expect(clamp?.params.map(param => param.type)).toEqual(['number']);
    // Four reads: two properties, two axes, every one of them kept in range.
    expect(
      (source.match(/world_query_SolidBodies_KeptBetween0And1Query/g) ?? [])
        .length,
    ).toBe(4);
  });

  it('brakes by the same amount however often the world ticks', () => {
    // Friction is a fraction lost per SECOND, raised to the length of this
    // frame — the unit gravity's strength already uses. Multiplying it in flat,
    // once per contact frame, made the same number a different brake at a
    // different frame rate.
    const powers = (source.match(/"OP": "POWER"/g) ?? []).length;

    expect(powers).toBe(2);
    expect(source).toContain('colFrame2');
  });

  it('reads them off the solid it is pushing out of, on both axes', () => {
    // Both passes: what goes INTO the surface is turned around by bounciness,
    // what runs ALONG it is slowed by friction. A pass that read them off the
    // moving body would be a different rule (and a different sentence).
    const uses = (name: string) =>
      (
        source.match(
          new RegExp(`world_get_SolidBodies_${name}Property`, 'g'),
        ) ?? []
      ).length;

    expect(uses('Bounciness')).toBe(2);
    expect(uses('Friction')).toBe(2);
  });

  it('runs on contacts that are this tick’s', () => {
    // The per-tick chain: velocity → move → find who is touching → push them
    // apart → land. Anchoring on `find` rather than on `reposition` is what
    // stops the two from being unordered relative to each other.
    const [step] = meta.steps;
    expect(step.id).toBe('resolve');
    expect(step.order.kind).toBe('after');
    expect(step.order.anchor?.ownerRef.ruleName).toBe('Collisions');
    expect(step.order.anchor?.stepId).toBe('find');
  });
});

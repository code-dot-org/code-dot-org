// The default project's `rules/collisions.rule` — who is touching whom, and
// nothing about what to do next (specs/COLLISION.md).
//
// The measuring half of what used to be one collision rule. It owns the box and
// writes each actor's `contacts` once a tick; `rules/solid.rule` reads them
// and pushes bodies apart, and anything else that wants to react — a bouncy
// rule, a trigger, gravity noticing a landing — reads the same list rather than
// working out overlaps again.

import {describe, expect, it} from 'vitest';

import {starterFile} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

registerDefaultProjectRules();

const source = starterFile('collisionsRule').contents;
const meta = parseRuleMeta('rules/collisions', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/collisions.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(starterFile('collisionsRule').name).toBe('collisions.rule');
    expect(source).not.toContain('world-lab');
  });

  it('owns the box: the trait, its size, and the two questions about it', () => {
    expect(meta.name).toBe('Collisions');
    expect(meta.ability).toBe('Notices Collisions');
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'CanCollideTrait',
    ]);
    expect(meta.queries.map(query => query.ref.exportName)).toEqual([
      'CollisionSizeOfQuery',
      'IsTouchingQuery',
    ]);
    const size = meta.properties.find(property => property.id === 'size');
    expect(size?.type).toBe('point');
    expect(size?.default).toEqual({x: 0, y: 0});
  });

  it('writes what it found into an actors property', () => {
    // The storage decision (specs/COLLISION.md): per-actor, per-frame,
    // relational state, in the one place the language already has for per-actor
    // state. Read-only, so the rule that fills it owns it and everyone else
    // reads.
    const contacts = meta.properties.find(
      property => property.id === 'contacts',
    );

    expect(contacts?.type).toBe('actors');
    expect(contacts?.scope).toBe('actor');
    expect(contacts?.readonly).toBe(true);
    expect(contacts?.default).toEqual([]);
    expect(module_).toContain(
      'export const ContactsProperty = CanCollideTrait.addProperty("contacts", "actors", []',
    );
  });

  it('finds them after Motion has moved everything', () => {
    // Overlaps are a fact about where things ARE, so this runs on the positions
    // Motion just integrated — and before anything that responds to them.
    const [step] = meta.steps;

    expect(meta.steps).toHaveLength(1);
    expect(step.id).toBe('find');
    expect(step.order.kind).toBe('phase');
    expect(step.order.phase).toBe('touch');
  });

  it('pushes nothing and changes no velocity', () => {
    // The whole point of the split: this rule reports. If it ever sets a
    // position or a velocity, the response has leaked back into detection.
    expect(module_).not.toContain('PositionProperty');
    expect(module_).not.toContain('VelocityProperty');
    expect(meta.actions).toEqual([]);
  });
});

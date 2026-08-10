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
    const step = meta.steps.find(each => each.id === 'find')!;

    expect(step.order.kind).toBe('phase');
    expect(step.order.phase).toBe('touch');
  });

  it('turns the contact set into moments, a phase later', () => {
    // Detection and notification are separate steps in separate moments, and
    // the gap between them is where `settle` pushes bodies apart. Raising the
    // event in `touch` would fire it while the actors were still overlapping,
    // so a handler setting a velocity would have it overwritten by the push-out
    // — which is exactly what steering a ball off a paddle needs to survive.
    const step = meta.steps.find(each => each.id === 'notice_contacts')!;

    expect(step).toBeDefined();
    expect(step.order).toEqual({kind: 'phase', phase: 'react'});
    expect(meta.steps).toHaveLength(2);
  });

  it('raises the two edges of an overlap', () => {
    // `contacts` and `is touching` are polls: true every frame an overlap
    // lasts. A brick that scores while touched scores sixty times. These are
    // the same edge pair `rules/input` and Gravity use.
    const said = meta.events.map(event => event.name).join(' | ');

    expect(said).toMatch(/starts touching/i);
    expect(said).toMatch(/stops touching/i);
    // On the trait, so they are raised FOR an actor and the hat has a subject.
    expect(meta.events.every(event => event.scope === 'actor')).toBe(true);
  });

  it('carries the actor it is about', () => {
    // Read in a handler with `event value`, which is untyped precisely so it
    // can hold whatever an event carries and still plug into an actor socket.
    for (const event of meta.events) {
      const carried = (event.parts ?? []).filter(part => part.kind === 'param');
      expect(
        carried.map(part => part.type),
        event.id,
      ).toEqual(['actor']);
    }
  });

  it('raises one event per contact, not one per frame', () => {
    // The distinction that makes "starts touching" mean what it says. An
    // earlier draft raised one event per FRAME in which anything new arrived,
    // so a ball clipping two bricks at once started touching twice and was
    // told once. Emitting inside the loop is what fixes it — the same shape
    // `rules/input` uses to raise its key event once per key.
    const emits = source.split('world_emit_').length - 1;
    const loops = source.split('world_for_each').length - 1;

    expect(emits).toBe(2);
    // Four loops: two to work out the sets, two to announce them one at a time.
    expect(loops).toBeGreaterThanOrEqual(4);
  });

  it('keeps the lists, which answer what the events cannot', () => {
    // An event is a moment, gone by the time anything else looks. The lists say
    // what is true NOW, pollable from a step the way `contacts` is.
    const ids = meta.properties.map(property => property.id);

    expect(ids).toContain('newly_touching');
    expect(ids).toContain('no_longer_touching');
  });

  it('pushes nothing and changes no velocity', () => {
    // The whole point of the split: this rule reports. If it ever sets a
    // position or a velocity, the response has leaked back into detection.
    expect(module_).not.toContain('PositionProperty');
    expect(module_).not.toContain('VelocityProperty');
    expect(meta.actions).toEqual([]);
  });
});

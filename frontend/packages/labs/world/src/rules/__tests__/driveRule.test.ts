// "Drives with Arrow Keys" — turn where you point, thrust where you face.
//
// The second reading of the arrow keys, and what these pin is the difference
// from the first: it turns rather than moves, it adds to velocity rather than
// setting it, and it never slows anything down.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {arrowsRule} from '../stock/arrows';
import {driveRule} from '../stock/drive';

const meta = parseRuleMeta('rules/drive', driveRule)!;

describe('rules/drive.rule', () => {
  it('is one trait an actor elects', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Driven_by_Arrow_Keys',
    ]);
    expect(meta.traits[0].subject).toBe('actor');
  });

  it('decides in `decide`, where the other arrow rule does', () => {
    // Intent becoming motion, before anything pushes and before Physics turns
    // velocity into position.
    expect(meta.steps).toHaveLength(1);
    expect(meta.steps[0].order).toEqual({kind: 'phase', phase: 'decide'});
    expect(parseRuleMeta('rules/arrows', arrowsRule)!.steps[0].order).toEqual({
      kind: 'phase',
      phase: 'decide',
    });
  });

  it('offers a turn rate and a thrust, both per second', () => {
    const names = meta.properties.map(property => property.id);
    expect(names).toContain('turn_speed');
    expect(names).toContain('thrust');
  });

  it('turns the actor rather than moving it', () => {
    // The whole difference from "Moves with Arrow Keys": left and right write
    // ROTATION. Nothing in the other rule touches it.
    expect(driveRule).toContain('world_set_Space_RotationProperty');
    expect(arrowsRule).not.toContain('world_set_Space_RotationProperty');
  });

  it('adds to velocity rather than setting it, so it coasts', () => {
    // Letting go leaves the actor moving. `arrows` sets the sideways speed
    // outright, which is why letting go there stops you.
    expect(driveRule).toContain('world_vector_math');
    expect(driveRule).toContain('world_set_Physics_VelocityProperty');
  });

  it('is frame-rate independent', () => {
    // A turn rate that is really degrees-per-FRAME spins twice as fast on a
    // 120Hz screen. Both halves are multiplied by the frame time.
    expect(driveRule).toContain('world_step_delta');
  });

  it('offers grip, and leaves it off', () => {
    // The other half of the car/ship difference, and a knob here rather than a
    // rule of its own because it is about how facing relates to travel, which
    // is this rule's whole subject.
    //
    // Zero by default is load-bearing, not a taste: this rule shipped as the
    // ship, and a saved project that never heard of grip has to drive exactly
    // as it did.
    const grip = meta.properties.find(property => property.id === 'grip');

    expect(grip).toBeDefined();
    expect(grip!.default).toBe(0);
  });

  it('measures travel along the nose with a sign, so reverse survives', () => {
    // A plain speed has no sign to say it was going backwards, so grip built on
    // one would snap a reversing car round to face its direction of travel.
    // Projecting velocity onto the facing direction keeps the sign — and
    // reports zero for a pure sideways slide, which is the part grip eats.
    const said = meta.queries.map(query => query.name).join(' ');

    expect(said).toMatch(/going forward/i);
  });

  it('caps the grip pull at the whole slide', () => {
    // Per second, like everything else here — but a grip strong enough to take
    // more than all of the sideways motion in one frame would overshoot and
    // swing back the other way, every frame, forever.
    expect(driveRule).toContain('logic_ternary');
    expect(driveRule).toContain('"OP": "GT"');
  });

  it('exposes "the way … is facing", which a bullet needs too', () => {
    // On the rule rather than buried in the step: spawning something in front
    // of a ship is the next thing anyone asks for.
    const said = meta.queries.map(query => query.name).join(' ');
    expect(said).toMatch(/facing/i);
  });
});

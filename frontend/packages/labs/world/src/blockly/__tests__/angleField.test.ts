// The `angle` type, and the dial that comes with it.
//
// An angle is a number — the engine sets, reads and tweens one exactly as it
// does any other — and the whole of the difference is what a call site starts
// with. So what these pin is that difference: the type is real, the sockets
// that take one are seeded with the dial rather than a bare number, and the
// dial's own arithmetic wraps the way a circle does.
//
// The dial itself cannot be seen from here: jsdom lays out no SVG.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette, propertyShape} from '../domainBlocks';
import {normalizeAngle} from '../fields/AngleEditor';
import {PROPERTY_TYPES} from '../ruleMeta';
import {paramFlavour} from '../typedVariables';
import {shadowsFor} from '../valueShadow';

describe('an angle', () => {
  it('is a whole number of degrees, wrapped rather than clamped', () => {
    // 370° and −350° are the same direction as 10°, and a dial that stopped at
    // 359 would have a seam in it.
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(90.4)).toBe(90);
    expect(normalizeAngle(370)).toBe(10);
    expect(normalizeAngle(-350)).toBe(10);
    expect(normalizeAngle(-90)).toBe(270);
    expect(normalizeAngle(720)).toBe(0);
    expect(normalizeAngle(Number.NaN)).toBe(0);
  });

  it('is a type a rule may declare', () => {
    expect(PROPERTY_TYPES.has('angle')).toBe(true);
  });

  it('is read with the number getter, being a number', () => {
    // The same bargain `position` makes with `vector`: the type says how the
    // call site is drawn, and what arrives is a number either way.
    expect(paramFlavour('angle')).toBe(paramFlavour('number'));
  });

  it('starts a socket with the dial rather than a bare number', () => {
    const {set, get} = propertyShape({
      name: 'heading',
      type: 'angle',
      default: 90,
      scope: 'world',
    });
    expect(set.shadows).toEqual([
      {name: 'VALUE', shadow: {type: 'world_angle', fields: {ANGLE: 90}}},
    ]);
    // …and reports a plain Number, so it plugs in wherever one does.
    expect(get.output).toBe('Number');
    expect(get.style).toBe('math_blocks');
  });
});

describe('the blocks that take one', () => {
  const palette = () => buildDomainPalette([]).blocks;
  const named = (starts: string) =>
    palette().find(block =>
      String((block as {message0?: string}).message0 ?? '').startsWith(starts),
    ) as {type: string} | undefined;

  it('seeds an actor’s rotation and skew with it', () => {
    // Declared `angle` by the engine (`engine/rules/spatial`), which is the
    // only place that knows a rotation is a direction rather than a count.
    for (const label of ['set rotation of', 'set vertical skew of']) {
      const block = named(label);
      expect(block, label).toBeDefined();
      expect(shadowsFor(block!.type), label).toEqual([
        {name: 'VALUE', shadow: {type: 'world_angle', fields: {ANGLE: 0}}},
      ]);
    }
  });

  it('seeds the vector blocks that turn things', () => {
    expect(shadowsFor('world_vector_rotate')).toEqual([
      {name: 'DEGREES', shadow: {type: 'world_angle', fields: {ANGLE: 90}}},
    ]);
    expect(shadowsFor('world_vector_from_angle')).toEqual([
      {name: 'LENGTH', shadow: {type: 'math_number', fields: {NUM: 1}}},
      {name: 'DEGREES', shadow: {type: 'world_angle', fields: {ANGLE: 0}}},
    ]);
  });
});

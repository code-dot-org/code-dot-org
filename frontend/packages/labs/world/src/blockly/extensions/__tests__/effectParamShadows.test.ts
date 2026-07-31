// Which shadow an effect parameter's socket starts life with.
//
// A bounded parameter gets the slider, an unbounded one the plain number box.
// Getting this wrong is quiet in the worst way: the block still works and still
// generates the right call, the learner just never sees the range they are
// aiming inside.

import {describe, expect, it} from 'vitest';

import type {EffectParameter} from '../../../effect/model/types';
import {
  numberShadowFor,
  paramSockets,
  socketShadow,
  toParamState,
} from '../effectParamsMutator';

const parameter = (over: Partial<EffectParameter> = {}): EffectParameter => ({
  id: 'strength',
  name: 'strength',
  type: 'float',
  defaultValue: 0.02,
  ...over,
});

describe('toParamState', () => {
  it('carries the bounds an effect declares', () => {
    expect(toParamState(parameter({min: 0, max: 0.1}))).toMatchObject({
      min: 0,
      max: 0.1,
    });
  });

  it('carries neither bound when only one is declared', () => {
    // A half-open range cannot position a thumb. Treating it as no range is
    // honest; inventing the missing end is not.
    const state = toParamState(parameter({min: 0}));

    expect(state).not.toHaveProperty('min');
    expect(state).not.toHaveProperty('max');
  });

  it('omits them entirely for an unbounded parameter', () => {
    expect(toParamState(parameter())).not.toHaveProperty('min');
  });
});

describe('numberShadowFor', () => {
  it('gives a bounded parameter a slider carrying its range', () => {
    expect(
      numberShadowFor(toParamState(parameter({min: 0, max: 0.1})), 0.02),
    ).toEqual({
      type: 'world_slider',
      fields: {NUM: 0.02},
      extraState: {min: 0, max: 0.1},
    });
  });

  it('gives an unbounded parameter the plain number box', () => {
    // Not a slider with invented bounds: a slider whose ends mean nothing is a
    // worse number box, not a better one.
    expect(numberShadowFor(toParamState(parameter()), 0.02)).toEqual({
      type: 'math_number',
      fields: {NUM: 0.02},
    });
  });

  it('pins an int parameter to whole numbers', () => {
    const shadow = numberShadowFor(
      toParamState(parameter({type: 'int', defaultValue: 8, min: 2, max: 128})),
      8,
    );

    expect(shadow.extraState).toEqual({min: 2, max: 128, precision: 1});
  });

  it('leaves a float to derive its own step from the range', () => {
    // `precision` absent means `sliderRange` computes one with `niceStep`;
    // hard-coding a step per parameter type would be wrong for both 0–0.1 and
    // 0–12.
    const shadow = numberShadowFor(
      toParamState(parameter({min: 0, max: 12})),
      3,
    );

    expect(shadow.extraState).not.toHaveProperty('precision');
  });

  it('passes the value through untouched', () => {
    // The socket's starting value is the parameter's own default, whichever
    // shadow it lands in.
    expect(
      numberShadowFor(toParamState(parameter({min: 0, max: 1})), 0.75),
    ).toMatchObject({fields: {NUM: 0.75}});
  });
});

describe('paramSockets', () => {
  // One definition, read by the mutator that builds the sockets and by the
  // generator that reads them back. When these two disagreed they were separate
  // lists; a change here that breaks one now breaks both, visibly.

  it('gives a scalar a single unlabelled socket', () => {
    expect(paramSockets('float')).toEqual([{kind: 'number'}]);
    expect(paramSockets('int')).toEqual([{kind: 'number'}]);
    expect(paramSockets('bool')).toEqual([{kind: 'boolean'}]);
  });

  it('keeps vec2 a pair of numbers', () => {
    // A vec2 is a direction or an offset. Handing it a color picker would be
    // a category error the learner cannot undo.
    expect(paramSockets('vec2')).toEqual([
      {kind: 'number', label: 'x'},
      {kind: 'number', label: 'y'},
    ]);
  });

  it('gives vec3 one color socket, not three number boxes', () => {
    // Nobody picks a color by typing three floats, and "0.53, 0.27, 0.08"
    // says nothing about what it looks like.
    expect(paramSockets('vec3')).toEqual([{kind: 'color'}]);
  });

  it('gives vec4 the same single color socket', () => {
    // Alpha rides in the value rather than getting a socket of its own: the
    // picker's shadow means opaque, and reaching the fourth channel means
    // swapping in the `r g b a` block, which has a slider for it.
    expect(paramSockets('vec4')).toEqual([{kind: 'color'}]);
  });
});

describe('socketShadow, for a color socket', () => {
  const colorShadow = (defaultValue: number[]) =>
    socketShadow(
      toParamState(parameter({type: 'vec3', defaultValue})),
      {kind: 'color'},
      0,
    );

  it('seeds the picker with the effect’s declared default', () => {
    // Tint declares a salmon; the socket must open showing that, not the
    // picker's own built-in red.
    expect(colorShadow([1, 0.6, 0.6])).toEqual({
      type: 'colour_picker',
      fields: {COLOUR: '#ff9999'},
    });
  });

  it('uses the picker’s own field name, not our spelling of it', () => {
    // `COLOUR` is Blockly's field name. Writing `COLOR` is SILENT — the shadow
    // still appears, holding the picker's default red, and nothing anywhere
    // says the declared default was dropped. Exactly what a spelling sweep did.
    expect(Object.keys(colorShadow([0, 0, 1]).fields ?? {})).toEqual([
      'COLOUR',
    ]);
  });

  it('uses the block type the color socket accepts', () => {
    // `colour_picker` is Blockly's type id, and the socket checks for what it
    // outputs. Renaming either half leaves the socket unfillable.
    expect(colorShadow([0, 0, 0]).type).toBe('colour_picker');
  });
});

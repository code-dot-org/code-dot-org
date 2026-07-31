// Which shadow an effect parameter's socket starts life with.
//
// A bounded parameter gets the slider, an unbounded one the plain number box.
// Getting this wrong is quiet in the worst way: the block still works and still
// generates the right call, the learner just never sees the range they are
// aiming inside.

import {describe, expect, it} from 'vitest';

import type {EffectParameter} from '../../../effect/model/types';
import {numberShadowFor, toParamState} from '../effectParamsMutator';

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

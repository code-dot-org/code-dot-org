import {describe, expect, it} from 'vitest';

import {
  coerce,
  defaultParameterValue,
  formatFloat,
  formatLiteral,
  isWholeNumberParameter,
  parameterValueType,
  widen,
} from '../valueTypes';

describe('formatFloat', () => {
  it('always writes a decimal point, because GLSL ES 1.00 has no int-to-float', () => {
    expect(formatFloat(1)).toBe('1.0');
    expect(formatFloat(0)).toBe('0.0');
    expect(formatFloat(-3)).toBe('-3.0');
  });

  it('keeps fractional values as written', () => {
    expect(formatFloat(0.25)).toBe('0.25');
  });
});

describe('formatLiteral', () => {
  it('broadcasts a single component across a vector', () => {
    expect(formatLiteral(0.5, 'vec3')).toBe('vec3(0.5, 0.5, 0.5)');
  });

  it('pads a short component list with zeroes', () => {
    expect(formatLiteral([1, 2], 'vec4')).toBe('vec4(1.0, 2.0, 0.0, 0.0)');
  });
});

describe('widen', () => {
  it('promotes a scalar against a vector, as GLSL does', () => {
    expect(widen('float', 'vec3')).toBe('vec3');
    expect(widen('vec3', 'float')).toBe('vec3');
  });

  it('has no promotion between differently sized vectors', () => {
    expect(widen('vec2', 'vec3')).toBeNull();
  });

  it('has no promotion involving a texture', () => {
    expect(widen('sampler2D', 'float')).toBeNull();
  });
});

describe('coerce', () => {
  it('broadcasts a scalar into a vector', () => {
    expect(coerce('x', 'float', 'vec2')).toBe('vec2(x)');
  });

  it('leaves a matching type alone', () => {
    expect(coerce('x', 'vec4', 'vec4')).toBe('x');
  });

  it('refuses to invent or drop components', () => {
    expect(coerce('x', 'vec3', 'vec4')).toBeNull();
    expect(coerce('x', 'vec4', 'vec3')).toBeNull();
  });
});

describe('parameter types', () => {
  it('makes bool and int float uniforms, so they stay multipliable', () => {
    // A switch you cannot multiply by is not much of a switch: `uniform bool`
    // would need a conversion at every use.
    expect(parameterValueType('bool')).toBe('float');
    expect(parameterValueType('int')).toBe('float');
    expect(parameterValueType('vec3')).toBe('vec3');
  });

  it('starts a switch on, so wiring one in does not turn the effect off', () => {
    expect(defaultParameterValue('bool')).toBe(1);
    expect(defaultParameterValue('int')).toBe(0);
    expect(defaultParameterValue('float')).toBe(0);
    expect(defaultParameterValue('vec4')).toEqual([0, 0, 0, 1]);
  });

  it('knows which knobs are held to whole numbers', () => {
    expect(isWholeNumberParameter('int')).toBe(true);
    expect(isWholeNumberParameter('bool')).toBe(true);
    expect(isWholeNumberParameter('float')).toBe(false);
  });
});

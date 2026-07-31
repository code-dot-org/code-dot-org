import {describe, expect, it} from 'vitest';

import {
  canSwizzle,
  componentLabel,
  defaultSwizzle,
  deliveredType,
  swizzleLabel,
  swizzlePlan,
} from '../swizzle';

/** The letters a plan offers, for readable assertions. */
function letters(sourceType: 'vec2' | 'vec3' | 'vec4', targetType: string) {
  return swizzlePlan(
    sourceType,
    targetType as 'float' | 'vec2' | 'vec3',
  )?.available.map(option => option.label);
}

describe('swizzlePlan', () => {
  it('asks for one component when a color feeds a number port', () => {
    const plan = swizzlePlan('vec4', 'float');

    expect(plan?.componentsNeeded).toBe(1);
    expect(plan?.available).toEqual([
      {swizzle: 'x', label: 'R'},
      {swizzle: 'y', label: 'G'},
      {swizzle: 'z', label: 'B'},
      {swizzle: 'w', label: 'A'},
    ]);
  });

  it('asks for two components when a color feeds a 2D port', () => {
    const plan = swizzlePlan('vec4', 'vec2');

    expect(plan?.componentsNeeded).toBe(2);
    // All four are still on offer for each slot: `.bg` is as valid as `.rg`.
    expect(plan?.available).toHaveLength(4);
  });

  it('asks for three when a color feeds an RGB port', () => {
    expect(swizzlePlan('vec4', 'vec3')?.componentsNeeded).toBe(3);
  });

  it('offers only the components a narrower source actually has', () => {
    expect(letters('vec3', 'vec2')).toEqual(['X', 'Y', 'Z']);
    expect(letters('vec2', 'float')).toEqual(['X', 'Y']);
  });

  it('has nothing to do when the widths already match', () => {
    expect(swizzlePlan('float', 'float')).toBeNull();
    expect(swizzlePlan('vec4', 'vec4')).toBeNull();
  });

  it('refuses widening — components cannot be invented or repeated into one', () => {
    expect(swizzlePlan('vec2', 'vec3')).toBeNull();
    expect(swizzlePlan('float', 'vec2')).toBeNull();
  });

  it('refuses a texture or a generic port', () => {
    expect(swizzlePlan('sampler2D', 'float')).toBeNull();
    expect(swizzlePlan('vec4', 'sampler2D')).toBeNull();
    expect(swizzlePlan('generic', 'float')).toBeNull();
    expect(swizzlePlan('vec4', 'generic')).toBeNull();
  });

  it('agrees with canSwizzle', () => {
    expect(canSwizzle('vec4', 'float')).toBe(true);
    expect(canSwizzle('vec4', 'vec2')).toBe(true);
    expect(canSwizzle('vec2', 'vec3')).toBe(false);
  });
});

describe('defaultSwizzle', () => {
  it('is the natural prefix, for when there is nowhere to ask', () => {
    expect(defaultSwizzle(swizzlePlan('vec4', 'vec2')!)).toBe('xy');
    expect(defaultSwizzle(swizzlePlan('vec4', 'float')!)).toBe('x');
  });
});

describe('component labels', () => {
  it('spells a vec4 as RGBA and anything narrower as XYZW', () => {
    expect(componentLabel('vec4', 'x')).toBe('R');
    expect(componentLabel('vec4', 'w')).toBe('A');
    expect(componentLabel('vec2', 'y')).toBe('Y');
    expect(componentLabel('vec3', 'z')).toBe('Z');
  });

  it('reads a multi-component swizzle as one badge, in order', () => {
    expect(swizzleLabel('vec4', 'xy')).toBe('RG');
    expect(swizzleLabel('vec4', 'zy')).toBe('BG');
    expect(swizzleLabel('vec3', 'zx')).toBe('ZX');
  });
});

describe('deliveredType', () => {
  it('is what the wire carries after narrowing, not before', () => {
    expect(deliveredType('vec4', 'x')).toBe('float');
    expect(deliveredType('vec4', 'xy')).toBe('vec2');
    expect(deliveredType('vec4', 'xyz')).toBe('vec3');
    expect(deliveredType('vec4', undefined)).toBe('vec4');
  });
});

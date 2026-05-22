/**
 * Tests for the unitName utility.
 *
 * Covers the four canonical examples from the spec plus an additional
 * single-segment path to confirm no regression on paths without a parent.
 */

import {describe, expect, it} from 'vitest';

import {unitName} from '../unitName';

describe('unitName', () => {
  it("converts '/lessons/unit3' to 'Unit3' (no hyphen, just title-case)", () => {
    expect(unitName('/lessons/unit3')).toBe('Unit3');
  });

  it("converts '/foo-bar' to 'Foo Bar'", () => {
    expect(unitName('/foo-bar')).toBe('Foo Bar');
  });

  it("converts '/unit-2-variables' to 'Unit 2 Variables'", () => {
    expect(unitName('/unit-2-variables')).toBe('Unit 2 Variables');
  });

  it("returns 'More Notebooks' for an empty string", () => {
    expect(unitName('')).toBe('More Notebooks');
  });

  it("converts a single-segment path '/science' to 'Science'", () => {
    expect(unitName('/science')).toBe('Science');
  });
});

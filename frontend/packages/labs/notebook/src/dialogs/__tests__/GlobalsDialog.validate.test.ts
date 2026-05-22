/**
 * Tests for the IDENTIFIER_PATTERN exported from GlobalsDialog.
 *
 * The pattern enforces valid Python / C-style identifier syntax:
 * starts with a letter or underscore, followed by letters, digits, or
 * underscores.  These constraints match the {{VAR}} substitution regex
 * used at runtime so authoring validation and runtime substitution stay
 * in sync.
 */

import {describe, expect, it} from 'vitest';
import {IDENTIFIER_PATTERN} from '../GlobalsDialog';

describe('IDENTIFIER_PATTERN', () => {
  it('accepts all-uppercase ASCII identifiers', () => {
    expect(IDENTIFIER_PATTERN.test('TEMPERATURE')).toBe(true);
  });

  it('accepts lowercase identifiers with underscores', () => {
    expect(IDENTIFIER_PATTERN.test('my_var')).toBe(true);
  });

  it('rejects identifiers that start with a digit', () => {
    expect(IDENTIFIER_PATTERN.test('123abc')).toBe(false);
  });

  it('rejects the empty string', () => {
    expect(IDENTIFIER_PATTERN.test('')).toBe(false);
  });

  it('rejects identifiers containing a space', () => {
    expect(IDENTIFIER_PATTERN.test('hello world')).toBe(false);
  });

  it('rejects identifiers containing a hyphen', () => {
    expect(IDENTIFIER_PATTERN.test('hello-world')).toBe(false);
  });

  it('accepts identifiers beginning with an underscore', () => {
    expect(IDENTIFIER_PATTERN.test('_ok')).toBe(true);
  });
});

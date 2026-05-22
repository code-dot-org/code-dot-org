import { describe, expect, it } from 'vitest';

import { parseParameters } from '../parameterParser';

describe('parseParameters', () => {
  it('parses a bare integer value annotation', () => {
    const result = parseParameters(['AGE = 51 #@param']);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ name: 'AGE', value: 51, type: 'value' });
  });

  it('parses a quoted string value annotation', () => {
    const result = parseParameters(['NAME = "Simon" #@param']);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ name: 'NAME', value: 'Simon', type: 'value' });
  });

  it('parses a slider annotation with numeric config fields', () => {
    const result = parseParameters([
      'TEMPERATURE = 1 #@param {type:"slider", min:0, max:2, step:0.1}',
    ]);
    expect(result).toHaveLength(1);
    const param = result[0];
    expect(param.type).toBe('slider');
    expect(param.config.min).toBe(0);
    expect(param.config.max).toBe(2);
    expect(param.config.step).toBeCloseTo(0.1);
  });

  it('parses a dropdown annotation from a bracket list', () => {
    const result = parseParameters([
      'SIZE = "small" #@param ["small", "medium", "large"]',
    ]);
    expect(result).toHaveLength(1);
    const param = result[0];
    expect(param.type).toBe('dropdown');
    expect(param.config.options).toEqual(['small', 'medium', 'large']);
  });

  it('parses a boolean annotation with explicit type config', () => {
    const result = parseParameters(['IS_ENABLED = True #@param {type:"boolean"}']);
    expect(result).toHaveLength(1);
    const param = result[0];
    expect(param.type).toBe('boolean');
    expect(param.value).toBe(true);
  });

  it('extracts the prompt field from a JSON-like config block', () => {
    const result = parseParameters([
      'TEMP = 0.5 #@param {type:"slider", min:0, max:1, prompt:"Try a temperature"}',
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].prompt).toBe('Try a temperature');
    expect(result[0].config.prompt).toBe('Try a temperature');
  });

  it('omits lines that have no #@param annotation', () => {
    const result = parseParameters([
      'x = 10',
      'y = 20 #@param',
      '# just a comment',
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('y');
  });

  it('returns an empty array for empty source', () => {
    expect(parseParameters([])).toEqual([]);
  });

  it('returns an empty array for undefined source', () => {
    expect(parseParameters(undefined)).toEqual([]);
  });

  it('records the correct zero-based line number', () => {
    const result = parseParameters([
      'x = 1',
      'Y = 2 #@param',
    ]);
    expect(result[0].lineNumber).toBe(1);
  });
});

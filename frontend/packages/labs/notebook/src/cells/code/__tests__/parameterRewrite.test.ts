import { describe, expect, it } from 'vitest';

import { rewriteParameter, formatPythonValue } from '../parameterRewrite';
import { parseParameters } from '../parameterParser';

describe('rewriteParameter', () => {
  it('rewrites the value on the correct line and preserves trailing newline', () => {
    const source = ['AGE = 51 #@param\n', 'NAME = "Simon" #@param\n'];
    const [ageParam] = parseParameters(source);

    const result = rewriteParameter(source, ageParam, 30);

    expect(result[0]).toBe('AGE = 30 #@param\n');
    expect(result[1]).toBe('NAME = "Simon" #@param\n');
  });

  it('preserves trailing annotation text after #@param config', () => {
    const source = [
      'TEMP = 1 #@param {type:"slider", min:0, max:2, step:0.1}\n',
    ];
    const [param] = parseParameters(source);

    const result = rewriteParameter(source, param, 1.5);

    expect(result[0]).toBe('TEMP = 1.5 #@param {type:"slider", min:0, max:2, step:0.1}\n');
  });

  it('does not modify lines other than the target parameter line', () => {
    const source = [
      'X = 1\n',
      'Y = 2 #@param\n',
      'Z = 3\n',
    ];
    const [yParam] = parseParameters(source);

    const result = rewriteParameter(source, yParam, 99);

    expect(result[0]).toBe('X = 1\n');
    expect(result[1]).toBe('Y = 99 #@param\n');
    expect(result[2]).toBe('Z = 3\n');
  });

  it('rewrites a string value with double quotes', () => {
    const source = ['SIZE = "small" #@param ["small","medium","large"]'];
    const [param] = parseParameters(source);

    const result = rewriteParameter(source, param, 'large');

    expect(result[0]).toBe('SIZE = "large" #@param ["small","medium","large"]');
  });

  it('rewrites a boolean value to a Python literal', () => {
    const source = ['FLAG = True #@param {type:"boolean"}'];
    const [param] = parseParameters(source);

    const result = rewriteParameter(source, param, false);

    expect(result[0]).toBe('FLAG = False #@param {type:"boolean"}');
  });

  it('returns source unchanged when lineNumber is out of range', () => {
    const source = ['X = 1 #@param'];
    const [param] = parseParameters(source);
    const outOfRange = { ...param, lineNumber: 99 };

    const result = rewriteParameter(source, outOfRange, 5);

    expect(result).toEqual(source);
  });
});

describe('formatPythonValue', () => {
  it('converts true to "True"', () => {
    expect(formatPythonValue(true)).toBe('True');
  });

  it('converts false to "False"', () => {
    expect(formatPythonValue(false)).toBe('False');
  });

  it('converts null to "None"', () => {
    expect(formatPythonValue(null)).toBe('None');
  });

  it('wraps a string in double quotes', () => {
    expect(formatPythonValue('hi')).toBe('"hi"');
  });

  it('converts an integer to its string representation', () => {
    expect(formatPythonValue(42)).toBe('42');
  });

  it('converts a float to its string representation', () => {
    expect(formatPythonValue(1.5)).toBe('1.5');
  });
});

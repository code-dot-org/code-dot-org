import {formatForPlayspace} from '@cdo/apps/p5lab/utils';

describe('formatForPlayspace', function () {
  it('formats large numbers in scientific notation with 2 significant digits', function () {
    expect(formatForPlayspace(1e21)).toBe('1.0e+21');
    expect(formatForPlayspace(-1e23)).toBe('-1.0e+23');
  });

  it('returns small numbers as-is but as a string', function () {
    expect(formatForPlayspace(123)).toBe('123');
    expect(formatForPlayspace(-456.789)).toBe('-456.789');
  });

  it('converts boolean values to their string representations', function () {
    expect(formatForPlayspace(true)).toBe('true');
    expect(formatForPlayspace(false)).toBe('false');
  });

  it('returns string values unchanged', function () {
    expect(formatForPlayspace('hello')).toBe('hello');
    expect(formatForPlayspace('12345')).toBe('12345');
  });

  it('converts arrays to strings', function () {
    expect(formatForPlayspace([1, 2, 3])).toBe('1,2,3');
    expect(formatForPlayspace(['a', 'b', 'c'])).toBe('a,b,c');
  });

  it('handles special number cases', function () {
    expect(formatForPlayspace(NaN)).toBe('NaN');
    expect(formatForPlayspace(Infinity)).toBe('Infinity');
    expect(formatForPlayspace(-Infinity)).toBe('-Infinity');
  });
});

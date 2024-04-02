import {formatForPlayspace} from '@cdo/apps/p5lab/utils';
import {expect} from '../../util/reconfiguredChai';

describe('formatForPlayspace', function () {
  it('formats large numbers in scientific notation with 2 significant digits', function () {
    expect(formatForPlayspace(1e21)).to.equal('1.0e+21');
    expect(formatForPlayspace(-1e23)).to.equal('-1.0e+23');
  });

  it('returns small numbers as-is but as a string', function () {
    expect(formatForPlayspace(123)).to.equal('123');
    expect(formatForPlayspace(-456.789)).to.equal('-456.789');
  });

  it('converts boolean values to their string representations', function () {
    expect(formatForPlayspace(true)).to.equal('true');
    expect(formatForPlayspace(false)).to.equal('false');
  });

  it('returns string values unchanged', function () {
    expect(formatForPlayspace('hello')).to.equal('hello');
    expect(formatForPlayspace('12345')).to.equal('12345');
  });

  it('converts arrays to strings', function () {
    expect(formatForPlayspace([1, 2, 3])).to.equal('1,2,3');
    expect(formatForPlayspace(['a', 'b', 'c'])).to.equal('a,b,c');
  });

  it('handles special number cases', function () {
    expect(formatForPlayspace(NaN)).to.equal('NaN');
    expect(formatForPlayspace(Infinity)).to.equal('Infinity');
    expect(formatForPlayspace(-Infinity)).to.equal('-Infinity');
  });
});

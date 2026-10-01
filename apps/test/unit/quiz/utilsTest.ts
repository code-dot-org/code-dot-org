import {formatChoiceLetter} from '@cdo/apps/quiz/utils';

describe('formatChoiceLetter', () => {
  it('labels the first 26 choices A through Z', () => {
    expect(formatChoiceLetter(0)).toBe('A');
    expect(formatChoiceLetter(25)).toBe('Z');
  });

  it('labels the eleventh choice K, not undefined', () => {
    // Regression: a fixed 10-letter string ('ABCDEFGHIJ') has no index 10.
    expect(formatChoiceLetter(10)).toBe('K');
  });

  it('continues past Z with double letters, unbounded', () => {
    expect(formatChoiceLetter(26)).toBe('AA');
    expect(formatChoiceLetter(27)).toBe('AB');
    expect(formatChoiceLetter(51)).toBe('AZ');
    expect(formatChoiceLetter(52)).toBe('BA');
  });
});

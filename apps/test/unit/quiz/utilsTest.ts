import {formatChoiceLetter} from '@cdo/apps/quiz/utils';

describe('formatChoiceLetter', () => {
  it('labels the first 26 choices A through Z', () => {
    expect(formatChoiceLetter(0)).toBe('A');
    expect(formatChoiceLetter(25)).toBe('Z');
  });

  it('continues past Z with double letters, unbounded', () => {
    expect(formatChoiceLetter(26)).toBe('AA');
    expect(formatChoiceLetter(27)).toBe('AB');
    expect(formatChoiceLetter(51)).toBe('AZ');
    expect(formatChoiceLetter(52)).toBe('BA');
  });
});

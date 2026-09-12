import {normalizeSectionCode} from '@cdo/apps/util/sectionCode';

describe('normalizeSectionCode', () => {
  it('removes whitespace and converts letters to uppercase', () => {
    expect(normalizeSectionCode(' abC\td\neF ')).toBe('ABCDEF');
  });

  it('preserves non-whitespace characters', () => {
    expect(normalizeSectionCode(' g-12_3 ')).toBe('G-12_3');
  });
});

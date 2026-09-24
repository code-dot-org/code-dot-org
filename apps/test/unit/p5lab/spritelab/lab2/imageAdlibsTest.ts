import {
  imageAdlibFor,
  imageAdlibId,
  ImageAdlibSet,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageAdlibs';
import {IMAGE_TYPES} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

const SETS: ImageAdlibSet[] = ['simple', 'expanded'];

describe('imageAdlibs manifest', () => {
  it('carries a combo for every image type in both sets', () => {
    IMAGE_TYPES.forEach(imageType => {
      SETS.forEach(set => {
        expect(imageAdlibFor(imageType, set)).toBeDefined();
      });
    });
  });

  it('every template slot has at least two word choices, and none dangle', () => {
    IMAGE_TYPES.forEach(imageType => {
      SETS.forEach(set => {
        const adlib = imageAdlibFor(imageType, set)!;
        const slots = [...adlib.template.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
        expect(slots.length).toBeGreaterThan(0);
        // Each slot in the template has options, and each option list has a
        // slot in the template.
        expect([...slots].sort()).toEqual(Object.keys(adlib.options).sort());
        slots.forEach(slot => {
          expect(adlib.options[slot].length).toBeGreaterThanOrEqual(2);
        });
      });
    });
  });

  it('templates end without punctuation: generateImage supplies the period', () => {
    IMAGE_TYPES.forEach(imageType => {
      SETS.forEach(set => {
        expect(imageAdlibFor(imageType, set)!.template).not.toMatch(/[.!?]$/);
      });
    });
  });

  it('names a combo by its type and set, and an object sprite by its own words', () => {
    expect(imageAdlibId('sprite', 'expanded')).toBe('sprite-expanded');
    expect(imageAdlibId('sprite', 'expanded', 'character')).toBe(
      'sprite-expanded'
    );
    expect(imageAdlibId('sprite', 'expanded', 'object')).toBe(
      'object-expanded'
    );
    expect(imageAdlibId('sprite', 'treasure', 'object')).toBe(
      'object-treasure'
    );
    // Only sprites have subjects.
    expect(imageAdlibId('background', 'simple', 'object')).toBe(
      'background-simple'
    );
  });

  it('carries object words for both default sets and the treasure set', () => {
    SETS.forEach(set => {
      expect(imageAdlibFor('sprite', set, 'object')).toBeDefined();
    });
    expect(imageAdlibFor('sprite', 'treasure', 'object')).toBeDefined();
  });
});

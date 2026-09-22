import {
  adlibChoiceIds,
  adlibSlots,
  adlibText,
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

  it('names a combo by its type and set', () => {
    expect(imageAdlibId('sprite', 'expanded')).toBe('sprite-expanded');
  });
});

describe('imageAdlibs role sets', () => {
  it('carries the sets the hoai2026-dev image levels name, by type', () => {
    expect(imageAdlibFor('sprite', 'hero')).toBeDefined();
    expect(imageAdlibFor('sprite', 'friend')).toBeDefined();
    expect(imageAdlibFor('sprite', 'treasure')).toBeDefined();
    expect(imageAdlibFor('background', 'story')).toBeDefined();
    expect(imageAdlibFor('background', 'platform')).toBeDefined();
  });

  it('gives the hero and the friend different creatures', () => {
    const creatures = (set: ImageAdlibSet) =>
      imageAdlibFor('sprite', set)!.options.creature.map(o => o.id);
    expect(creatures('hero')).not.toEqual(
      expect.arrayContaining(creatures('friend'))
    );
  });
});

describe('adlib helpers', () => {
  const adlib = {
    template: 'A {look} {treasure}',
    options: {
      treasure: [{id: 'gem', text: 'gem'}],
      look: [{id: 'shiny', text: 'shiny'}],
    },
    variantCount: 1,
  };

  it('orders slots as the sentence reads them, not as the options list', () => {
    expect(adlibSlots(adlib)).toEqual(['look', 'treasure']);
    expect(adlibChoiceIds(adlib, {treasure: 'gem', look: 'shiny'})).toEqual([
      'shiny',
      'gem',
    ]);
  });

  it('has no ids while a slot is unchosen', () => {
    expect(adlibChoiceIds(adlib, {look: 'shiny'})).toBeUndefined();
  });

  it('spells the sentence with the chosen words', () => {
    expect(adlibText(adlib, {treasure: 'gem', look: 'shiny'})).toBe(
      'A shiny gem'
    );
  });
});

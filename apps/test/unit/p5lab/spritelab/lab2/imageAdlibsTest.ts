import {
  adlibChoiceIds,
  adlibSlots,
  bodyPlanFor,
  IMAGE_ADLIB_SETS,
  imageAdlibFor,
  imageAdlibId,
  ImageAdlibSet,
  isImageAdlibSet,
  manifestBodyPlans,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageAdlibs';
import {
  BODY_PLANS,
  IMAGE_TYPES,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

const SETS: ImageAdlibSet[] = ['simple', 'expanded'];

describe('imageAdlibs manifest', () => {
  it('names its sets from its keys', () => {
    expect([...IMAGE_ADLIB_SETS].sort()).toEqual([
      'expanded',
      'friend',
      'hero',
      'platform',
      'simple',
      'story',
      'treasure',
    ]);
    expect(isImageAdlibSet('treasure')).toBe(true);
    expect(isImageAdlibSet('halloween')).toBe(false);
    expect(isImageAdlibSet(undefined)).toBe(false);
  });

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

  it('gives the animal creatures their body plan and everyone else upright', () => {
    expect(bodyPlanFor('cat')).toBe('quadruped');
    expect(bodyPlanFor('dragon')).toBe('quadruped');
    expect(bodyPlanFor('penguin')).toBe('bird');
    expect(bodyPlanFor('wizard')).toBe('upright');
    expect(bodyPlanFor(undefined)).toBe('upright');
  });
});

describe('creature body plans', () => {
  it('names only plans the prompts are written for', () => {
    const plans = manifestBodyPlans();
    expect(plans.length).toBeGreaterThan(0);
    plans.forEach(plan => {
      expect(BODY_PLANS).toContain(plan);
    });
  });
});

describe('imageAdlibs role sets', () => {
  it('carries the sets the hoai2026-dev image levels can name, by type', () => {
    expect(imageAdlibFor('sprite', 'hero')).toBeDefined();
    expect(imageAdlibFor('sprite', 'friend')).toBeDefined();
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
});

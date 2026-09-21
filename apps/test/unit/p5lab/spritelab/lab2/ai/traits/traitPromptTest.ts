import {readModelCard} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/modelCard';
import {
  availablePlaceholders,
  fillTraitPrompt,
  promptIsUsable,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/traitPrompt';

const plant = readModelCard('abc123def456', {
  name: 'Plant Health',
  selectedTrainer: 'knnClassify',
  label: {id: 'Health'},
  features: [
    {id: 'Leaf spots', values: ['none', 'few', 'many']},
    {id: 'Soil feel', values: ['dry', 'damp', 'wet']},
    {id: 'Pot size (cm)', min: 8, max: 30},
  ],
});

const TEMPLATE =
  'A houseplant with {Leaf spots} spots, in {Soil feel} soil, ' +
  'in a {Pot size (cm)} cm pot';

const complete = {
  costumeTraits: {Leafspots: 'many', Soilfeel: 'wet', Potsizecm: 14},
};

describe('fillTraitPrompt', () => {
  it('fills placeholders named the way the student sees them', () => {
    const fill = fillTraitPrompt(TEMPLATE, plant, complete);
    expect(fill.prompt).toBe(
      'A houseplant with many spots, in wet soil, in a 14 cm pot'
    );
    expect(fill.missing).toEqual([]);
    expect(fill.unknown).toEqual([]);
  });

  it('matches a placeholder regardless of case and padding', () => {
    const fill = fillTraitPrompt('{  leaf SPOTS }', plant, complete);
    expect(fill.prompt).toBe('many');
  });

  it('prefers a sprite override, like the prediction does', () => {
    const fill = fillTraitPrompt('{Leaf spots}', plant, {
      spriteTraits: {Leafspots: 'none'},
      costumeTraits: complete.costumeTraits,
    });
    expect(fill.prompt).toBe('none');
  });

  it('leaves an unset feature in the text rather than sending a hole', () => {
    const fill = fillTraitPrompt(TEMPLATE, plant, {
      costumeTraits: {Leafspots: 'few'},
    });
    expect(fill.prompt).toContain('{Soil feel}');
    expect(fill.missing).toEqual(['Soil feel', 'Pot size (cm)']);
    expect(promptIsUsable(fill)).toBe(false);
  });

  it('reports a placeholder the model does not have', () => {
    const fill = fillTraitPrompt('A {Flower colour} plant', plant, complete);
    expect(fill.unknown).toEqual(['Flower colour']);
    expect(promptIsUsable(fill)).toBe(false);
  });

  it('reports each unfillable placeholder once', () => {
    const fill = fillTraitPrompt('{Soil feel} {Soil feel}', plant, {});
    expect(fill.missing).toEqual(['Soil feel']);
  });

  it('treats a template with no model as entirely unknown', () => {
    const fill = fillTraitPrompt('{Leaf spots}', undefined, complete);
    expect(fill.unknown).toEqual(['Leaf spots']);
  });

  it('refuses an empty template', () => {
    expect(promptIsUsable(fillTraitPrompt('   ', plant, complete))).toBe(false);
  });

  it('allows a constant prompt that mentions no feature', () => {
    const fill = fillTraitPrompt('A houseplant', plant, complete);
    expect(promptIsUsable(fill)).toBe(true);
  });
});

describe('availablePlaceholders', () => {
  it('lists what the template may use', () => {
    expect(availablePlaceholders(plant)).toEqual([
      '{Leaf spots}',
      '{Soil feel}',
      '{Pot size (cm)}',
    ]);
  });
});

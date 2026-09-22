import {AdlibType} from '@cdo/apps/lab2/views/components/guide/Adlib';
import {readModelCard} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/modelCard';
import {
  adlibIsFilled,
  choicesFromTraits,
  featureKeys,
  fillAdlib,
  mismatchedValues,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/traitAdlib';

const card = readModelCard('abc123def456', {
  name: 'Car Acceptability',
  selectedTrainer: 'knnClassify',
  label: {id: 'Acceptability'},
  features: [
    {id: 'Maintenance Cost', values: ['Low', 'High']},
    {id: 'Safety Rating', values: ['Low', 'High']},
  ],
});

const adlib: AdlibType = {
  template: 'A {colour} car that is {Maintenance Cost}, and {Safety Rating}',
  features: ['Maintenance Cost', 'Safety Rating'],
  options: {
    colour: [{id: 'red', text: 'red'}],
    'Maintenance Cost': [
      {id: 'Low', text: 'plain and well kept'},
      {id: 'High', text: 'sleek and expensive looking'},
    ],
    'Safety Rating': [
      {id: 'Low', text: 'small and flimsy'},
      {id: 'High', text: 'solid and heavy'},
    ],
  },
  variantCount: 1,
};

describe('featureKeys', () => {
  it('lists the blanks data fills', () => {
    expect(featureKeys(adlib)).toEqual(['Maintenance Cost', 'Safety Rating']);
  });

  it('ignores a named feature with no blank to fill', () => {
    expect(featureKeys({...adlib, features: ['Nonexistent']})).toEqual([]);
  });
});

describe('choicesFromTraits', () => {
  it('selects each blank by the costume value', () => {
    const {choices, missing} = choicesFromTraits(adlib, card, {
      costumeTraits: {MaintenanceCost: 'Low', SafetyRating: 'High'},
    });
    expect(choices).toEqual({
      'Maintenance Cost': 'Low',
      'Safety Rating': 'High',
    });
    expect(missing).toEqual([]);
  });

  it('names what the costume has not set', () => {
    const {missing} = choicesFromTraits(adlib, card, {
      costumeTraits: {MaintenanceCost: 'Low'},
    });
    expect(missing).toEqual(['Safety Rating']);
  });

  it('prefers a sprite override', () => {
    const {choices} = choicesFromTraits(adlib, card, {
      spriteTraits: {MaintenanceCost: 'High'},
      costumeTraits: {MaintenanceCost: 'Low', SafetyRating: 'High'},
    });
    expect(choices['Maintenance Cost']).toBe('High');
  });

  it('leaves student blanks alone', () => {
    const {choices} = choicesFromTraits(adlib, card, {
      costumeTraits: {MaintenanceCost: 'Low', SafetyRating: 'High'},
    });
    expect(choices).not.toHaveProperty('colour');
  });
});

describe('fillAdlib', () => {
  it('sends the phrase, not the stored value', () => {
    expect(
      fillAdlib(adlib, {
        colour: 'red',
        'Maintenance Cost': 'Low',
        'Safety Rating': 'High',
      })
    ).toBe('A red car that is plain and well kept, and solid and heavy');
  });

  it('leaves an unfilled blank visible so a caller can refuse it', () => {
    const prompt = fillAdlib(adlib, {colour: 'red', 'Maintenance Cost': 'Low'});
    expect(prompt).toContain('{Safety Rating}');
    expect(adlibIsFilled(adlib, prompt)).toBe(false);
  });

  it('accepts a sentence with every blank filled', () => {
    const prompt = fillAdlib(adlib, {
      colour: 'red',
      'Maintenance Cost': 'Low',
      'Safety Rating': 'High',
    });
    expect(adlibIsFilled(adlib, prompt)).toBe(true);
  });
});

describe('mismatchedValues', () => {
  it('is quiet when the ids are exactly the model values', () => {
    expect(mismatchedValues(adlib, card)).toEqual([]);
  });

  it('reports an id the model does not have, and a value with no phrase', () => {
    const wrong: AdlibType = {
      ...adlib,
      options: {
        ...adlib.options,
        'Safety Rating': [{id: 'Medium', text: 'an average size'}],
      },
    };
    expect(mismatchedValues(wrong, card)).toEqual([
      {key: 'Safety Rating', unknown: ['Medium'], uncovered: ['Low', 'High']},
    ]);
  });
});

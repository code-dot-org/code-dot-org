import {
  isTrainerSupported,
  readModelCard,
  RawModelMetadata,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/modelCard';
import {
  buildTestData,
  mergeCostumeTraits,
  resolveTrait,
  traitsByCostumeName,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/traitStore';

// Metadata as GET /api/v1/ml_models/names returns it.
const plantMeta: RawModelMetadata = {
  name: 'Plant Health',
  selectedTrainer: 'knnClassify',
  label: {id: 'Health', values: ['Healthy', 'Sick']},
  features: [
    {id: 'Leaf spots', values: ['none', 'few', 'many']},
    {id: 'Drooping', values: ['no', 'yes']},
    {id: 'Soil feel', values: ['dry', 'damp', 'wet']},
    {id: 'Pot size (cm)', min: 8, max: 30},
  ],
};

// Saved before `label` became an object, and trained by an algorithm that
// MLTrainers does not run yet.
const legacyMeta: RawModelMetadata = {
  name: 'Water Need',
  selectedTrainer: 'decisionTree',
  labelColumn: 'Days until water',
  features: [{id: 'Soil feel', values: ['dry', 'damp', 'wet']}],
};

const plant = readModelCard('abc123def456', plantMeta);
const costumeTraits = {
  Leafspots: 'none',
  Drooping: 'no',
  Soilfeel: 'damp',
  Potsizecm: 14,
};

describe('modelCard', () => {
  it('keys fields by the stripped id that predict looks up', () => {
    expect(plant.fields.map(f => f.key)).toEqual([
      'Leafspots',
      'Drooping',
      'Soilfeel',
      'Potsizecm',
    ]);
  });

  it('infers the kind from `values`, which the metadata never declares', () => {
    expect(plant.fields.map(f => f.kind)).toEqual([
      'category',
      'category',
      'category',
      'number',
    ]);
  });

  it('reads the label off either metadata generation', () => {
    expect(plant.labelName).toBe('Health');
    expect(readModelCard('zzz999yyy888', legacyMeta).labelName).toBe(
      'Days until water'
    );
  });

  it('refuses a trainer MLTrainers would answer with an error string', () => {
    expect(isTrainerSupported(plant)).toBe(true);
    expect(isTrainerSupported(readModelCard('z', legacyMeta))).toBe(false);
  });
});

describe('resolveTrait', () => {
  it('falls back from the sprite to its costume', () => {
    expect(resolveTrait({costumeTraits}, 'Soilfeel')).toBe('damp');
  });

  it('lets one sprite differ from others wearing the same costume', () => {
    expect(
      resolveTrait({spriteTraits: {Soilfeel: 'wet'}, costumeTraits}, 'Soilfeel')
    ).toBe('wet');
  });

  it('treats an empty override as unset', () => {
    expect(
      resolveTrait({spriteTraits: {Soilfeel: ''}, costumeTraits}, 'Soilfeel')
    ).toBe('damp');
  });
});

describe('buildTestData', () => {
  it('names missing features by id, because a student reads it', () => {
    const result = buildTestData(plant, {
      costumeTraits: {Leafspots: 'few', Drooping: 'no'},
    });
    expect(result.missing).toEqual(['Soil feel', 'Pot size (cm)']);
    expect(result.testData).not.toHaveProperty('Soilfeel');
  });

  it('produces exactly the keys predict looks up', () => {
    const result = buildTestData(plant, {costumeTraits});
    expect(Object.keys(result.testData).sort()).toEqual([
      'Drooping',
      'Leafspots',
      'Potsizecm',
      'Soilfeel',
    ]);
    expect(result.missing).toEqual([]);
  });
});

describe('mergeCostumeTraits', () => {
  it('keeps values a previously imported model needed', () => {
    const merged = mergeCostumeTraits(costumeTraits, {Light: 'bright'});
    expect(merged.Light).toBe('bright');
    expect(merged.Leafspots).toBe('none');
  });

  it('removes a cleared field rather than storing an empty value', () => {
    expect(
      mergeCostumeTraits(costumeTraits, {Drooping: ''})
    ).not.toHaveProperty('Drooping');
  });
});

describe('traitsByCostumeName', () => {
  it('flips the uuid-keyed animation list to the name a sprite reports', () => {
    expect(
      traitsByCostumeName({
        orderedKeys: ['uuid-a', 'uuid-b', 'uuid-c'],
        propsByKey: {
          'uuid-a': {name: 'basil', traits: {Soilfeel: 'damp'}},
          'uuid-b': {name: 'hibiscus'},
          'uuid-c': {name: 'pothos', traits: {Soilfeel: 'wet'}},
        },
      })
    ).toEqual({basil: {Soilfeel: 'damp'}, pothos: {Soilfeel: 'wet'}});
  });

  it('survives an absent list', () => {
    expect(traitsByCostumeName(undefined)).toEqual({});
  });
});

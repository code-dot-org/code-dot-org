import fs from 'fs';
import path from 'path';

import {
  adlibSetForModel,
  imageAdlibFor,
  imageAdlibId,
  ImageAdlibSet,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageAdlibs';
import {IMAGE_TYPES} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {readModelCard} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/modelCard';
import {mismatchedValues} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/traitAdlib';

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

// The feature-bound sets and the AI Lab data sets they draw. Each set's
// option ids must be exactly its data set's values, or a costume's features
// pick no words.
const BOUND_SETS: [ImageAdlibSet, string][] = [
  ['plants', 'plant_health_toy'],
  ['recycling', 'recycling_sorter_toy'],
  ['cookies', 'cookie_critic_toy'],
  ['recess', 'recess_check_toy'],
];

function cardFor(datasetId: string) {
  const csv = fs.readFileSync(
    path.resolve(
      __dirname,
      '../../../../../../frontend/packages/labs/ailab/public/datasets',
      `${datasetId}.csv`
    ),
    'utf8'
  );
  const [header, ...rows] = csv
    .trim()
    .split('\n')
    .map(line => line.split(','));
  const features = header.slice(0, -1).map((id, i) => ({
    id,
    values: [...new Set(rows.map(row => row[i]))],
  }));
  return readModelCard(datasetId, {
    name: datasetId,
    selectedTrainer: 'knnClassify',
    label: {id: header[header.length - 1]},
    features,
  });
}

describe('feature-bound adlib sets', () => {
  it.each(BOUND_SETS)('%s matches the values of %s', (set, datasetId) => {
    expect(
      mismatchedValues(imageAdlibFor('sprite', set), cardFor(datasetId))
    ).toEqual([]);
  });

  it.each(BOUND_SETS)('%s is the set chosen for %s', (set, datasetId) => {
    expect(adlibSetForModel('sprite', cardFor(datasetId))).toBe(set);
  });

  it('chooses nothing for a model no set fits, or no model', () => {
    const card = readModelCard('x', {
      name: 'x',
      selectedTrainer: 'knnClassify',
      label: {id: 'y'},
      features: [{id: 'Unrelated', values: ['a', 'b']}],
    });
    expect(adlibSetForModel('sprite', card)).toBeUndefined();
    expect(adlibSetForModel('sprite', undefined)).toBeUndefined();
  });
});

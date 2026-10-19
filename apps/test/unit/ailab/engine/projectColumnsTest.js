import {
  applyPresetColumns,
  keepSelectableColumns,
  sortByColumnOrder,
} from '@cdo/apps/ailab/engine/helpers/projectColumns';
import {initialProject} from '@cdo/apps/ailab/engine/types';

const DATA = [{a: '1', b: '2', c: '3'}];
const UNLOCKED = {label: false, features: false};

const project = columns => ({...initialProject, ...columns});

describe('sortByColumnOrder', () => {
  test('orders features as the dataset does', () => {
    expect(sortByColumnOrder(['c', 'a'], DATA)).toEqual(['a', 'c']);
  });

  test('leaves the array it was handed untouched', () => {
    const features = ['c', 'a'];
    sortByColumnOrder(features, DATA);
    expect(features).toEqual(['c', 'a']);
  });

  test('tolerates an empty dataset', () => {
    expect(sortByColumnOrder(['c', 'a'], [])).toEqual(['c', 'a']);
  });
});

describe('applyPresetColumns', () => {
  test('a locked label replaces the one the project had', () => {
    const result = applyPresetColumns(
      project({labelColumn: 'a'}),
      {labelColumn: 'c'},
      {label: true, features: false},
      DATA
    );
    expect(result.labelColumn).toBe('c');
  });

  test('an unlocked label leaves the one the project had', () => {
    const result = applyPresetColumns(
      project({labelColumn: 'a'}),
      {labelColumn: 'c'},
      UNLOCKED,
      DATA
    );
    expect(result.labelColumn).toBe('a');
  });

  test('an unlocked label fills a gap the project left', () => {
    const result = applyPresetColumns(
      initialProject,
      {labelColumn: 'c'},
      UNLOCKED,
      DATA
    );
    expect(result.labelColumn).toBe('c');
  });

  test('locked features replace the ones the project had', () => {
    const result = applyPresetColumns(
      project({selectedFeatures: ['b']}),
      {selectedFeatures: ['c']},
      {label: false, features: true},
      DATA
    );
    expect(result.selectedFeatures).toEqual(['c']);
  });

  test('unlocked features leave the ones the project had', () => {
    const result = applyPresetColumns(
      project({selectedFeatures: ['b']}),
      {selectedFeatures: ['c']},
      UNLOCKED,
      DATA
    );
    expect(result.selectedFeatures).toEqual(['b']);
  });

  test('the label is never also a feature', () => {
    const result = applyPresetColumns(
      initialProject,
      {labelColumn: 'b', selectedFeatures: ['a', 'b', 'c']},
      UNLOCKED,
      DATA
    );
    expect(result.selectedFeatures).toEqual(['a', 'c']);
  });

  test('keeps the rest of the project', () => {
    const saved = project({hyperparameters: {k: 3}});
    const result = applyPresetColumns(
      saved,
      {labelColumn: 'a'},
      UNLOCKED,
      DATA
    );
    expect(result.hyperparameters).toEqual({k: 3});
  });
});

describe('keepSelectableColumns', () => {
  test('keeps columns the dataset offers', () => {
    const result = keepSelectableColumns(
      project({labelColumn: 'a', selectedFeatures: ['b', 'c']}),
      ['a', 'b', 'c'],
      DATA
    );
    expect(result.labelColumn).toBe('a');
    expect(result.selectedFeatures).toEqual(['b', 'c']);
  });

  test('drops a label the dataset no longer offers', () => {
    const result = keepSelectableColumns(
      project({labelColumn: 'gone', selectedFeatures: ['b']}),
      ['a', 'b', 'c'],
      DATA
    );
    expect(result.labelColumn).toBeUndefined();
    expect(result.selectedFeatures).toEqual(['b']);
  });

  test('drops features the dataset no longer offers', () => {
    const result = keepSelectableColumns(
      project({labelColumn: 'a', selectedFeatures: ['b', 'gone']}),
      ['a', 'b', 'c'],
      DATA
    );
    expect(result.selectedFeatures).toEqual(['b']);
  });

  test('restores the dataset’s column order', () => {
    const result = keepSelectableColumns(
      project({selectedFeatures: ['c', 'a']}),
      ['a', 'b', 'c'],
      DATA
    );
    expect(result.selectedFeatures).toEqual(['a', 'c']);
  });

  test('keeps the training run the project described', () => {
    const saved = project({
      labelColumn: 'a',
      selectedFeatures: ['b'],
      hyperparameters: {k: 3},
      accuracyCheckRowIndices: [0, 2],
    });
    const result = keepSelectableColumns(saved, ['a', 'b', 'c'], DATA);
    expect(result.hyperparameters).toEqual({k: 3});
    expect(result.accuracyCheckRowIndices).toEqual([0, 2]);
  });
});

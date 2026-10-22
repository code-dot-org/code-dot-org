import {initialProject} from '@cdo/apps/ailab/engine';
import {
  AILAB_DEFAULT_SOURCES,
  sourceToProject,
} from '@cdo/apps/ailab/lab2/sources';

const SAVED = {
  labelColumn: 'a',
  selectedFeatures: ['b', 'c'],
  hyperparameters: {k: 3},
  accuracyCheckRowIndices: [0, 2],
  historicResults: [
    {label: 'a', features: ['b'], accuracy: '80.00', correct: 4, total: 5},
  ],
};

describe('AILAB_DEFAULT_SOURCES', () => {
  // files_api rejects a falsy source, and useSources reloads on a new object.
  test('has a truthy source and a stable identity', () => {
    expect(AILAB_DEFAULT_SOURCES.source).toBeTruthy();
    expect(AILAB_DEFAULT_SOURCES).toBe(AILAB_DEFAULT_SOURCES);
  });
});

describe('sourceToProject', () => {
  test('keeps a project it recognises', () => {
    expect(sourceToProject(SAVED)).toEqual(SAVED);
  });

  test('falls back to an empty project for a source that is not one', () => {
    expect(sourceToProject('blocks go here')).toEqual(initialProject);
    expect(sourceToProject(null)).toEqual(initialProject);
    expect(sourceToProject(undefined)).toEqual(initialProject);
  });

  test('supplies the arrays a project is expected to have', () => {
    const project = sourceToProject({labelColumn: 'a'});

    expect(project.selectedFeatures).toEqual([]);
    expect(project.historicResults).toEqual([]);
  });

  test('drops column names that are not names', () => {
    const project = sourceToProject({
      ...SAVED,
      selectedFeatures: ['b', 7, null],
    });

    expect(project.selectedFeatures).toEqual(['b']);
  });

  test('drops a label that is not a name', () => {
    expect(
      sourceToProject({...SAVED, labelColumn: 12}).labelColumn
    ).toBeUndefined();
  });

  /*
    The indices name rows of the dataset, so a partly valid list is worse than
    none: train.refit would grade against rows the saved run never used.
  */
  test('drops the split unless every index is a row number', () => {
    expect(
      sourceToProject({...SAVED, accuracyCheckRowIndices: [0, 'two']})
        .accuracyCheckRowIndices
    ).toBeUndefined();
    expect(
      sourceToProject({...SAVED, accuracyCheckRowIndices: 3})
        .accuracyCheckRowIndices
    ).toBeUndefined();
  });
});

import {act, render} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import {ProjectProvider, useProject} from '../../src/ProjectContext';
import rootReducer, {
  resetState,
  setImportedData,
  setPresetColumns,
} from '../../src/redux';
import {initialProject} from '../../src/types';

const run = (accuracy, hyperparameters) => ({
  hyperparameters,
  historicResult: {
    label: 'animal',
    features: ['legs'],
    accuracy,
    correct: 1,
    total: 1,
  },
});

const FIRST = run('80.00', {k: 1});
const SECOND = run('90.00', {k: 3});

function renderContext(openWith, seedStore) {
  const store = seedStore ?? createStore(rootReducer);
  let context;
  const Probe = () => {
    context = useProject();
    return null;
  };

  render(
    createElement(
      Provider,
      {store},
      createElement(ProjectProvider, {project: openWith}, createElement(Probe)),
    ),
  );

  return {store, project: () => context.project, context: () => context};
}

const accuracies = project =>
  project.historicResults.map(result => result.accuracy);

describe('ProjectContext', () => {
  test('starts empty', () => {
    const {project} = renderContext();
    expect(project()).toEqual(initialProject);
  });

  test('opens with a project it is handed', () => {
    const {project} = renderContext({
      ...initialProject,
      hyperparameters: {k: 5},
      historicResults: [FIRST.historicResult],
    });
    expect(project().hyperparameters).toEqual({k: 5});
    expect(accuracies(project())).toEqual(['80.00']);
  });

  test('a run records its hyperparameters and leads the results', () => {
    const {project, context} = renderContext();

    act(() => context().applyTrainingRun(FIRST));
    act(() => context().applyTrainingRun(SECOND));

    expect(project().hyperparameters).toEqual({k: 3});
    expect(accuracies(project())).toEqual(['90.00', '80.00']);
  });

  test('an empty run changes nothing', () => {
    const {project, context} = renderContext();

    act(() => context().applyTrainingRun(FIRST));
    act(() => context().applyTrainingRun(undefined));

    expect(accuracies(project())).toEqual(['80.00']);
  });

  test('a cancel puts back what the run replaced', () => {
    const {project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));

    act(() => context().snapshotTrainingRun());
    act(() => context().applyTrainingRun(SECOND));
    expect(accuracies(project())).toEqual(['90.00', '80.00']);

    act(() => context().restoreTrainingRun());

    expect(project().hyperparameters).toEqual({k: 1});
    expect(accuracies(project())).toEqual(['80.00']);
  });

  test('cancelling a first run empties the project again', () => {
    const {project, context} = renderContext();

    act(() => context().snapshotTrainingRun());
    act(() => context().applyTrainingRun(FIRST));
    act(() => context().restoreTrainingRun());

    expect(project().hyperparameters).toBeUndefined();
    expect(accuracies(project())).toEqual([]);
  });

  test('a level load clears the project', () => {
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));

    act(() => {
      store.dispatch(resetState());
    });

    expect(project().hyperparameters).toBeUndefined();
    expect(accuracies(project())).toEqual([]);
  });

  test('Start Over keeps the results but drops the rest', () => {
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));

    act(() => {
      store.dispatch(resetState(true));
    });

    expect(project().hyperparameters).toBeUndefined();
    expect(accuracies(project())).toEqual(['80.00']);
  });

  test('a reset drops the snapshot a cancel would have used', () => {
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));
    act(() => context().snapshotTrainingRun());

    act(() => {
      store.dispatch(resetState());
    });
    act(() => context().restoreTrainingRun());

    expect(accuracies(project())).toEqual([]);
  });
});

describe('ProjectContext column choices', () => {
  const imported = () => {
    const store = createStore(rootReducer);
    store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
    return store;
  };

  test('a feature is added once, in the dataset\u2019s column order', () => {
    const {project, context} = renderContext(undefined, imported());

    act(() => context().addSelectedFeature('c'));
    act(() => context().addSelectedFeature('a'));
    act(() => context().addSelectedFeature('c'));

    expect(project().selectedFeatures).toEqual(['a', 'c']);
  });

  test('removing a feature leaves the rest', () => {
    const {project, context} = renderContext(undefined, imported());
    act(() => context().setSelectedFeatures(['a', 'b', 'c']));

    act(() => context().removeSelectedFeature('b'));

    expect(project().selectedFeatures).toEqual(['a', 'c']);
  });

  test('setting the features replaces them, in column order', () => {
    const {project, context} = renderContext(undefined, imported());

    act(() => context().setSelectedFeatures(['c', 'a']));
    expect(project().selectedFeatures).toEqual(['a', 'c']);

    act(() => context().setSelectedFeatures([]));
    expect(project().selectedFeatures).toEqual([]);
  });

  test('leaves the array it was handed untouched', () => {
    const {context} = renderContext(undefined, imported());
    const features = ['c', 'a'];

    act(() => context().setSelectedFeatures(features));

    expect(features).toEqual(['c', 'a']);
  });

  // A run owns its own results, never the student's columns, so a cancel must
  // not roll back a choice made after the run started.
  test('a cancel keeps column changes made since the run', () => {
    const {project, context} = renderContext(undefined, imported());
    act(() => context().setSelectedFeatures(['a']));
    act(() => context().snapshotTrainingRun());
    act(() => context().applyTrainingRun(FIRST));

    act(() => context().setSelectedFeatures(['a', 'b']));
    act(() => context().restoreTrainingRun());

    expect(project().selectedFeatures).toEqual(['a', 'b']);
    expect(accuracies(project())).toEqual([]);
  });

  test('choosing a label drops it from the features', () => {
    const {project, context} = renderContext(undefined, imported());
    act(() => context().setSelectedFeatures(['a', 'b']));

    act(() => context().setLabelColumn('a'));

    expect(project().labelColumn).toBe('a');
    expect(project().selectedFeatures).toEqual(['b']);
  });

  test('the label cannot be added as a feature', () => {
    const {project, context} = renderContext(undefined, imported());
    act(() => context().setLabelColumn('a'));

    act(() => context().addSelectedFeature('a'));
    act(() => context().addSelectedFeature('b'));

    expect(project().selectedFeatures).toEqual(['b']);
  });

  test('setting the features drops the label from them', () => {
    const {project, context} = renderContext(undefined, imported());
    act(() => context().setLabelColumn('b'));

    act(() => context().setSelectedFeatures(['a', 'b', 'c']));

    expect(project().selectedFeatures).toEqual(['a', 'c']);
  });

  /*
    loadDataset works out what a level's mode fixes once the dataset is in,
    and publishes it; applying it is this context's job. loadDataset.test.js
    covers the working out.
  */
  test('takes the columns a dataset load fixed', () => {
    const store = imported();
    const {project} = renderContext(undefined, store);

    act(() => {
      store.dispatch(
        setPresetColumns({labelColumn: 'b', selectedFeatures: ['a', 'c']}),
      );
    });

    expect(project().labelColumn).toBe('b');
    expect(project().selectedFeatures).toEqual(['a', 'c']);
  });

  test('leaves the columns alone when a load fixes neither', () => {
    const store = imported();
    const {project, context} = renderContext(undefined, store);
    act(() => context().setSelectedFeatures(['a']));

    act(() => {
      store.dispatch(setPresetColumns({}));
    });

    expect(project().labelColumn).toBeUndefined();
    expect(project().selectedFeatures).toEqual(['a']);
  });
});

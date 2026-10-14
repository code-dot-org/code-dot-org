import {act, render} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import {ProjectProvider, useProject} from '../../src/ProjectContext';
import rootReducer, {
  resetState,
  setColumnsByDataType,
  setImportedData,
  setMode,
  setPresetColumns,
} from '../../src/redux';
import {initialProject} from '../../src/types';

const run = (accuracy, hyperparameters, accuracyCheckRowIndices) => ({
  hyperparameters,
  accuracyCheckRowIndices,
  historicResult: {
    label: 'animal',
    features: ['legs'],
    accuracy,
    correct: 1,
    total: 1,
  },
});

const FIRST = run('80.00', {k: 1}, [8, 9]);
const SECOND = run('90.00', {k: 3}, [0, 5]);

function renderContext(openWith, seedStore, onProjectChanged) {
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
      createElement(
        ProjectProvider,
        {project: openWith, onProjectChanged},
        createElement(Probe),
      ),
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
      accuracyCheckRowIndices: [2, 7],
      historicResults: [FIRST.historicResult],
    });
    expect(project().hyperparameters).toEqual({k: 5});
    expect(project().accuracyCheckRowIndices).toEqual([2, 7]);
    expect(accuracies(project())).toEqual(['80.00']);
  });

  // The hyperparameters and the split are what a reload needs to rebuild the
  // model, so the latest run owns both.
  test('a run records what rebuilding it needs and leads the results', () => {
    const {project, context} = renderContext();

    act(() => context().applyTrainingRun(FIRST));
    act(() => context().applyTrainingRun(SECOND));

    expect(project().hyperparameters).toEqual({k: 3});
    expect(project().accuracyCheckRowIndices).toEqual([0, 5]);
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
    expect(project().accuracyCheckRowIndices).toEqual([8, 9]);
    expect(accuracies(project())).toEqual(['80.00']);
  });

  test('cancelling a first run empties the project again', () => {
    const {project, context} = renderContext();

    act(() => context().snapshotTrainingRun());
    act(() => context().applyTrainingRun(FIRST));
    act(() => context().restoreTrainingRun());

    expect(project().hyperparameters).toBeUndefined();
    expect(project().accuracyCheckRowIndices).toBeUndefined();
    expect(accuracies(project())).toEqual([]);
  });

  test('a level load clears the project', () => {
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));

    act(() => {
      store.dispatch(resetState());
    });

    expect(project().hyperparameters).toBeUndefined();
    expect(project().accuracyCheckRowIndices).toBeUndefined();
    expect(accuracies(project())).toEqual([]);
  });

  test('Start Over keeps the results but drops the rest', () => {
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));

    act(() => {
      store.dispatch(resetState({keepHistoricResults: true}));
    });

    expect(project().hyperparameters).toBeUndefined();
    expect(project().accuracyCheckRowIndices).toBeUndefined();
    expect(accuracies(project())).toEqual(['80.00']);
  });

  test('a level load opens with the work it is given', () => {
    const saved = {...initialProject, historicResults: [FIRST.historicResult]};
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(SECOND));

    act(() => {
      store.dispatch(resetState({levelLoad: {project: saved}}));
    });

    expect(accuracies(project())).toEqual(['80.00']);
  });

  test('a level load with nothing saved opens empty', () => {
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));

    act(() => {
      store.dispatch(resetState({levelLoad: {}}));
    });

    expect(project()).toEqual(initialProject);
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

/*
  What the consumer is told to save. A level opening is the consumer's own
  doing, so reporting it back would turn every load into a save.
*/
describe('ProjectContext reporting', () => {
  const SAVED = {...initialProject, historicResults: [FIRST.historicResult]};

  test('says nothing about the project it opened with', () => {
    const onProjectChanged = vi.fn();

    renderContext(SAVED, undefined, onProjectChanged);

    expect(onProjectChanged).not.toHaveBeenCalled();
  });

  test('says nothing about a project a level load handed in', () => {
    const onProjectChanged = vi.fn();
    const {store} = renderContext(undefined, undefined, onProjectChanged);

    act(() => {
      store.dispatch(resetState({levelLoad: {project: SAVED}}));
    });

    expect(onProjectChanged).not.toHaveBeenCalled();
  });

  test('reports what the student trained', () => {
    const onProjectChanged = vi.fn();
    const {context} = renderContext(undefined, undefined, onProjectChanged);

    act(() => context().applyTrainingRun(FIRST));

    expect(onProjectChanged).toHaveBeenCalledTimes(1);
    expect(accuracies(onProjectChanged.mock.lastCall[0])).toEqual(['80.00']);
  });

  // Without this the save outlives the reset and comes back on the next load.
  test('reports the empty project Start Over leaves behind', () => {
    const onProjectChanged = vi.fn();
    const {store, context} = renderContext(
      undefined,
      undefined,
      onProjectChanged,
    );
    act(() => context().applyTrainingRun(FIRST));

    act(() => {
      store.dispatch(resetState({keepHistoricResults: true}));
    });

    expect(onProjectChanged.mock.lastCall[0].hyperparameters).toBeUndefined();
  });
});

describe('ProjectContext column choices', () => {
  // A column has to have a type before it counts as one a student can pick.
  const imported = (rows = [{a: '1', b: '2', c: '3'}]) => {
    const store = createStore(rootReducer);
    store.dispatch(setImportedData(rows, false));
    Object.keys(rows[0]).forEach(column =>
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL)),
    );
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

  /*
    A model belongs to the columns it was trained on. Leaving the fields that
    describe it on a project whose columns have moved would have the next load
    rebuild a model the student never trained.
  */
  describe('changing the columns drops the model they produced', () => {
    const trained = () => {
      const rendered = renderContext(undefined, imported());
      act(() => rendered.context().setLabelColumn('a'));
      act(() => rendered.context().setSelectedFeatures(['b']));
      act(() => rendered.context().applyTrainingRun(FIRST));
      return rendered;
    };

    const described = project => [
      project.hyperparameters,
      project.accuracyCheckRowIndices,
    ];

    test.each([
      ['the label changes', context => context.setLabelColumn('c')],
      ['a feature is added', context => context.addSelectedFeature('c')],
      ['a feature is removed', context => context.removeSelectedFeature('b')],
      [
        'the features are replaced',
        context => context.setSelectedFeatures(['c']),
      ],
    ])('when %s', (_change, change) => {
      const {project, context} = trained();
      expect(described(project())).toEqual([{k: 1}, [8, 9]]);

      act(() => change(context()));

      expect(described(project())).toEqual([undefined, undefined]);
      expect(accuracies(project())).toEqual(['80.00']);
    });

    test('but not when the columns end up where they were', () => {
      const {project, context} = trained();

      act(() => context().setSelectedFeatures(['b']));

      expect(described(project())).toEqual([{k: 1}, [8, 9]]);
    });
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

  /*
    A locked column is one the student has no way to change, so the level's
    choice has to win. An unlocked one is only a starting point.
  */
  const chosen = store => {
    const rendered = renderContext(undefined, store);
    act(() => rendered.context().setLabelColumn('a'));
    act(() => rendered.context().setSelectedFeatures(['b']));
    return rendered;
  };

  const preset = (store, columns) =>
    act(() => {
      store.dispatch(setPresetColumns(columns));
    });

  test('a locked label replaces one the project already had', () => {
    const store = imported();
    store.dispatch(setMode({hideSelectLabel: true}));
    const {project} = chosen(store);

    preset(store, {labelColumn: 'c'});

    expect(project().labelColumn).toBe('c');
  });

  test('an unlocked label leaves one the project already had', () => {
    const store = imported();
    const {project} = chosen(store);

    preset(store, {labelColumn: 'c'});

    expect(project().labelColumn).toBe('a');
  });

  test('locked features replace ones the project already had', () => {
    const store = imported();
    store.dispatch(setMode({lockFeatures: true}));
    const {project} = chosen(store);

    preset(store, {selectedFeatures: ['c']});

    expect(project().selectedFeatures).toEqual(['c']);
  });

  test('unlocked features leave ones the project already had', () => {
    const store = imported();
    const {project} = chosen(store);

    preset(store, {selectedFeatures: ['c']});

    expect(project().selectedFeatures).toEqual(['b']);
  });

  /*
    A level's dataset can change after a student saves work against it.
  */
  describe('a saved project the dataset has outgrown', () => {
    const openSaved = columns => {
      const store = imported([{a: '1', b: '2'}]);
      const rendered = renderContext(
        {
          ...initialProject,
          ...columns,
          hyperparameters: {k: 3},
          accuracyCheckRowIndices: [0],
          historicResults: [FIRST.historicResult],
        },
        store,
      );
      preset(store, {});
      return rendered;
    };

    test('loses the feature the dataset dropped', () => {
      const {project} = openSaved({
        labelColumn: 'a',
        selectedFeatures: ['b', 'c'],
      });

      expect(project().selectedFeatures).toEqual(['b']);
    });

    test('loses the label the dataset dropped', () => {
      const {project} = openSaved({labelColumn: 'c', selectedFeatures: ['b']});

      expect(project().labelColumn).toBeUndefined();
    });

    // The saved model was graded on columns this dataset no longer has.
    test('keeps its results but not the model they describe', () => {
      const {project} = openSaved({
        labelColumn: 'a',
        selectedFeatures: ['b', 'c'],
      });

      expect(project().hyperparameters).toBeUndefined();
      expect(project().accuracyCheckRowIndices).toBeUndefined();
      expect(accuracies(project())).toEqual(['80.00']);
    });

    test('keeps the model when every column survived', () => {
      const {project} = openSaved({labelColumn: 'a', selectedFeatures: ['b']});

      expect(project().hyperparameters).toEqual({k: 3});
      expect(project().accuracyCheckRowIndices).toEqual([0]);
    });
  });

  test('an unlocked column still fills a gap the project left', () => {
    const store = imported();
    const {project} = renderContext(undefined, store);

    preset(store, {labelColumn: 'c', selectedFeatures: ['a', 'b']});

    expect(project().labelColumn).toBe('c');
    expect(project().selectedFeatures).toEqual(['a', 'b']);
  });
});

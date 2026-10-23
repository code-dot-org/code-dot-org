import {act, render} from '@testing-library/react';
import {createElement, useLayoutEffect} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import {
  ColumnTypes,
  UNIQUE_OPTIONS_MAX,
} from '@cdo/apps/ailab/engine/constants';
import {loadLevel} from '@cdo/apps/ailab/engine/levelLoad';
import {
  ProjectProvider,
  useProject,
} from '@cdo/apps/ailab/engine/ProjectContext';
import rootReducer, {
  resetState,
  setColumnsByDataType,
  setImportedData,
  setInvalidData,
  setMode,
  setPresetColumns,
  setSelectedCSV,
} from '@cdo/apps/ailab/engine/redux';
import {store as singletonStore} from '@cdo/apps/ailab/engine/store';
import {defaultProject} from '@cdo/apps/ailab/engine/types';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper');
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper');

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

function renderContext(initialProject, seedStore) {
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
      createElement(ProjectProvider, {initialProject}, createElement(Probe))
    )
  );

  return {store, project: () => context.project, context: () => context};
}

const accuracies = project =>
  project.historicResults.map(result => result.accuracy);

describe('ProjectContext', () => {
  test('starts empty', () => {
    const {project} = renderContext();
    expect(project()).toEqual(defaultProject);
  });

  // A saved project waits for the dataset it will be reconciled against.
  test('opens with a project it is handed', () => {
    const store = createStore(rootReducer);
    store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
    ['a', 'b', 'c'].forEach(column =>
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
    );
    const {project} = renderContext(
      {
        ...defaultProject,
        hyperparameters: {k: 5},
        accuracyCheckRowIndices: [2, 7],
        historicResults: [FIRST.historicResult],
      },
      store
    );
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

  test('Start Over drops the results along with the rest', () => {
    const {store, project, context} = renderContext();
    act(() => context().applyTrainingRun(FIRST));

    act(() => {
      store.dispatch(resetState());
    });

    expect(project()).toEqual(defaultProject);
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
        setPresetColumns({labelColumn: 'b', selectedFeatures: ['a', 'c']})
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

  test('an unlocked column still fills a gap the project left', () => {
    const store = imported();
    const {project} = renderContext(undefined, store);

    preset(store, {labelColumn: 'c', selectedFeatures: ['a', 'b']});

    expect(project().labelColumn).toBe('c');
    expect(project().selectedFeatures).toEqual(['a', 'b']);
  });
});

describe('ProjectContext opening a saved project', () => {
  const described = () => {
    const store = createStore(rootReducer);
    store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
    ['a', 'b', 'c'].forEach(column =>
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
    );
    return store;
  };

  const SAVED = {
    labelColumn: 'a',
    selectedFeatures: ['b', 'c'],
    hyperparameters: {k: 3},
    accuracyCheckRowIndices: [0],
    historicResults: [FIRST.historicResult],
  };

  test('is not open until a project has been opened', () => {
    const {context} = renderContext(undefined, described());

    expect(context().isProjectLoaded).toBe(false);

    act(() => context().openProject(SAVED));

    expect(context().isProjectLoaded).toBe(true);
  });

  test('is not loading when no dataset is on its way', () => {
    const {context} = renderContext(SAVED, createStore(rootReducer));

    expect(context().isProjectLoading).toBe(false);
    expect(context().isProjectLoaded).toBe(false);
  });

  test('is loading while the dataset it waits for is on its way', () => {
    const store = createStore(rootReducer);
    store.dispatch(setSelectedCSV('animals.csv'));

    expect(renderContext(SAVED, store).context().isProjectLoading).toBe(true);
  });

  /*
    The rows and the column types are read from two files, in either order,
    so rows alone do not mean the dataset is here.
  */
  test('is loading while the rows are here and their types are not', () => {
    const store = createStore(rootReducer);
    store.dispatch(setSelectedCSV('animals.csv'));
    store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));

    expect(renderContext(SAVED, store).context().isProjectLoading).toBe(true);
  });

  // The picker reports the problem, so it has to be allowed to render.
  test('is not loading once the chosen dataset has failed', () => {
    const store = createStore(rootReducer);
    store.dispatch(setSelectedCSV('animals.csv'));
    store.dispatch(setInvalidData('tooFewRows'));

    expect(renderContext(SAVED, store).context().isProjectLoading).toBe(false);
  });

  test('opens the saved project once the student picks a dataset', () => {
    const store = createStore(rootReducer);
    const {context} = renderContext(SAVED, store);

    act(() => {
      store.dispatch(setSelectedCSV('animals.csv'));
      store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
      ['a', 'b', 'c'].forEach(column =>
        store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
      );
    });

    expect(context().project.labelColumn).toBe('a');
    expect(context().isProjectLoaded).toBe(true);
  });

  test('is not open while a project waits for its dataset', () => {
    const store = createStore(rootReducer);
    const {context} = renderContext(undefined, store);

    act(() => context().openProject(SAVED));
    expect(context().isProjectLoaded).toBe(false);

    act(() => {
      store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
      ['a', 'b', 'c'].forEach(column =>
        store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
      );
    });

    expect(context().isProjectLoaded).toBe(true);
  });

  // An emptied project is still the state the student is now in.
  test('stays open through a reset', () => {
    const {store, context} = renderContext(undefined, described());
    act(() => context().openProject(SAVED));

    act(() => {
      store.dispatch(resetState());
    });

    expect(context().isProjectLoaded).toBe(true);
  });

  test('takes the columns and the run the project described', () => {
    const {project, context} = renderContext(undefined, described());

    act(() => context().openProject(SAVED));

    expect(project()).toEqual(SAVED);
  });

  test('drops columns this dataset does not offer', () => {
    const {project, context} = renderContext(undefined, described());

    act(() =>
      context().openProject({
        ...SAVED,
        labelColumn: 'gone',
        selectedFeatures: ['b', 'alsogone'],
      })
    );

    expect(project().labelColumn).toBeUndefined();
    expect(project().selectedFeatures).toEqual(['b']);
  });

  test('a locked label still beats the saved one', () => {
    const store = described();
    store.dispatch(setMode({hideSelectLabel: true}));
    store.dispatch(setPresetColumns({labelColumn: 'c'}));
    const {project, context} = renderContext(undefined, store);

    act(() => context().openProject(SAVED));

    expect(project().labelColumn).toBe('c');
  });

  test('an unlocked preset leaves the saved label alone', () => {
    const store = described();
    store.dispatch(setPresetColumns({labelColumn: 'c'}));
    const {project, context} = renderContext(undefined, store);

    act(() => context().openProject(SAVED));

    expect(project().labelColumn).toBe('a');
  });

  /*
    Every column looks unselectable until the dataset is described, so opening
    a project then would throw it away with no second reconciliation to undo it.
  */
  test('waits for a dataset that has not loaded yet', () => {
    const store = createStore(rootReducer);
    const {project, context} = renderContext(undefined, store);

    act(() => context().openProject(SAVED));
    expect(project()).toEqual(defaultProject);

    act(() => {
      store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
      ['a', 'b', 'c'].forEach(column =>
        store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
      );
    });

    expect(project()).toEqual(SAVED);
  });

  test('waits for the column types, not just the rows', () => {
    const store = createStore(rootReducer);
    store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
    const {project, context} = renderContext(undefined, store);

    act(() => context().openProject(SAVED));
    expect(project()).toEqual(defaultProject);

    act(() =>
      ['a', 'b', 'c'].forEach(column =>
        store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
      )
    );

    expect(project()).toEqual(SAVED);
  });

  /*
    Every column of this dataset is categorical with more unique values than
    the lab will offer, so it is fully described and still has nothing to pick
    from. That is not the same as a dataset that has yet to load.
  */
  test('opens against a dataset that offers nothing selectable', () => {
    const store = createStore(rootReducer);
    const crowded = Array.from({length: UNIQUE_OPTIONS_MAX + 10}, (_, row) => ({
      a: `a${row}`,
      b: `b${row}`,
      c: `c${row}`,
    }));
    const {project, context} = renderContext(undefined, store);

    act(() => context().openProject(SAVED));
    act(() => {
      store.dispatch(setImportedData(crowded, true));
      ['a', 'b', 'c'].forEach(column =>
        store.dispatch(setColumnsByDataType(column, ColumnTypes.CATEGORICAL))
      );
    });

    expect(project().labelColumn).toBeUndefined();
    expect(project().selectedFeatures).toEqual([]);
    expect(project().historicResults).toEqual(SAVED.historicResults);
  });

  /*
    A reset is how a level load begins, and the project being opened belongs
    to that level. The dataset a project waits for may also be the one the
    student goes on to choose. Either way it outlives the reset, and its
    columns are reconciled against whichever dataset arrives.
  */
  test('a reset keeps a project still waiting for its dataset', () => {
    const store = createStore(rootReducer);
    const {project, context} = renderContext(undefined, store);
    act(() => context().openProject(SAVED));

    act(() => {
      store.dispatch(resetState());
    });
    act(() => {
      store.dispatch(setImportedData([{a: '1', b: '2', c: '3'}], false));
      ['a', 'b', 'c'].forEach(column =>
        store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
      );
    });

    expect(project()).toEqual(SAVED);
  });

  test('drops the snapshot a cancel would have used', () => {
    const {project, context} = renderContext(undefined, described());
    act(() => context().applyTrainingRun(FIRST));
    act(() => context().snapshotTrainingRun());

    act(() => context().openProject(SAVED));
    act(() => context().restoreTrainingRun());

    expect(project().hyperparameters).toEqual(SAVED.hyperparameters);
  });
});

describe('ProjectContext keeping a saved project in sync', () => {
  // The singleton carries state between tests; each starts from a clean lab.
  beforeEach(() => singletonStore.dispatch(resetState()));

  const DATA = [
    {a: '1', b: '2', c: '3'},
    {a: '4', b: '5', c: '6'},
  ];

  const SAVED_COLUMNS = {
    ...defaultProject,
    labelColumn: 'a',
    selectedFeatures: ['b'],
    historicResults: [FIRST.historicResult],
  };

  // eslint-disable-next-line react/prop-types
  const Workspace = ({initialProject, onProjectChange, report}) => {
    useLayoutEffect(() => {
      loadLevel(undefined);
    }, []);

    return createElement(
      ProjectProvider,
      {initialProject, onProjectChange},
      createElement(Probe, {report})
    );
  };

  // eslint-disable-next-line react/prop-types
  const Probe = ({report}) => {
    report(useProject());
    return null;
  };

  function renderSync(initialProject = SAVED_COLUMNS) {
    const onProjectChange = jest.fn();
    let context;
    render(
      createElement(
        Provider,
        {store: singletonStore},
        createElement(Workspace, {
          initialProject,
          onProjectChange,
          report: value => (context = value),
        })
      )
    );
    return {save: onProjectChange, context: () => context};
  }

  const loadDataset = () =>
    act(() => {
      singletonStore.dispatch(setImportedData(DATA, false));
      ['a', 'b', 'c'].forEach(column =>
        singletonStore.dispatch(
          setColumnsByDataType(column, ColumnTypes.NUMERICAL)
        )
      );
    });

  // The readers dispatch the rows and then a type per column, in their own time.
  const loadDatasetColumnByColumn = () => {
    act(() => singletonStore.dispatch(setImportedData(DATA, false)));
    ['a', 'b', 'c'].forEach(column =>
      act(() =>
        singletonStore.dispatch(
          setColumnsByDataType(column, ColumnTypes.NUMERICAL)
        )
      )
    );
  };

  test('reports nothing until the saved project has been opened', () => {
    const {save} = renderSync();

    expect(save).not.toHaveBeenCalled();
  });

  /*
    The level load resets the lab after the seed is queued, and the project
    has to outlive that or a page load opens an empty lab.
  */
  test('opens the saved project into the lab', () => {
    const {save, context} = renderSync();

    loadDataset();

    expect(context().project).toEqual(SAVED_COLUMNS);
    expect(save).toHaveBeenCalledWith(SAVED_COLUMNS);
  });

  /*
    Reconciling against a dataset whose columns are still being typed drops
    the ones whose type has yet to arrive, and the project is then reported
    without them.
  */
  test('waits for every column of the dataset to be described', () => {
    const {save, context} = renderSync();

    loadDatasetColumnByColumn();

    expect(context().project).toEqual(SAVED_COLUMNS);
    expect(save).toHaveBeenCalledTimes(1);
  });

  test('does not open against the dataset the last level left behind', () => {
    loadDataset();

    const {save, context} = renderSync();
    loadDataset();

    expect(context().project).toEqual(SAVED_COLUMNS);
    expect(save).toHaveBeenCalledWith(SAVED_COLUMNS);
  });

  test('reports a column the student chooses', () => {
    const {save, context} = renderSync();
    loadDataset();
    save.mockClear();

    act(() => context().addSelectedFeature('c'));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].selectedFeatures).toEqual(['b', 'c']);
  });

  // The level chose these, but the saved copy mirrors the project either way.
  test("reports the level's preset columns", () => {
    const {save} = renderSync(defaultProject);
    loadDataset();
    save.mockClear();

    act(() => {
      singletonStore.dispatch(setMode({hideSelectLabel: true}));
      singletonStore.dispatch(setPresetColumns({labelColumn: 'c'}));
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].labelColumn).toBe('c');
  });

  /*
    Switching levels loads the next one while the lab is still standing and
    still saving to the level being left. The lab is emptied first, and
    saving that would replace the student's work with nothing.
  */
  test('does not report the emptying that a level change begins with', () => {
    const {save, context} = renderSync();
    loadDataset();
    act(() => context().addSelectedFeature('c'));
    save.mockClear();

    act(() => loadLevel(undefined));

    expect(save).not.toHaveBeenCalled();
  });

  test('opens the saved project once, not on every dataset', () => {
    const {context} = renderSync();
    loadDataset();

    act(() => {
      singletonStore.dispatch(resetState());
    });
    loadDataset();

    expect(context().project).toEqual(defaultProject);
  });

  /*
    The dataset the student switched to is now their work, empty as it is, and
    what they do next has to go on being reported.
  */
  test('keeps reporting after a reset empties the project', () => {
    const {save, context} = renderSync();
    loadDataset();
    act(() => {
      singletonStore.dispatch(resetState());
    });
    loadDataset();
    save.mockClear();

    act(() => context().setLabelColumn('a'));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].labelColumn).toBe('a');
  });
});

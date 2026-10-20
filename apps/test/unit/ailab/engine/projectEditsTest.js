/*
  Which changes to the project count as the student's work, and so are worth
  saving. A level's presets, an opened save and a reset are not.
*/
import {act, render} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {
  ProjectProvider,
  useProject,
} from '@cdo/apps/ailab/engine/ProjectContext';
import rootReducer, {
  resetState,
  setColumnsByDataType,
  setImportedData,
  setMode,
  setPresetColumns,
} from '@cdo/apps/ailab/engine/redux';
import {initialProject} from '@cdo/apps/ailab/engine/types';

const DATA = [
  {a: '1', b: '2', c: '3'},
  {a: '4', b: '5', c: '6'},
];

const RUN = {
  hyperparameters: {k: 1},
  accuracyCheckRowIndices: [1],
  historicResult: {
    label: 'a',
    features: ['b'],
    accuracy: '90.00',
    correct: 9,
    total: 10,
  },
};

function renderContext() {
  const store = createStore(rootReducer);
  store.dispatch(setImportedData(DATA, false));
  ['a', 'b', 'c'].forEach(column =>
    store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
  );
  const onEdited = jest.fn();
  let context;
  const Probe = () => {
    context = useProject();
    return null;
  };

  render(
    createElement(
      Provider,
      {store},
      createElement(ProjectProvider, {onEdited}, createElement(Probe))
    )
  );

  return {store, onEdited, context: () => context};
}

describe('changes worth saving', () => {
  test('choosing a label', () => {
    const {onEdited, context} = renderContext();

    act(() => context().setLabelColumn('a'));

    expect(onEdited).toHaveBeenCalledTimes(1);
    expect(onEdited.mock.lastCall[0].labelColumn).toBe('a');
  });

  test('choosing features, one at a time or together', () => {
    const {onEdited, context} = renderContext();

    act(() => context().addSelectedFeature('b'));
    act(() => context().removeSelectedFeature('b'));
    act(() => context().setSelectedFeatures(['b', 'c']));

    expect(onEdited).toHaveBeenCalledTimes(3);
    expect(onEdited.mock.lastCall[0].selectedFeatures).toEqual(['b', 'c']);
  });

  test('training a model', () => {
    const {onEdited, context} = renderContext();

    act(() => context().applyTrainingRun(RUN));

    expect(onEdited).toHaveBeenCalledTimes(1);
    expect(onEdited.mock.lastCall[0].hyperparameters).toEqual({k: 1});
  });

  // The saved project would otherwise keep a run the student threw away.
  test('cancelling a run', () => {
    const {onEdited, context} = renderContext();
    act(() => context().snapshotTrainingRun());
    act(() => context().applyTrainingRun(RUN));

    act(() => context().restoreTrainingRun());

    expect(onEdited).toHaveBeenCalledTimes(2);
    expect(onEdited.mock.lastCall[0].hyperparameters).toBeUndefined();
  });

  test('reports the project as it now stands', () => {
    const {onEdited, context} = renderContext();

    act(() => context().setLabelColumn('a'));
    act(() => context().addSelectedFeature('b'));

    expect(onEdited.mock.lastCall[0]).toEqual({
      ...initialProject,
      labelColumn: 'a',
      selectedFeatures: ['b'],
    });
  });
});

describe('changes not worth saving', () => {
  test("the level's preset columns", () => {
    const {store, onEdited} = renderContext();

    act(() => {
      store.dispatch(setMode({hideSelectLabel: true}));
      store.dispatch(
        setPresetColumns({labelColumn: 'a', selectedFeatures: ['b']})
      );
    });

    expect(onEdited).not.toHaveBeenCalled();
  });

  test('opening a saved project', () => {
    const {onEdited, context} = renderContext();

    act(() =>
      context().openProject({
        ...initialProject,
        labelColumn: 'a',
        selectedFeatures: ['b'],
      })
    );

    expect(onEdited).not.toHaveBeenCalled();
  });

  test('a reset', () => {
    const {store, onEdited, context} = renderContext();
    act(() => context().setLabelColumn('a'));
    onEdited.mockClear();

    act(() => {
      store.dispatch(resetState(/*keepsPendingProject*/ false));
    });

    expect(onEdited).not.toHaveBeenCalled();
  });

  test('taking a snapshot before a run', () => {
    const {onEdited, context} = renderContext();

    act(() => context().snapshotTrainingRun());

    expect(onEdited).not.toHaveBeenCalled();
  });

  test('a training run that produced nothing', () => {
    const {onEdited, context} = renderContext();

    act(() => context().applyTrainingRun(undefined));

    expect(onEdited).not.toHaveBeenCalled();
  });
});

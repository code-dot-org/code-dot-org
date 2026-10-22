/*
  The saved sources and the lab's project are meant to be the same thing. What
  matters here is the order: the saved project reaches the lab before anything
  is written back, or a page load would save an empty project over the
  student's work.
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
import ProjectSync from '@cdo/apps/ailab/lab2/views/ProjectSync';

const DATA = [
  {a: '1', b: '2', c: '3'},
  {a: '4', b: '5', c: '6'},
];

const SAVED = {
  ...initialProject,
  labelColumn: 'a',
  selectedFeatures: ['b'],
  historicResults: [
    {label: 'a', features: ['b'], accuracy: '90.00', correct: 9, total: 10},
  ],
};

function renderSync(savedProject = SAVED) {
  const store = createStore(rootReducer);
  const save = jest.fn();
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
        null,
        createElement(ProjectSync, {savedProject, save}),
        createElement(Probe)
      )
    )
  );

  return {store, save, context: () => context};
}

const loadDataset = store =>
  act(() => {
    store.dispatch(setImportedData(DATA, false));
    ['a', 'b', 'c'].forEach(column =>
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
    );
  });

describe('ProjectSync', () => {
  test('saves nothing until the saved project has been opened', () => {
    const {save} = renderSync();

    expect(save).not.toHaveBeenCalled();
  });

  test('opens the saved project into the lab', () => {
    const {store, save, context} = renderSync();

    loadDataset(store);

    expect(context().project).toEqual(SAVED);
    expect(save).toHaveBeenCalledWith(SAVED);
  });

  test('saves a column the student chooses', () => {
    const {store, save, context} = renderSync();
    loadDataset(store);
    save.mockClear();

    act(() => context().addSelectedFeature('c'));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].selectedFeatures).toEqual(['b', 'c']);
  });

  // The level chose these, but the sources mirror the project either way.
  test("saves the level's preset columns", () => {
    const {store, save} = renderSync(initialProject);
    loadDataset(store);
    save.mockClear();

    act(() => {
      store.dispatch(setMode({hideSelectLabel: true}));
      store.dispatch(setPresetColumns({labelColumn: 'c'}));
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].labelColumn).toBe('c');
  });

  /*
    A dataset the student picks changes what openProject would reconcile
    against, but asking again would put the saved project back over whatever
    they have done since.
  */
  test('opens the saved project once, not on every dataset', () => {
    const {store, context} = renderSync();
    loadDataset(store);

    act(() => {
      store.dispatch(resetState(/*keepsPendingProject*/ true));
    });
    loadDataset(store);

    expect(context().project).toEqual(initialProject);
  });

  /*
    The dataset the student switched to is now their work, empty as it is, and
    what they do next has to go on being saved.
  */
  test('keeps saving after a reset empties the project', () => {
    const {store, save, context} = renderSync();
    loadDataset(store);
    act(() => {
      store.dispatch(resetState(/*keepsPendingProject*/ true));
    });
    loadDataset(store);
    save.mockClear();

    act(() => context().setLabelColumn('a'));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].labelColumn).toBe('a');
  });
});

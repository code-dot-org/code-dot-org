/*
  The saved sources and the lab's project are meant to be the same thing. What
  matters here is the order: the saved project reaches the lab before anything
  is written back, or a page load would save an empty project over the
  student's work.

  These mount the way the workspace does, loading the level from a parent
  layout effect, because that reset is what a seed has to survive. The trainer
  and the level load work against the store singleton, so these do too.
*/
import {act, render} from '@testing-library/react';
import {createElement, useLayoutEffect} from 'react';
import {Provider} from 'react-redux';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {loadLevel} from '@cdo/apps/ailab/engine/levelLoad';
import {
  ProjectProvider,
  useProject,
} from '@cdo/apps/ailab/engine/ProjectContext';
import {
  resetState,
  setColumnsByDataType,
  setImportedData,
  setMode,
  setPresetColumns,
} from '@cdo/apps/ailab/engine/redux';
import {store} from '@cdo/apps/ailab/engine/store';
import {initialProject} from '@cdo/apps/ailab/engine/types';
import ProjectSync from '@cdo/apps/ailab/lab2/views/ProjectSync';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper');
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper');

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

// eslint-disable-next-line react/prop-types
const Probe = ({report}) => {
  report(useProject());
  return null;
};

// Stands in for the workspace, which loads the level from a layout effect.
// eslint-disable-next-line react/prop-types
const Workspace = ({savedProject, save, report}) => {
  useLayoutEffect(() => {
    loadLevel(undefined);
  }, []);

  return createElement(
    ProjectProvider,
    null,
    createElement(ProjectSync, {savedProject, save}),
    createElement(Probe, {report})
  );
};

function renderSync(savedProject = SAVED) {
  const save = jest.fn();
  let context;

  render(
    createElement(
      Provider,
      {store},
      createElement(Workspace, {
        savedProject,
        save,
        report: value => (context = value),
      })
    )
  );

  return {save, context: () => context};
}

const loadDataset = () =>
  act(() => {
    store.dispatch(setImportedData(DATA, false));
    ['a', 'b', 'c'].forEach(column =>
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
    );
  });

// The readers dispatch the rows and then a type per column, in their own time.
const loadDatasetColumnByColumn = () => {
  act(() => store.dispatch(setImportedData(DATA, false)));
  ['a', 'b', 'c'].forEach(column =>
    act(() =>
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
    )
  );
};

describe('ProjectSync', () => {
  test('saves nothing until the saved project has been opened', () => {
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

    expect(context().project).toEqual(SAVED);
    expect(save).toHaveBeenCalledWith(SAVED);
  });

  /*
    Reconciling against a dataset whose columns are still being typed drops
    the ones whose type has yet to arrive, and the mirror then saves the
    project without them.
  */
  test('waits for every column of the dataset to be described', () => {
    const {save, context} = renderSync();

    loadDatasetColumnByColumn();

    expect(context().project).toEqual(SAVED);
    expect(save).toHaveBeenCalledWith(SAVED);
    expect(save).toHaveBeenCalledTimes(1);
  });

  test('saves a column the student chooses', () => {
    const {save, context} = renderSync();
    loadDataset();
    save.mockClear();

    act(() => context().addSelectedFeature('c'));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].selectedFeatures).toEqual(['b', 'c']);
  });

  // The level chose these, but the sources mirror the project either way.
  test("saves the level's preset columns", () => {
    const {save} = renderSync(initialProject);
    loadDataset();
    save.mockClear();

    act(() => {
      store.dispatch(setMode({hideSelectLabel: true}));
      store.dispatch(setPresetColumns({labelColumn: 'c'}));
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].labelColumn).toBe('c');
  });

  /*
    Switching levels loads the next one while this component is still standing
    and still saving to the level being left. The lab is emptied first, and
    saving that would replace the student's work with nothing.
  */
  test('does not save the emptying that a level change begins with', () => {
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
      store.dispatch(resetState());
    });
    loadDataset();

    expect(context().project).toEqual(initialProject);
  });

  /*
    The dataset the student switched to is now their work, empty as it is, and
    what they do next has to go on being saved.
  */
  test('keeps saving after a reset empties the project', () => {
    const {save, context} = renderSync();
    loadDataset();
    act(() => {
      store.dispatch(resetState());
    });
    loadDataset();
    save.mockClear();

    act(() => context().setLabelColumn('a'));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.lastCall[0].labelColumn).toBe('a');
  });
});

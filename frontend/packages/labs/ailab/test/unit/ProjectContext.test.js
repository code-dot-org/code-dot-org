import {act, render} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import {ProjectProvider, useProject} from '../../src/ProjectContext';
import rootReducer, {resetState} from '../../src/redux';

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

function renderContext(openWith) {
  const store = createStore(rootReducer);
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
    expect(project()).toEqual({
      hyperparameters: undefined,
      historicResults: [],
    });
  });

  test('opens with a project it is handed', () => {
    const {project} = renderContext({
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

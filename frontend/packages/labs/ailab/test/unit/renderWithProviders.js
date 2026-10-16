/* Renders a component under the providers the lab mounts in index.tsx. */

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {ThemeProvider} from '@mui/material/styles';
import {act, render} from '@testing-library/react';
import {createElement, useEffect, useRef} from 'react';
import {Provider} from 'react-redux';

import {ProjectProvider, useProject} from '../../src/ProjectContext';
import train from '../../src/train';
import {
  TrainingDataProvider,
  useTrainingData,
} from '../../src/TrainingDataContext';

// Trains the way clicking Train model does, and hands back the run so a test
// can seed the contexts with it.
export function runTraining(store, project) {
  train.reset();
  train.init(store, project);
  return train.onClickTrain();
}

// The project a run leaves behind, for tests that work outside the module.
export function projectFromRun(project, run) {
  return {
    ...project,
    hyperparameters: run?.hyperparameters,
    accuracyCheckRowIndices: run?.accuracyCheckRowIndices,
    historicResults: run ? [run.historicResult] : [],
  };
}

// Puts a run into both contexts the way useTrainingRun's beginRun does —
// snapshot first, so a later cancel has something to restore.
function applyRun({trainingData, project}, run) {
  trainingData.snapshotTrainedModel();
  project.snapshotTrainingRun();
  trainingData.setTrainedModel(run?.trainedModel);
  project.applyTrainingRun(run);
}

// Seeds a run made outside the module, and keeps both context values reachable.
// eslint-disable-next-line react/prop-types
const ContextProbe = ({trainingRun, report}) => {
  const trainingData = useTrainingData();
  const project = useProject();
  const contexts = {trainingData, project};

  report(contexts);

  // The context values close over state, so a seed must use the latest ones
  // rather than whichever render scheduled the effect.
  const contextsRef = useRef(contexts);
  contextsRef.current = contexts;

  // Seeds once per run.
  useEffect(() => {
    if (trainingRun) {
      applyRun(contextsRef.current, trainingRun);
    }
  }, [trainingRun]);

  return null;
};

export function renderWithProviders(
  element,
  {store, trainingRun, project} = {}
) {
  let contexts;
  const result = render(
    createElement(
      Provider,
      {store},
      createElement(
        ProjectProvider,
        {project},
        createElement(
          TrainingDataProvider,
          null,
          createElement(ContextProbe, {
            trainingRun,
            report: value => (contexts = value),
          }),
          createElement(
            ThemeProvider,
            {theme: getMuiThemeForBrand(undefined)},
            element
          )
        )
      )
    )
  );

  return {
    ...result,
    store,
    trainingData: () => contexts.trainingData,
    project: () => contexts.project.project,
    // The project's actions, for tests that change the columns by hand.
    projectActions: () => contexts.project,
    // useTrainingRun can't serve here: it trains against the store singleton
    // rather than this test's store.
    trainModel: () =>
      act(() =>
        applyRun(contexts, runTraining(store, contexts.project.project))
      ),
  };
}

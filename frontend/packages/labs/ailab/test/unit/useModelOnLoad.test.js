/*
  Where a level's first model comes from. A project saved by a student is
  rebuilt; a pretrained level trains only when there is nothing to rebuild.
*/

import {act} from '@testing-library/react';
import {createElement} from 'react';

import {resetState, setPresetColumns} from '../../src/redux';
import {store as storeSingleton} from '../../src/store';
import {useModelOnLoad} from '../../src/useModelOnLoad';

import {levelProject, seedLevel} from './levelStore';
import {
  projectFromRun,
  renderWithProviders,
  runTraining,
} from './renderWithProviders';

const PRETRAINED = {
  trainer: 'decisionTree',
  pretrained: true,
  hideSelectLabel: true,
  lockFeatures: true,
};

// What a student's save holds once they have trained on this level.
function savedProject(mode) {
  const store = seedLevel(storeSingleton, mode);
  const project = levelProject();
  return projectFromRun(project, runTraining(store, project));
}

// The hook drives the store singleton, the way the mounted app does.
function openLevel(mode, project) {
  storeSingleton.dispatch(resetState());
  seedLevel(storeSingleton, mode);

  const Probe = () => {
    useModelOnLoad();
    return null;
  };

  return renderWithProviders(createElement(Probe), {
    store: storeSingleton,
    project,
  });
}

describe('useModelOnLoad', () => {
  test('rebuilds the model a saved project describes', () => {
    const saved = savedProject({trainer: 'decisionTree'});

    const {trainingData} = openLevel({trainer: 'decisionTree'}, saved);

    expect(trainingData().trainedModel).toBeDefined();
  });

  // Rebuilding restores a run the student already made, so it is not one more.
  test('records no new result for the model it rebuilt', () => {
    const saved = savedProject({trainer: 'decisionTree'});

    const {project} = openLevel({trainer: 'decisionTree'}, saved);

    expect(project().historicResults).toEqual(saved.historicResults);
  });

  test('leaves the level untrained when the save describes no model', () => {
    const {trainingData} = openLevel({}, levelProject());

    expect(trainingData().trainedModel).toBeUndefined();
  });

  test('leaves the level untrained when the saved split no longer fits', () => {
    const saved = savedProject({trainer: 'decisionTree'});

    const {trainingData} = openLevel(
      {trainer: 'decisionTree'},
      {...saved, accuracyCheckRowIndices: [98, 99]},
    );

    expect(trainingData().trainedModel).toBeUndefined();
  });

  /*
    The dataset arrives a render before the project's columns are reconciled
    against it. Rebuilding in that gap reads a column the dataset does not
    have, which trains on nothing at all rather than refusing.
  */
  test('waits for the columns to be reconciled with the dataset', () => {
    const saved = savedProject({trainer: 'decisionTree'});
    const {trainingData, project} = openLevel(
      {trainer: 'decisionTree'},
      {
        ...saved,
        selectedFeatures: [...saved.selectedFeatures, 'wings'],
      },
    );

    act(() => {
      storeSingleton.dispatch(setPresetColumns({}));
    });

    expect(project().selectedFeatures).toEqual(saved.selectedFeatures);
    expect(trainingData().trainedModel).toBeUndefined();
  });

  describe('a pretrained level', () => {
    test('trains when there is nothing to rebuild', () => {
      const {trainingData, project} = openLevel(PRETRAINED, levelProject());

      expect(trainingData().trainedModel).toBeDefined();
      expect(project().historicResults).toHaveLength(1);
    });

    // Training again would report a second run for a level the student opened.
    test('rebuilds a saved model rather than training again', () => {
      const saved = savedProject(PRETRAINED);

      const {trainingData, project} = openLevel(PRETRAINED, saved);

      expect(trainingData().trainedModel).toBeDefined();
      expect(project().historicResults).toEqual(saved.historicResults);
    });

    test('trains when the saved model cannot be rebuilt', () => {
      const saved = savedProject(PRETRAINED);

      const {trainingData, project} = openLevel(PRETRAINED, {
        ...saved,
        accuracyCheckRowIndices: [98, 99],
      });

      expect(trainingData().trainedModel).toBeDefined();
      expect(project().historicResults).toHaveLength(2);
    });
  });
});

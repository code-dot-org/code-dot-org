import {act, fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '../../src/i18n';
import {replayTraining, setTrainingModalStep} from '../../src/redux';
import TrainingModal from '../../src/UIComponents/TrainingModal';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

// Longer than either animation takes to finish.
const ANIMATION_TIMEOUT_MS = 60000;

function startTraining({replay = false} = {}) {
  const store = levelStore({});
  const project = levelProject();
  const trainingRun = runTraining(store, project);
  store.dispatch(replay ? replayTraining() : setTrainingModalStep('training'));
  const {trainingData, project: projectValue} = renderWithProviders(
    createElement(TrainingModal),
    {store, project, trainingRun},
  );
  return {store, trainingData, project: projectValue};
}

const button = name => screen.queryByRole('button', {name});

describe('TrainingModal', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('offers Cancel while training', () => {
    startTraining();
    expect(button('Cancel')).not.toBeNull();
    expect(button('Back to dataset')).toBeNull();
  });

  test('offers Cancel while testing', () => {
    const {store} = startTraining();
    act(() => {
      store.dispatch(setTrainingModalStep('testing'));
    });
    expect(button('Cancel')).not.toBeNull();
  });

  test('Cancel closes the modal and discards the run', () => {
    const {store, trainingData, project} = startTraining();
    fireEvent.click(button('Cancel'));

    const state = store.getState();
    expect(state.trainingModalStep).toBeUndefined();
    expect(project().historicResults).toEqual([]);
    expect(trainingData().trainedModel).toBeUndefined();
    // A cancelled run undoes its own results, never the student's columns.
    expect(project().labelColumn).toBe('animal');
    expect(project().selectedFeatures).toEqual(['legs']);
  });

  test('a replay offers Back to dataset, not Cancel, at each step', () => {
    const {store} = startTraining({replay: true});
    expect(button('Back to dataset')).not.toBeNull();
    expect(button('Cancel')).toBeNull();

    act(() => {
      store.dispatch(setTrainingModalStep('testing'));
    });
    expect(button('Back to dataset')).not.toBeNull();
    expect(button('Cancel')).toBeNull();
  });

  test('closing a replay keeps the run', () => {
    const {store, project} = startTraining({replay: true});
    fireEvent.click(button('Back to dataset'));

    const state = store.getState();
    expect(state.trainingModalStep).toBeUndefined();
    expect(state.isTrainingReplay).toBe(false);
    expect(project().historicResults).toHaveLength(1);
  });

  test('a new run after a replay offers Cancel again', () => {
    const {store} = startTraining({replay: true});
    fireEvent.click(button('Back to dataset'));
    act(() => {
      store.dispatch(setTrainingModalStep('training'));
    });
    expect(button('Cancel')).not.toBeNull();
  });

  test('Back to dataset keeps a finished run', () => {
    vi.useFakeTimers();
    const {store, trainingData, project} = startTraining();
    act(() => {
      store.dispatch(setTrainingModalStep('testing'));
    });
    act(() => {
      vi.advanceTimersByTime(ANIMATION_TIMEOUT_MS);
    });
    fireEvent.click(button('Back to dataset'));

    const state = store.getState();
    expect(state.trainingModalStep).toBeUndefined();
    expect(project().historicResults).toHaveLength(1);
    expect(trainingData().trainedModel).toBeDefined();
  });
});

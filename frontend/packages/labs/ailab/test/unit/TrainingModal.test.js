import {ThemeProvider} from '@mui/material/styles';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import I18n from '../../src/i18n';
import {setTrainingModalStep} from '../../src/redux';
import train from '../../src/train';
import TrainingModal from '../../src/UIComponents/TrainingModal';

import {levelStore} from './levelStore';

// Longer than either animation takes to finish.
const ANIMATION_TIMEOUT_MS = 60000;

function startTraining() {
  const store = levelStore({});
  train.reset();
  train.init(store);
  train.onClickTrain();
  store.dispatch(setTrainingModalStep('training'));
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(TrainingModal),
      ),
    ),
  );
  return store;
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
    const store = startTraining();
    act(() => {
      store.dispatch(setTrainingModalStep('testing'));
    });
    expect(button('Cancel')).not.toBeNull();
  });

  test('Cancel closes the modal and discards the run', () => {
    const store = startTraining();
    fireEvent.click(button('Cancel'));

    const state = store.getState();
    expect(state.trainingModalStep).toBeUndefined();
    expect(state.historicResults).toEqual([]);
    expect(state.trainedModel).toBeUndefined();
    expect(state.labelColumn).toBe('animal');
    expect(state.selectedFeatures).toEqual(['legs']);
  });

  test('Back to dataset keeps a finished run', () => {
    vi.useFakeTimers();
    const store = startTraining();
    act(() => {
      store.dispatch(setTrainingModalStep('testing'));
    });
    act(() => {
      vi.advanceTimersByTime(ANIMATION_TIMEOUT_MS);
    });
    fireEvent.click(button('Back to dataset'));

    const state = store.getState();
    expect(state.trainingModalStep).toBeUndefined();
    expect(state.historicResults).toHaveLength(1);
    expect(state.trainedModel).toBeDefined();
  });
});

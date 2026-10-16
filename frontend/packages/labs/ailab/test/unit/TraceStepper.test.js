import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {ThemeProvider} from '@mui/material/styles';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {useAppSelector} from '../../src/hooks';
import I18n from '../../src/i18n';
import {setPredictionPlaying, setTestData} from '../../src/redux';
import {
  getPredictionStep,
  getPredictionTrace,
} from '../../src/selectors/visualizationSelectors';
import train from '../../src/train';
import TraceStepper, {
  STEP_INTERVAL_MS,
} from '../../src/UIComponents/TraceStepper';

import {levelProject, levelStore} from './levelStore';
import {runTraining} from './renderWithProviders';

// A bird sits two questions deep whichever way the tree first splits legs.
function predictBird(store, project, trainedModel) {
  act(() => {
    store.dispatch(setTestData('legs', '2'));
    train.onClickPredict(trainedModel, project);
  });
}

// eslint-disable-next-line react/prop-types
const StoreStepper = ({project, trainedModel, onReplay}) =>
  createElement(TraceStepper, {
    key: useAppSelector(state => state.predictionCount),
    step: useAppSelector(state =>
      getPredictionStep(state, project, trainedModel)
    ),
    stepCount: useAppSelector(
      state => getPredictionTrace(state, project, trainedModel).path.length
    ),
    onReplay,
  });

function renderStepper(onReplay = () => {}) {
  I18n.initI18n();
  const store = levelStore({trainer: 'decisionTree'});
  const project = levelProject();
  const {trainedModel} = runTraining(store, project);
  predictBird(store, project, trainedModel);
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(StoreStepper, {project, trainedModel, onReplay})
      )
    )
  );
  return {store, project, trainedModel};
}

function step(store, project, trainedModel) {
  return getPredictionStep(store.getState(), project, trainedModel);
}

function button(name) {
  return screen.getByRole('button', {name});
}

function unavailable(name) {
  return button(name).getAttribute('aria-disabled') === 'true';
}

function advanceOneStep() {
  act(() => {
    vi.advanceTimersByTime(STEP_INTERVAL_MS);
  });
}

describe('TraceStepper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    // jsdom has no matchMedia, so the reduced-motion cases add one.
    delete window.matchMedia;
    I18n.reset();
  });

  it('plays a new prediction one step per interval, then offers a replay', () => {
    const {store, project, trainedModel} = renderStepper();

    expect(step(store, project, trainedModel)).toBe(0);
    expect(button('Skip to the answer')).toBeTruthy();

    advanceOneStep();
    expect(step(store, project, trainedModel)).toBe(1);

    advanceOneStep();
    expect(step(store, project, trainedModel)).toBe(2);
    expect(button('Replay from the start')).toBeTruthy();

    advanceOneStep();
    expect(step(store, project, trainedModel)).toBe(2);
  });

  it('skips straight to the answer', () => {
    const {store, project, trainedModel} = renderStepper();

    fireEvent.click(button('Skip to the answer'));
    advanceOneStep();

    expect(step(store, project, trainedModel)).toBe(2);
    expect(unavailable('Next step')).toBe(true);
    expect(unavailable('Previous step')).toBe(false);
  });

  it('replays from the root', () => {
    const {store, project, trainedModel} = renderStepper();
    fireEvent.click(button('Skip to the answer'));

    fireEvent.click(button('Replay from the start'));

    expect(step(store, project, trainedModel)).toBe(0);
    advanceOneStep();
    expect(step(store, project, trainedModel)).toBe(1);
  });

  it('plays again when another prediction comes in', () => {
    const {store, project, trainedModel} = renderStepper();
    fireEvent.click(button('Skip to the answer'));

    predictBird(store, project, trainedModel);

    expect(step(store, project, trainedModel)).toBe(0);
    expect(button('Skip to the answer')).toBeTruthy();
  });

  it('stops playing when the student steps by hand', () => {
    const {store, project, trainedModel} = renderStepper();

    fireEvent.click(button('Next step'));
    advanceOneStep();

    expect(step(store, project, trainedModel)).toBe(1);
    expect(button('Replay from the start')).toBeTruthy();

    fireEvent.click(button('Previous step'));

    expect(step(store, project, trainedModel)).toBe(0);
    expect(unavailable('Previous step')).toBe(true);
  });

  it('stops where it is when playback is stopped from outside', () => {
    const {store, project, trainedModel} = renderStepper();
    advanceOneStep();

    act(() => {
      store.dispatch(setPredictionPlaying(false));
    });
    advanceOneStep();

    expect(step(store, project, trainedModel)).toBe(1);
    expect(button('Replay from the start')).toBeTruthy();
  });

  it('tells its owner each time the student replays', () => {
    const onReplay = vi.fn();
    renderStepper(onReplay);
    fireEvent.click(button('Skip to the answer'));

    fireEvent.click(button('Replay from the start'));
    fireEvent.click(button('Skip to the answer'));
    fireEvent.click(button('Replay from the start'));

    expect(onReplay).toHaveBeenCalledTimes(2);
  });

  it('keeps focus on a button at an end, where pressing it does nothing', () => {
    const {store, project, trainedModel} = renderStepper();
    act(() => button('Previous step').focus());

    fireEvent.click(button('Previous step'));
    fireEvent.click(button('Previous step'));
    fireEvent.click(button('Previous step'));

    expect(step(store, project, trainedModel)).toBe(0);
    expect(button('Previous step').disabled).toBe(false);
    expect(document.activeElement).toBe(button('Previous step'));
  });

  describe('with reduced motion', () => {
    beforeEach(() => {
      window.matchMedia = query => ({matches: query.includes('reduce')});
    });

    it('shows the whole path at once', () => {
      const {store, project, trainedModel} = renderStepper();

      expect(store.getState().predictionStep).toBeUndefined();
      expect(step(store, project, trainedModel)).toBe(2);
      expect(button('Replay from the start')).toBeTruthy();
    });

    it('replays from the root, leaving the stepping to the student', () => {
      const {store, project, trainedModel} = renderStepper();

      fireEvent.click(button('Replay from the start'));
      advanceOneStep();

      expect(step(store, project, trainedModel)).toBe(0);
    });
  });
});

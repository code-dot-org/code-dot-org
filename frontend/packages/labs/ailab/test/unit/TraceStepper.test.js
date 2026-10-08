import {ThemeProvider} from '@mui/material/styles';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

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

import {levelStore} from './levelStore';

// A bird sits two questions deep whichever way the tree first splits legs.
function predictBird(store) {
  act(() => {
    store.dispatch(setTestData('legs', '2'));
    train.onClickPredict();
  });
}

const StoreStepper = ({onReplay}) =>
  createElement(TraceStepper, {
    key: useAppSelector(state => state.predictionCount),
    step: useAppSelector(getPredictionStep),
    stepCount: useAppSelector(state => getPredictionTrace(state).path.length),
    onReplay,
  });

function renderStepper(onReplay = () => {}) {
  I18n.initI18n();
  const store = levelStore({trainer: 'decisionTree'});
  train.reset();
  train.init(store);
  train.onClickTrain();
  predictBird(store);
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(StoreStepper, {onReplay}),
      ),
    ),
  );
  return store;
}

function step(store) {
  return getPredictionStep(store.getState());
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
    vi.unstubAllGlobals();
    I18n.reset();
  });

  it('plays a new prediction one step per interval, then offers a replay', () => {
    const store = renderStepper();

    expect(step(store)).toBe(0);
    expect(button('Skip to the answer')).toBeTruthy();

    advanceOneStep();
    expect(step(store)).toBe(1);

    advanceOneStep();
    expect(step(store)).toBe(2);
    expect(button('Replay from the start')).toBeTruthy();

    advanceOneStep();
    expect(step(store)).toBe(2);
  });

  it('skips straight to the answer', () => {
    const store = renderStepper();

    fireEvent.click(button('Skip to the answer'));
    advanceOneStep();

    expect(step(store)).toBe(2);
    expect(unavailable('Next step')).toBe(true);
    expect(unavailable('Previous step')).toBe(false);
  });

  it('replays from the root', () => {
    const store = renderStepper();
    fireEvent.click(button('Skip to the answer'));

    fireEvent.click(button('Replay from the start'));

    expect(step(store)).toBe(0);
    advanceOneStep();
    expect(step(store)).toBe(1);
  });

  it('plays again when another prediction comes in', () => {
    const store = renderStepper();
    fireEvent.click(button('Skip to the answer'));

    predictBird(store);

    expect(step(store)).toBe(0);
    expect(button('Skip to the answer')).toBeTruthy();
  });

  it('stops playing when the student steps by hand', () => {
    const store = renderStepper();

    fireEvent.click(button('Next step'));
    advanceOneStep();

    expect(step(store)).toBe(1);
    expect(button('Replay from the start')).toBeTruthy();

    fireEvent.click(button('Previous step'));

    expect(step(store)).toBe(0);
    expect(unavailable('Previous step')).toBe(true);
  });

  it('stops where it is when playback is stopped from outside', () => {
    const store = renderStepper();
    advanceOneStep();

    act(() => {
      store.dispatch(setPredictionPlaying(false));
    });
    advanceOneStep();

    expect(step(store)).toBe(1);
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
    const store = renderStepper();
    act(() => button('Previous step').focus());

    fireEvent.click(button('Previous step'));
    fireEvent.click(button('Previous step'));
    fireEvent.click(button('Previous step'));

    expect(step(store)).toBe(0);
    expect(button('Previous step').disabled).toBe(false);
    expect(document.activeElement).toBe(button('Previous step'));
  });

  describe('with reduced motion', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', query => ({
        matches: query.includes('reduce'),
      }));
    });

    it('shows the whole path at once', () => {
      const store = renderStepper();

      expect(store.getState().predictionStep).toBeUndefined();
      expect(step(store)).toBe(2);
      expect(button('Replay from the start')).toBeTruthy();
    });

    it('replays from the root, leaving the stepping to the student', () => {
      const store = renderStepper();

      fireEvent.click(button('Replay from the start'));
      advanceOneStep();

      expect(step(store)).toBe(0);
    });
  });
});

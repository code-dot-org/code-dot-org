import {ThemeProvider} from '@mui/material/styles';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import {useAppSelector} from '../../src/hooks';
import I18n from '../../src/i18n';
import {setTestData} from '../../src/redux';
import {
  getPredictionStep,
  getPredictionTrace,
} from '../../src/selectors/visualizationSelectors';
import train from '../../src/train';
import TraceStepper from '../../src/UIComponents/TraceStepper';

import {levelStore} from './levelStore';

// A bird sits two questions deep whichever way the tree first splits legs.
function predictBird(store) {
  act(() => {
    store.dispatch(setTestData('legs', '2'));
    train.onClickPredict();
  });
}

const StoreStepper = () =>
  createElement(TraceStepper, {
    step: useAppSelector(getPredictionStep),
    stepCount: useAppSelector(state => getPredictionTrace(state).path.length),
  });

function renderStepper() {
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
        createElement(StoreStepper),
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

describe('TraceStepper', () => {
  afterEach(() => I18n.reset());

  it('starts on the answer, at the end of the path', () => {
    const store = renderStepper();

    expect(step(store)).toBe(2);
    expect(unavailable('Next step')).toBe(true);
    expect(unavailable('Previous step')).toBe(false);
  });

  it('steps back to the root and forward again', () => {
    const store = renderStepper();

    fireEvent.click(button('Previous step'));
    fireEvent.click(button('Previous step'));

    expect(step(store)).toBe(0);
    expect(unavailable('Previous step')).toBe(true);

    fireEvent.click(button('Next step'));

    expect(step(store)).toBe(1);
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
});

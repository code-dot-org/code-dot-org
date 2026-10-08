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

const StoreStepper = ({stepLabels}) =>
  createElement(TraceStepper, {
    step: useAppSelector(getPredictionStep),
    stepLabels,
  });

function renderStepper() {
  I18n.initI18n();
  const store = levelStore({trainer: 'decisionTree'});
  train.reset();
  train.init(store);
  train.onClickTrain();
  predictBird(store);
  const stepLabels = getPredictionTrace(store.getState()).path.map(
    (_, index) => `label ${index + 1}`,
  );
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(StoreStepper, {stepLabels}),
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

describe('TraceStepper', () => {
  afterEach(() => I18n.reset());

  it('starts on the answer, at the end of the path', () => {
    const store = renderStepper();

    expect(step(store)).toBe(2);
    expect(button('Next step').disabled).toBe(true);
    expect(button('Previous step').disabled).toBe(false);
  });

  it('steps back to the root and forward again', () => {
    const store = renderStepper();

    fireEvent.click(button('Previous step'));
    fireEvent.click(button('Previous step'));

    expect(step(store)).toBe(0);
    expect(button('Previous step').disabled).toBe(true);

    fireEvent.click(button('Next step'));

    expect(step(store)).toBe(1);
  });

  it('hands focus to the other button when one reaches an end', () => {
    renderStepper();
    act(() => button('Previous step').focus());

    fireEvent.click(button('Previous step'));
    fireEvent.click(button('Previous step'));

    expect(document.activeElement).toBe(button('Next step'));

    fireEvent.click(button('Next step'));
    fireEvent.click(button('Next step'));

    expect(document.activeElement).toBe(button('Previous step'));
  });

  it('announces a step only once the student steps', () => {
    renderStepper();

    expect(screen.getByRole('status').textContent).toBe('');

    fireEvent.click(button('Previous step'));

    expect(screen.getByRole('status').textContent).toBe('Step 2 of 3: label 2');
  });
});

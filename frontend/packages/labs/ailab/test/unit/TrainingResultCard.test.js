import {ThemeProvider} from '@mui/material/styles';
import {act, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import {getCorrectCount} from '../../src/helpers/accuracy';
import {
  removeSelectedFeature,
  setLabelColumn,
  setTrainingModalStep,
} from '../../src/redux';
import train from '../../src/train';
import TrainingResultCard from '../../src/UIComponents/TrainingResultCard';

import {levelStore} from './levelStore';

function renderCard({trained = true} = {}) {
  const store = levelStore({});
  if (trained) {
    train.reset();
    train.init(store);
    train.onClickTrain();
  }
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(TrainingResultCard),
      ),
    ),
  );
  return store;
}

const accuracy = () => screen.queryByText('Accuracy');

describe('TrainingResultCard', () => {
  test('is empty before training', () => {
    renderCard({trained: false});
    expect(accuracy()).toBeNull();
  });

  test('shows accuracy and number correct after training', () => {
    const store = renderCard();
    const {correct, total} = getCorrectCount(store.getState());
    expect(accuracy()).not.toBeNull();
    expect(screen.getByText('Number correct')).not.toBeNull();
    expect(
      screen.getByText(`${Math.round((correct / total) * 100)}%`),
    ).not.toBeNull();
    expect(screen.getByText(`${correct}/${total}`)).not.toBeNull();
  });

  test('stays hidden while the training modal is open', () => {
    const store = renderCard();
    act(() => {
      store.dispatch(setTrainingModalStep('training'));
    });
    expect(accuracy()).toBeNull();
  });

  test('hides once the features change', () => {
    const store = renderCard();
    act(() => {
      store.dispatch(removeSelectedFeature('legs'));
    });
    expect(accuracy()).toBeNull();
  });

  test('hides once the label changes', () => {
    const store = renderCard();
    act(() => {
      store.dispatch(setLabelColumn('legs'));
    });
    expect(accuracy()).toBeNull();
  });
});

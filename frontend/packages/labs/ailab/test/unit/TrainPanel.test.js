import {ThemeProvider} from '@mui/material/styles';
import {act, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import I18n from '../../src/i18n';
import {removeSelectedFeature} from '../../src/redux';
import train from '../../src/train';
import TrainPanel from '../../src/UIComponents/TrainPanel';

import {levelStore} from './levelStore';

function renderPanel({trained = false} = {}) {
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
        createElement(TrainPanel),
      ),
    ),
  );
  return store;
}

const trainButton = () => screen.queryByRole('button', {name: 'Train model'});

describe('TrainPanel', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('shows Train model before training', () => {
    renderPanel();
    expect(trainButton()).not.toBeNull();
  });

  test('hides Train model while the training results show', () => {
    renderPanel({trained: true});
    expect(screen.getByText('Accuracy')).not.toBeNull();
    expect(trainButton()).toBeNull();
  });

  test('brings Train model back once the columns change', () => {
    const store = renderPanel({trained: true});
    act(() => {
      store.dispatch(removeSelectedFeature('legs'));
    });
    expect(trainButton()).not.toBeNull();
  });
});

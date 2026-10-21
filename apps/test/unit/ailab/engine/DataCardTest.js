import {fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';
import {createStore} from 'redux';

import I18n from '@cdo/apps/ailab/engine/i18n';
import rootReducer, {
  setImportedData,
  setSelectedCSV,
} from '@cdo/apps/ailab/engine/redux';
import DataCard from '@cdo/apps/ailab/engine/UIComponents/DataCard';

import {ANIMALS} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

function renderCard({uploaded = false, canUseDataset = false} = {}) {
  const store = createStore(rootReducer);
  const onUseDataset = jest.fn();
  if (uploaded) {
    store.dispatch(setSelectedCSV(new File([''], 'animals.csv')));
    store.dispatch(setImportedData(ANIMALS, true));
  }
  renderWithProviders(createElement(DataCard, {canUseDataset, onUseDataset}), {
    store,
  });
  return onUseDataset;
}

const useButton = () => screen.getByRole('button', {name: 'Use this dataset'});

describe('DataCard', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('shows the empty state until a dataset loads', () => {
    renderCard();
    screen.getByText('No dataset selected');
    expect(useButton().disabled).toBe(true);
  });

  test('describes an upload by its file name and first row', () => {
    renderCard({uploaded: true, canUseDataset: true});
    screen.getByRole('heading', {name: 'animals.csv'});
    screen.getByText(String(ANIMALS.length));
    screen.getByText('Sample row');
    screen.getByText(ANIMALS[0].animal);
  });

  test('uses the dataset when enabled', () => {
    const onUseDataset = renderCard({uploaded: true, canUseDataset: true});
    fireEvent.click(useButton());
    expect(onUseDataset).toHaveBeenCalled();
  });
});

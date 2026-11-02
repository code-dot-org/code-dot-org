import {fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';
import {createStore} from 'redux';

import I18n from '@cdo/apps/ailab/engine/i18n';
import rootReducer, {
  setSelectedCSV,
  setSelectedName,
} from '@cdo/apps/ailab/engine/redux';
import DataCard from '@cdo/apps/ailab/engine/UIComponents/DataCard';

import {ANIMAL_COLUMNS, ANIMALS, seedDataset} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

const CARD = {
  description: 'Facts about animals.',
  lastUpdated: 'May 2024',
  source: 'A local zoo',
  context: {potentialUses: 'Sorting pets', potentialMisuses: 'Ranking pets'},
};

function selectCurated(store) {
  store.dispatch(setSelectedName('Animals'));
  store.dispatch(setSelectedCSV('animals.csv'));
}

function renderCard(setUp = () => {}) {
  const store = createStore(rootReducer);
  setUp(store);
  renderWithProviders(createElement(DataCard), {store});
  return store;
}

const upload = store => {
  store.dispatch(setSelectedCSV(new File([''], 'animals.csv')));
  seedDataset(store, ANIMALS, ANIMAL_COLUMNS);
};

const useButton = () => screen.getByRole('button', {name: 'Use this dataset'});

describe('DataCard', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('shows the empty state until a dataset is selected', () => {
    const store = renderCard();
    screen.getByText('No dataset selected');
    expect(useButton().disabled).toBe(true);
    fireEvent.click(useButton());
    expect(store.getState().currentPanel).toBe('selectDataset');
  });

  test('drops the empty state while a selected dataset loads', () => {
    renderCard(selectCurated);
    expect(screen.queryByText('No dataset selected')).toBeNull();
    expect(useButton().disabled).toBe(true);
  });

  test('describes an upload by its file name and first row', () => {
    renderCard(upload);
    screen.getByRole('heading', {level: 4, name: 'animals.csv'});
    screen.getByText(String(ANIMALS.length));
    screen.getByRole('heading', {level: 5, name: 'Sample row'});
    screen.getByText(ANIMALS[0].animal);
  });

  test('describes a curated dataset from its card', () => {
    renderCard(store => {
      selectCurated(store);
      seedDataset(store, ANIMALS, ANIMAL_COLUMNS, {
        name: 'animals',
        card: CARD,
      });
    });
    screen.getByRole('heading', {level: 4, name: 'Animals'});
    screen.getByRole('heading', {level: 5, name: 'Rows'});
    screen.getByText(CARD.description);
    screen.getByText(CARD.lastUpdated);
    screen.getByText(CARD.source);
    screen.getByText(CARD.context.potentialUses);
    screen.getByText(CARD.context.potentialMisuses);
    expect(screen.queryByText('Sample row')).toBeNull();
  });

  test('moves on to the dataset when enabled', () => {
    const store = renderCard(upload);
    fireEvent.click(useButton());
    expect(store.getState().currentPanel).toBe('datasetView');
  });
});

import {fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';
import {createStore} from 'redux';

import I18n from '@cdo/apps/ailab/engine/i18n';
import rootReducer, {setSelectedCSV} from '@cdo/apps/ailab/engine/redux';
import SelectDataset from '@cdo/apps/ailab/engine/UIComponents/SelectDataset';

import {renderWithProviders} from './renderWithProviders';

function renderPicker(csvfile) {
  const store = createStore(rootReducer);
  if (csvfile) {
    store.dispatch(setSelectedCSV(csvfile));
  }
  return renderWithProviders(createElement(SelectDataset), {store});
}

describe('SelectDataset', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('shows no file chip for a curated dataset', () => {
    renderPicker('datasets/songs.csv');
    expect(screen.queryByRole('button', {name: /^Remove /})).toBeNull();
  });

  test('shows the uploaded file and clears it on remove', () => {
    const {store} = renderPicker(new File(['a,b\n1,2'], 'mydataset.csv'));
    fireEvent.click(screen.getByRole('button', {name: 'Remove mydataset.csv'}));
    expect(store.getState().csvfile).toBeUndefined();
    expect(
      screen.queryByRole('button', {name: 'Remove mydataset.csv'})
    ).toBeNull();
  });
});

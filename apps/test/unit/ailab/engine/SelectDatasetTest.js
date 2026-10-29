import {act, fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';
import {createStore} from 'redux';

import {getAvailableDatasets} from '@cdo/apps/ailab/engine/datasetManifest';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {loadUploadedDataset} from '@cdo/apps/ailab/engine/loadDataset';
import rootReducer, {
  setInvalidData,
  setSelectedCSV,
} from '@cdo/apps/ailab/engine/redux';
import SelectDataset from '@cdo/apps/ailab/engine/UIComponents/SelectDataset';

import {renderWithProviders} from './renderWithProviders';

jest.mock('@cdo/apps/ailab/engine/loadDataset');

const UPLOAD_NAME = 'mydataset.csv';

function renderPicker(csvfile) {
  const store = createStore(rootReducer);
  if (csvfile) {
    store.dispatch(setSelectedCSV(csvfile));
  }
  return renderWithProviders(createElement(SelectDataset), {store});
}

const chip = () => screen.queryByRole('button', {name: UPLOAD_NAME});
const removeButton = () =>
  screen.queryByRole('button', {name: `Remove ${UPLOAD_NAME}`});
const clickFirstTile = () =>
  fireEvent.click(
    screen.getByText(getAvailableDatasets()[0].name).closest('button')
  );

describe('SelectDataset', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => {
    I18n.reset();
    jest.clearAllMocks();
  });

  test('shows no file chip for a curated dataset', () => {
    renderPicker('datasets/songs.csv');
    expect(screen.queryByRole('button', {name: /^Remove /})).toBeNull();
  });

  test('selects a newly uploaded file', () => {
    const {container, store} = renderPicker();
    const file = new File(['a,b\n1,2'], UPLOAD_NAME);
    // The file input hides behind the Upload button, out of reach of role queries.
    // eslint-disable-next-line no-restricted-properties
    fireEvent.change(container.querySelector('input[type="file"]'), {
      target: {files: [file]},
    });
    expect(store.getState().csvfile).toBe(file);
    expect(loadUploadedDataset).toHaveBeenCalledWith(file);
    expect(chip().getAttribute('aria-pressed')).toBe('true');
  });

  test('keeps the upload while browsing our datasets', () => {
    const {store} = renderPicker(new File(['a,b\n1,2'], UPLOAD_NAME));
    clickFirstTile();
    expect(typeof store.getState().csvfile).toBe('string');
    expect(chip().getAttribute('aria-pressed')).toBe('false');
  });

  test('reselects the upload from the chip', () => {
    const file = new File(['a,b\n1,2'], UPLOAD_NAME);
    const {store} = renderPicker(file);
    clickFirstTile();
    fireEvent.click(chip());
    expect(store.getState().csvfile).toBe(file);
    expect(loadUploadedDataset).toHaveBeenCalledWith(file);
  });

  test('clears the selected upload on remove', () => {
    const {store} = renderPicker(new File(['a,b\n1,2'], UPLOAD_NAME));
    fireEvent.click(removeButton());
    expect(store.getState().csvfile).toBeUndefined();
    expect(removeButton()).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: /^Upload/})
    );
  });

  test('keeps our selected dataset when removing the upload', () => {
    const {store} = renderPicker(new File(['a,b\n1,2'], UPLOAD_NAME));
    clickFirstTile();
    const csvfile = store.getState().csvfile;
    fireEvent.click(removeButton());
    expect(store.getState().csvfile).toBe(csvfile);
    expect(removeButton()).toBeNull();
  });

  test('drops a rejected upload', () => {
    const {store} = renderPicker(new File(['a,b'], UPLOAD_NAME));
    act(() => store.dispatch(setInvalidData('tooFewRows')));
    expect(removeButton()).toBeNull();
    clickFirstTile();
    expect(removeButton()).toBeNull();
  });
});

import {act, screen} from '@testing-library/react';
import React from 'react';

import AilabEngine from '@cdo/apps/ailab/engine/AilabEngine';
import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {loadLevel} from '@cdo/apps/ailab/engine/levelLoad';
import {store} from '@cdo/apps/ailab/engine/store';

import {seedDataset} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

jest.mock('@cdo/apps/ailab/engine/loadDataset');

afterEach(() => I18n.reset());

// The component suites render panels directly, so only this reaches the whole
// app. The providers and the level load come from the host in production.
test('renders the app for a loaded level', () => {
  renderWithProviders(
    <AilabEngine
      assetPath="./"
      onContinue={() => {}}
      saveTrainedModel={() => {}}
    />,
    {store}
  );
  act(() => loadLevel({datasets: ['songs']}));
  act(() =>
    seedDataset(store, [{artist: 'a', year: '2001'}], {
      artist: ColumnTypes.CATEGORICAL,
      year: ColumnTypes.CATEGORICAL,
    })
  );

  expect(screen.getByRole('combobox', {name: 'Predict'})).not.toBeNull();
});

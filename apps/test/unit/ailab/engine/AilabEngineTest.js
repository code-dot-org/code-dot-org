import {render, screen} from '@testing-library/react';
import React from 'react';

import AilabEngine from '@cdo/apps/ailab/engine/AilabEngine';
import I18n from '@cdo/apps/ailab/engine/i18n';

import {withTheme} from './renderWithProviders';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper');
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper');

afterEach(() => I18n.reset());

// The component suites render panels directly, so only this reaches the
// provider nesting AilabEngine supplies.
test('renders the app under the training data provider', () => {
  render(
    withTheme(
      <AilabEngine
        assetPath="./"
        mode={{datasets: ['songs']}}
        onContinue={() => {}}
        saveTrainedModel={() => {}}
      />
    )
  );

  expect(screen.getByRole('combobox', {name: 'Predict'})).not.toBeNull();
});

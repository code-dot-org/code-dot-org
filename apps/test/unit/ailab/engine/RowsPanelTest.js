import {fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '@cdo/apps/ailab/engine/i18n';
import RowsPanel from '@cdo/apps/ailab/engine/UIComponents/RowsPanel';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

function renderPanel(props = {}) {
  renderWithProviders(
    createElement(RowsPanel, {
      description: 'Rows at this step',
      rowIndices: [0, 1, 2, 3, 4],
      showAllColumns: true,
      onToggleColumns: () => {},
      ...props,
    }),
    {store: levelStore(), project: levelProject()}
  );
}

const rowNumbers = () =>
  Array.from(document.querySelectorAll('tbody th'), cell => cell.textContent);

describe('RowsPanel', () => {
  beforeAll(() => I18n.initI18n());

  test('sorts the rows and keeps each its dataset number', () => {
    renderPanel();
    fireEvent.click(
      screen.getByRole('button', {name: 'Sort by legs low to high'})
    );
    expect(rowNumbers()).toEqual(['3', '1', '4', '2', '5']);
  });

  test("offers no sort on a node's single prediction", () => {
    renderPanel({prediction: 'bird'});
    expect(
      screen.getByRole('columnheader', {name: 'AI predicts'})
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', {name: /^Sort by AI prediction/})
    ).toBeNull();
  });
});

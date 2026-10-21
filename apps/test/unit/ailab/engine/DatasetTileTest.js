import {fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';

import DatasetTile from '@cdo/apps/ailab/engine/UIComponents/DatasetTile';

import {withTheme} from './renderWithProviders';

function renderTile(props = {}) {
  return render(
    withTheme(
      createElement(DatasetTile, {
        name: 'Exoplanets',
        imageSrc: 'exoplanets.jpg',
        rowCount: 2789,
        isSelected: false,
        onClick: () => {},
        ...props,
      })
    )
  );
}

describe('DatasetTile', () => {
  test('reports its selection as pressed', () => {
    renderTile({isSelected: true});
    expect(
      screen
        .getByRole('button', {name: /^Exoplanets/})
        .getAttribute('aria-pressed')
    ).toBe('true');
  });

  test('shows the placeholder when there is no image', () => {
    renderTile({imageSrc: undefined});
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('falls back to the placeholder when the image fails to load', () => {
    renderTile();
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('shows the row count', () => {
    renderTile();
    screen.getByText('2,789 rows');
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    renderTile({onClick});
    fireEvent.click(screen.getByRole('button', {name: /^Exoplanets/}));
    expect(onClick).toHaveBeenCalled();
  });
});

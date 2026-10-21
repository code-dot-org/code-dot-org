import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {createElement} from 'react';

import DatasetTile from '@cdo/apps/ailab/engine/UIComponents/DatasetTile';

import {withTheme} from './renderWithProviders';

import './stubPseudoClasses';

function cutOffNames() {
  jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(120);
  jest.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(60);
}

const tooltip = () => screen.queryByRole('tooltip', {hidden: true});

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

  describe('name tooltip', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('shows the whole name on hover when it is cut off', () => {
      cutOffNames();
      const {container} = renderTile();

      fireEvent.mouseOver(within(container).getByText('Exoplanets'));
      act(() => jest.advanceTimersByTime(1000));

      expect(tooltip().textContent).toBe('Exoplanets');
    });

    test('shows the whole name while the tile has keyboard focus', () => {
      cutOffNames();
      renderTile();

      act(() => screen.getByRole('button', {name: /^Exoplanets/}).focus());

      expect(tooltip().textContent).toBe('Exoplanets');
    });

    test('stays closed when the name fits', () => {
      renderTile();

      fireEvent.mouseOver(screen.getByText('Exoplanets'));
      act(() => jest.advanceTimersByTime(1000));

      expect(tooltip()).toBeNull();
    });
  });
});

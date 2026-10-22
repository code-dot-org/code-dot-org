import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';

import UploadedFileChip from '@cdo/apps/ailab/engine/UIComponents/UploadedFileChip';

import {withTheme} from './renderWithProviders';

import './stubPseudoClasses';

const FILE_NAME = 'a-very-long-dataset-name.csv';

function cutOffNames() {
  jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(120);
  jest.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(60);
}

const tooltip = () => screen.queryByRole('tooltip', {hidden: true});
const chip = () => screen.getByRole('button', {name: FILE_NAME});
const removeButton = () =>
  screen.getByRole('button', {name: `Remove ${FILE_NAME}`});

function renderChip(props = {}) {
  return render(
    withTheme(
      createElement(UploadedFileChip, {
        fileName: FILE_NAME,
        isSelected: false,
        onSelect: () => {},
        onRemove: () => {},
        ...props,
      })
    )
  );
}

describe('UploadedFileChip', () => {
  test('selects the upload when the file name is clicked', () => {
    const onSelect = jest.fn();
    const onRemove = jest.fn();
    renderChip({onSelect, onRemove});
    fireEvent.click(screen.getByText(FILE_NAME));
    expect(onSelect).toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  test('removes the upload only from the x', () => {
    const onSelect = jest.fn();
    const onRemove = jest.fn();
    renderChip({onSelect, onRemove});
    fireEvent.click(removeButton());
    expect(onRemove).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('reports when the upload is the selected dataset', () => {
    renderChip({isSelected: true});
    expect(chip().getAttribute('aria-pressed')).toBe('true');
  });

  describe('file name tooltip', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('shows the whole name on hover when it is cut off', () => {
      cutOffNames();
      renderChip();

      fireEvent.mouseOver(screen.getByText(FILE_NAME));
      act(() => jest.advanceTimersByTime(1000));

      expect(tooltip().textContent).toBe(FILE_NAME);
    });

    test('shows the whole name while the chip has keyboard focus', () => {
      cutOffNames();
      renderChip();

      act(() => chip().focus());

      expect(tooltip().textContent).toBe(FILE_NAME);
    });

    test('stays closed when the name fits', () => {
      renderChip();

      fireEvent.mouseOver(screen.getByText(FILE_NAME));
      act(() => jest.advanceTimersByTime(1000));

      expect(tooltip()).toBeNull();
    });
  });
});

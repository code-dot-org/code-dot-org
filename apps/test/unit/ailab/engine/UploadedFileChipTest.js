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
const chip = () => screen.getByRole('button', {name: `Remove ${FILE_NAME}`});

function renderChip(onRemove = () => {}) {
  return render(
    withTheme(createElement(UploadedFileChip, {fileName: FILE_NAME, onRemove}))
  );
}

describe('UploadedFileChip', () => {
  test('calls onRemove when clicked', () => {
    const onRemove = jest.fn();
    renderChip(onRemove);
    fireEvent.click(chip());
    expect(onRemove).toHaveBeenCalled();
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

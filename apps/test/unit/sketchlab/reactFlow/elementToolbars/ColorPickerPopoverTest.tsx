import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ColorPickerPopover from '@cdo/apps/sketchlab/reactFlow/elementToolbars/components/ColorPickerPopover';
import {ColorSwatch} from '@cdo/apps/sketchlab/reactFlow/elementToolbars/toolbarPalettes';

const SWATCHES: ColorSwatch[] = [
  {value: 'red', label: 'Red'},
  {value: 'green', label: 'Green'},
  {value: 'blue', label: 'Blue'},
  {value: 'transparent', label: 'Clear', transparent: true},
  {
    value: 'default',
    label: 'Black',
    darkModeLabel: 'White',
  },
];

interface RenderOptions {
  selectedValue?: string;
  onSelect?: (value: string) => void;
  onClose?: () => void;
  swatches?: ColorSwatch[];
}

function renderPopover({
  selectedValue,
  onSelect = jest.fn(),
  onClose = jest.fn(),
  swatches = SWATCHES,
}: RenderOptions = {}) {
  return render(
    <ThemeProvider>
      <ColorPickerPopover
        groupLabel="Color"
        swatches={swatches}
        selectedValue={selectedValue}
        onSelect={onSelect}
        onClose={onClose}
      />
    </ThemeProvider>
  );
}

describe('ColorPickerPopover', () => {
  describe('rendering', () => {
    it('renders one button per swatch plus a custom color input', () => {
      renderPopover();
      SWATCHES.forEach(swatch => {
        expect(
          screen.getByRole('button', {name: `Color: ${swatch.label}`})
        ).toBeInTheDocument();
      });
      expect(screen.getByLabelText('Color: Custom color')).toBeInTheDocument();
    });

    it('marks the swatch matching selectedValue with aria-pressed=true', () => {
      renderPopover({selectedValue: 'green'});
      expect(
        screen.getByRole('button', {name: 'Color: Green'})
      ).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', {name: 'Color: Red'})).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('uses the light-mode label by default for swatches with a darkModeLabel', () => {
      renderPopover();
      expect(
        screen.getByRole('button', {name: 'Color: Black'})
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Color: White'})
      ).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onSelect with the swatch value and onClose when a swatch is clicked', async () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      renderPopover({onSelect, onClose});
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', {name: 'Color: Blue'}));
      expect(onSelect).toHaveBeenCalledWith('blue');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect with the typed hex when the custom color input changes', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      renderPopover({onSelect, onClose});
      // The native color input is hidden inside the custom swatch label.
      const customInput = screen.getByLabelText(
        'Color: Custom color'
      ) as HTMLInputElement;
      fireEvent.change(customInput, {target: {value: '#abcdef'}});
      expect(onSelect).toHaveBeenCalledWith('#abcdef');
      // The native color input fires onChange continuously while the user
      // drags; closing per-change would dismiss the picker mid-edit.
      expect(onClose).not.toHaveBeenCalled();
    });

    it('treats a hex selectedValue as the custom swatch being selected', () => {
      renderPopover({selectedValue: '#123456'});
      SWATCHES.forEach(swatch => {
        expect(
          screen.getByRole('button', {name: `Color: ${swatch.label}`})
        ).toHaveAttribute('aria-pressed', 'false');
      });
      // The palette icon is the visual cue that no preset is selected; with
      // a custom color picked it should be removed in favor of the actual
      // hex preview.
      expect(screen.queryByLabelText('palette')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('focuses the selected swatch on mount', () => {
      renderPopover({selectedValue: 'green'});
      expect(document.activeElement).toBe(
        screen.getByRole('button', {name: 'Color: Green'})
      );
    });

    it('focuses the first swatch on mount when nothing is selected', () => {
      renderPopover();
      expect(document.activeElement).toBe(
        screen.getByRole('button', {name: 'Color: Red'})
      );
    });

    it('ArrowRight moves focus to the next swatch', () => {
      renderPopover({selectedValue: 'red'});
      const red = screen.getByRole('button', {name: 'Color: Red'});
      fireEvent.keyDown(red, {key: 'ArrowRight'});
      expect(document.activeElement).toBe(
        screen.getByRole('button', {name: 'Color: Green'})
      );
    });

    it('ArrowLeft moves focus to the previous swatch', () => {
      renderPopover({selectedValue: 'green'});
      const green = screen.getByRole('button', {name: 'Color: Green'});
      fireEvent.keyDown(green, {key: 'ArrowLeft'});
      expect(document.activeElement).toBe(
        screen.getByRole('button', {name: 'Color: Red'})
      );
    });

    it('ArrowDown jumps forward by SWATCH_COLUMNS (5)', () => {
      // SWATCHES has length 5 → ArrowDown from index 0 lands on the custom
      // color input at index 5.
      renderPopover({selectedValue: 'red'});
      const red = screen.getByRole('button', {name: 'Color: Red'});
      fireEvent.keyDown(red, {key: 'ArrowDown'});
      expect(document.activeElement).toBe(
        screen.getByLabelText('Color: Custom color')
      );
    });

    it('ArrowUp jumps backward by SWATCH_COLUMNS (5)', () => {
      renderPopover({selectedValue: 'red'});
      // Manually focus the custom-color input first.
      const customInput = screen.getByLabelText('Color: Custom color');
      customInput.focus();
      fireEvent.keyDown(customInput, {key: 'ArrowUp'});
      expect(document.activeElement).toBe(
        screen.getByRole('button', {name: 'Color: Red'})
      );
    });

    it('ignores arrow key presses that would move focus out of the grid', () => {
      renderPopover({selectedValue: 'red'});
      const red = screen.getByRole('button', {name: 'Color: Red'});
      fireEvent.keyDown(red, {key: 'ArrowLeft'});
      expect(document.activeElement).toBe(red);
    });

    it('ignores non-arrow keys', () => {
      renderPopover({selectedValue: 'red'});
      const red = screen.getByRole('button', {name: 'Color: Red'});
      fireEvent.keyDown(red, {key: 'Enter'});
      expect(document.activeElement).toBe(red);
    });
  });
});

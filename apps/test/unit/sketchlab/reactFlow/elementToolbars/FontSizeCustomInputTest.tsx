import {MenuList} from '@mui/material';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import FontSizeCustomInput from '@cdo/apps/sketchlab/reactFlow/elementToolbars/components/FontSizeCustomInput';
import {
  FontSize,
  MIN_FONT_SIZE_PX,
} from '@cdo/apps/sketchlab/reactFlow/elementToolbars/toolbarPalettes';

interface RenderOptions {
  selectedValue?: FontSize;
  isSelected?: boolean;
  onSelect?: (value: number) => void;
  onClose?: () => void;
}

function renderInput({
  selectedValue,
  isSelected = false,
  onSelect = jest.fn(),
  onClose = jest.fn(),
}: RenderOptions = {}) {
  return render(
    <MenuList>
      <FontSizeCustomInput
        selectedValue={selectedValue}
        onSelect={onSelect}
        onClose={onClose}
        isSelected={isSelected}
      />
    </MenuList>
  );
}

function getInput(): HTMLInputElement {
  return screen.getByLabelText('Font size in pixels') as HTMLInputElement;
}

describe('FontSizeCustomInput', () => {
  describe('displayed value', () => {
    it('shows the number when selectedValue is a custom pixel value', () => {
      renderInput({selectedValue: 24, isSelected: true});
      expect(getInput().value).toBe('24');
    });

    it('is blank when selectedValue is a named preset', () => {
      renderInput({selectedValue: 'medium', isSelected: false});
      expect(getInput().value).toBe('');
    });

    it('is blank when selectedValue is undefined', () => {
      renderInput({selectedValue: undefined, isSelected: false});
      expect(getInput().value).toBe('');
    });

    it('syncs the displayed value after the prop changes (when not focused)', () => {
      const {rerender} = renderInput({selectedValue: 18, isSelected: true});
      expect(getInput().value).toBe('18');
      rerender(
        <MenuList>
          <FontSizeCustomInput
            selectedValue={22}
            onSelect={jest.fn()}
            onClose={jest.fn()}
            isSelected={true}
          />
        </MenuList>
      );
      expect(getInput().value).toBe('22');
    });

    it('does not overwrite the field while the user is typing in it', () => {
      const {rerender} = renderInput({selectedValue: 18, isSelected: true});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: '7'}});
      // External update arrives mid-edit.
      rerender(
        <MenuList>
          <FontSizeCustomInput
            selectedValue={50}
            onSelect={jest.fn()}
            onClose={jest.fn()}
            isSelected={true}
          />
        </MenuList>
      );
      expect(getInput().value).toBe('7');
    });
  });

  describe('blur commit', () => {
    it('calls onSelect with the parsed number on blur', () => {
      const onSelect = jest.fn();
      renderInput({selectedValue: 20, isSelected: true, onSelect});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: '32'}});
      fireEvent.blur(input);
      expect(onSelect).toHaveBeenCalledWith(32);
    });

    it('clamps values below MIN_FONT_SIZE_PX up to the minimum', () => {
      const onSelect = jest.fn();
      renderInput({selectedValue: 20, isSelected: true, onSelect});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: '2'}});
      fireEvent.blur(input);
      expect(onSelect).toHaveBeenCalledWith(MIN_FONT_SIZE_PX);
    });

    it('does not call onSelect when the blurred value equals the current value', () => {
      const onSelect = jest.fn();
      renderInput({selectedValue: 24, isSelected: true, onSelect});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: '24'}});
      fireEvent.blur(input);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('reverts to the saved value and skips onSelect when blurred while empty', () => {
      const onSelect = jest.fn();
      renderInput({selectedValue: 24, isSelected: true, onSelect});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: ''}});
      fireEvent.blur(input);
      expect(onSelect).not.toHaveBeenCalled();
      expect(input.value).toBe('24');
    });

    it('reverts to blank when blurred empty with no saved custom value', () => {
      const onSelect = jest.fn();
      renderInput({selectedValue: 'medium', isSelected: false, onSelect});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: ''}});
      fireEvent.blur(input);
      expect(onSelect).not.toHaveBeenCalled();
      expect(input.value).toBe('');
    });
  });

  describe('Enter key', () => {
    it('blurs the input and calls onClose on Enter', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      renderInput({
        selectedValue: 20,
        isSelected: true,
        onSelect,
        onClose,
      });
      const input = getInput();
      // Focus the input via the DOM so `event.target.blur()` inside the
      // keydown handler actually fires a blur event.
      input.focus();
      fireEvent.change(input, {target: {value: '40'}});
      fireEvent.keyDown(input, {key: 'Enter'});
      expect(onSelect).toHaveBeenCalledWith(40);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

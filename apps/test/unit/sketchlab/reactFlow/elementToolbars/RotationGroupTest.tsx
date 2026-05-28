import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import RotationGroup from '@cdo/apps/sketchlab/reactFlow/elementToolbars/sections/RotationGroup';

interface RenderOptions {
  value?: number;
  onChange?: (degrees: number) => void;
}

function renderGroup({value = 0, onChange = jest.fn()}: RenderOptions = {}) {
  return render(<RotationGroup value={value} onChange={onChange} />);
}

// Mirror what a real parent does: feed the latest committed degrees back
// in as `value`. The blur path normalizes against the *current* value, so
// without this any assertion about the displayed value snaps back to the
// stale saved value the moment the input loses focus.
function ControlledRotationGroup({
  initial,
  onChange,
}: {
  initial: number;
  onChange?: (degrees: number) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <RotationGroup
      value={value}
      onChange={next => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

function getInput(): HTMLInputElement {
  return screen.getByLabelText('Rotation in degrees') as HTMLInputElement;
}

function getSlider(): HTMLInputElement {
  // MUI's Slider exposes an internal input with role="slider".
  return screen.getByRole('slider') as HTMLInputElement;
}

describe('RotationGroup', () => {
  describe('value normalization', () => {
    it('passes the value through unchanged when already in [0, 359]', () => {
      renderGroup({value: 90});
      expect(getInput().value).toBe('90');
      expect(getSlider().getAttribute('aria-valuenow')).toBe('90');
    });

    it('wraps values >= 360 into 0..359', () => {
      renderGroup({value: 450});
      expect(getInput().value).toBe('90');
    });

    it('wraps negative values into 0..359', () => {
      renderGroup({value: -45});
      expect(getInput().value).toBe('315');
    });

    it('falls back to the default when value is non-finite', () => {
      renderGroup({value: Number.NaN});
      // DEFAULT_ROTATION is 0.
      expect(getInput().value).toBe('0');
    });
  });

  describe('input editing', () => {
    it('calls onChange with the normalized value when a valid number is typed', () => {
      const onChange = jest.fn();
      renderGroup({value: 0, onChange});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: '120'}});
      expect(onChange).toHaveBeenCalledWith(120);
    });

    it('does not call onChange when the field is empty', () => {
      const onChange = jest.fn();
      renderGroup({value: 90, onChange});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: ''}});
      expect(onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('');
    });

    it('normalizes typed values into 0..359 before reporting them', () => {
      const onChange = jest.fn();
      renderGroup({value: 0, onChange});
      const input = getInput();
      fireEvent.focus(input);
      // 480 → 120 (and the current value is 0, so onChange fires).
      fireEvent.change(input, {target: {value: '480'}});
      expect(onChange).toHaveBeenCalledWith(120);
    });

    it('skips onChange when the normalized typed value equals the current value', () => {
      const onChange = jest.fn();
      renderGroup({value: 90, onChange});
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: '90'}});
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('blur behavior', () => {
    it('normalizes the displayed value on blur (-45 → "315")', () => {
      // Use a controlled wrapper so the displayed value reflects the
      // committed onChange instead of snapping back to the stale prop.
      render(<ControlledRotationGroup initial={0} />);
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: '-45'}});
      fireEvent.blur(input);
      expect(input.value).toBe('315');
    });

    it('resets the field to the saved value if blurred while empty', () => {
      render(<ControlledRotationGroup initial={90} />);
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, {target: {value: ''}});
      fireEvent.blur(input);
      expect(input.value).toBe('90');
    });
  });

  describe('Enter key', () => {
    it('blurs the input on Enter', () => {
      renderGroup({value: 0});
      const input = getInput();
      input.focus();
      fireEvent.change(input, {target: {value: '180'}});
      fireEvent.keyDown(input, {key: 'Enter'});
      expect(document.activeElement).not.toBe(input);
    });
  });

  describe('slider', () => {
    it('calls onChange with the normalized slider value', () => {
      const onChange = jest.fn();
      renderGroup({value: 0, onChange});
      // MUI Slider's change handler reads the value off the input.
      fireEvent.change(getSlider(), {target: {value: 200}});
      expect(onChange).toHaveBeenCalledWith(200);
    });
  });
});

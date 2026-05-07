import TextField from '@code-dot-org/component-library/textField';
import {Slider, Typography} from '@mui/material';
import React, {useCallback, useEffect, useId, useState} from 'react';

import {DEFAULT_ROTATION} from '../constants';

import styles from './element-toolbar.module.scss';

export const ROTATION_MIN = 0;
export const ROTATION_MAX = 359;
export const ROTATION_STEP = 1;

// Wrap any input (slider value, raw user-typed number, negative numbers,
// values >= 360) into a normalized 0-359 range.
function normalizeRotation(raw: number): number {
  if (!Number.isFinite(raw)) {
    return DEFAULT_ROTATION;
  }
  return ((Math.round(raw) % 360) + 360) % 360;
}

export interface RotationGroupProps {
  value: number;
  onChange: (degrees: number) => void;
}

export default function RotationGroup({value, onChange}: RotationGroupProps) {
  const groupLabelId = useId();
  // Persisted node data may include out-of-range numbers, which would
  // trigger an MUI min/max warning and odd thumb behavior on the Slider.
  // Therefore, we normalize the value before passing it to the Slider.
  const normalizedValue = normalizeRotation(value);
  // Local editable string so users can type partials ("", "-", leading
  // zeros) without the normalized value overriding their input mid-edit.
  const [inputValue, setInputValue] = useState(String(normalizedValue));
  const [isFocused, setIsFocused] = useState(false);

  // Sync display to the normalized value, but only while the input is not
  // focused.
  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(normalizedValue));
    }
  }, [normalizedValue, isFocused]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setInputValue(next);
      // Skip committing on partial input so the user can type a leading
      // minus or briefly empty the field without us changing the slider.
      if (next === '' || next === '-') {
        return;
      }
      const parsed = Number.parseInt(next, 10);
      if (!Number.isFinite(parsed)) {
        return;
      }
      const normalized = normalizeRotation(parsed);
      if (normalized !== normalizedValue) {
        onChange(normalized);
      }
    },
    [onChange, normalizedValue]
  );

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    // On exit, normalize what's displayed (e.g. "045" -> "45", "-4" -> "356")
    // or reset to the last known value if the field was left non-numeric.
    const parsed = Number.parseInt(inputValue, 10);
    if (Number.isFinite(parsed)) {
      setInputValue(String(normalizeRotation(parsed)));
    } else {
      setInputValue(String(normalizedValue));
    }
  }, [inputValue, normalizedValue]);

  const handleSliderChange = useCallback(
    (_: Event, sliderValue: number) => {
      onChange(normalizeRotation(sliderValue));
    },
    [onChange]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Remove focus from the input box on enter.
      if (event.key === 'Enter') {
        event.preventDefault();
        (event.target as HTMLInputElement).blur();
      }
    },
    []
  );

  return (
    <div className={styles.group} role="group" aria-labelledby={groupLabelId}>
      <Typography
        id={groupLabelId}
        variant="overline3"
        className={styles.groupLabel}
      >
        Rotation
      </Typography>
      {/*
       * React Flow opts elements out of canvas panning when they (or their
       * descendants) carry the `nopan` class. Without it a slider drag pans
       * the workspace instead of moving the thumb.
       */}
      <div className={`${styles.rotationRow} nopan`}>
        <Slider
          className={styles.rotationSlider}
          size="small"
          min={ROTATION_MIN}
          max={ROTATION_MAX}
          step={ROTATION_STEP}
          value={normalizedValue}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={sliderValue => `${sliderValue}°`}
          aria-labelledby={groupLabelId}
          getAriaValueText={sliderValue => `${sliderValue} degrees`}
        />
        <TextField
          name="rotation-degrees"
          aria-label="Rotation in degrees"
          inputType="number"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          size="s"
          className={styles.smallInput}
        />
      </div>
    </div>
  );
}

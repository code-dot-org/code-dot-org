import TextField from '@code-dot-org/component-library/textField';
import {Slider, Typography} from '@mui/material';
import React, {useCallback, useEffect, useId, useState} from 'react';

import styles from './element-toolbar.module.scss';

export const ROTATION_MIN = 0;
export const ROTATION_MAX = 359;
export const ROTATION_STEP = 1;
export const DEFAULT_ROTATION = 0;

// Wrap any input (slider value, raw user-typed number, negative numbers,
// values >= 360) into the canonical 0-359 range used by the rest of the lab.
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
  // Keep an editable string for the numeric input so users can type/clear
  // freely. We commit (and normalize) on blur or Enter.
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const commitInput = useCallback(() => {
    const parsed = Number.parseInt(inputValue, 10);
    const normalized = Number.isFinite(parsed)
      ? normalizeRotation(parsed)
      : value;
    if (normalized !== value) {
      onChange(normalized);
    } else {
      // Revert any non-numeric typing back to the current canonical value.
      setInputValue(String(value));
    }
  }, [inputValue, onChange, value]);

  const handleSliderChange = useCallback(
    (_: Event, sliderValue: number | number[]) => {
      const next = Array.isArray(sliderValue) ? sliderValue[0] : sliderValue;
      onChange(normalizeRotation(next));
    },
    [onChange]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitInput();
        (event.target as HTMLInputElement).blur();
      }
    },
    [commitInput]
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
      <div className={styles.rotationRow}>
        <Slider
          className={styles.rotationSlider}
          size="small"
          min={ROTATION_MIN}
          max={ROTATION_MAX}
          step={ROTATION_STEP}
          value={value}
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
          onChange={event => setInputValue(event.target.value)}
          onBlur={commitInput}
          onKeyDown={handleInputKeyDown}
          size="s"
          className={styles.rotationInput}
        />
      </div>
    </div>
  );
}

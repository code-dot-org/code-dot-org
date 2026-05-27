import TextField from '@code-dot-org/component-library/textField';
import {MenuItem, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {FontSize, MIN_FONT_SIZE_PX} from './toolbarPalettes';

import sharedStyles from './element-toolbar.module.scss';
import styles from './font-size-custom-input.module.scss';

interface FontSizeCustomInputProps {
  selectedValue: FontSize | undefined;
  onSelect: (value: number) => void;
  isSelected: boolean;
}

// Custom font-size input. Blank when a preset is selected; commits on
// blur or Enter.
export default function FontSizeCustomInput({
  selectedValue,
  onSelect,
  isSelected,
}: FontSizeCustomInputProps) {
  const displayValue =
    typeof selectedValue === 'number' ? String(selectedValue) : '';
  const [inputValue, setInputValue] = useState(displayValue);
  const [isFocused, setIsFocused] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);

  // Sync the field to the saved value when not focused.
  useEffect(() => {
    if (!isFocused) {
      setInputValue(displayValue);
    }
  }, [displayValue, isFocused]);

  // Forward focus from the MenuItem wrapper to the inner input.
  const focusInput = useCallback(() => {
    rootRef.current?.querySelector('input')?.focus();
  }, []);

  const handleRootFocus = useCallback(
    (event: React.FocusEvent<HTMLLIElement>) => {
      // Skip events bubbled from the input child.
      if (event.target === event.currentTarget) {
        focusInput();
      }
    },
    [focusInput]
  );

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = Number.parseInt(inputValue, 10);
    if (!Number.isFinite(parsed)) {
      // Invalid or empty — revert to the saved value.
      setInputValue(displayValue);
      return;
    }
    const clamped = Math.max(parsed, MIN_FONT_SIZE_PX);
    if (clamped !== selectedValue) {
      onSelect(clamped);
    }
    setInputValue(String(clamped));
  }, [inputValue, displayValue, selectedValue, onSelect]);

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        (event.target as HTMLInputElement).blur();
      }
    },
    []
  );

  return (
    <MenuItem
      ref={rootRef}
      className={classNames(styles.customOptionRow, {
        [styles.customOptionRowSelected]: isSelected,
      })}
      onClick={focusInput}
      onFocus={handleRootFocus}
    >
      <Typography
        variant="body4"
        className={isSelected ? styles.customOptionLabelSelected : undefined}
      >
        Custom
      </Typography>
      <TextField
        name="font-size-px"
        aria-label="Font size in pixels"
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        size="s"
        className={sharedStyles.smallInput}
      />
    </MenuItem>
  );
}

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

// Inline Custom-px input rendered as the last item in the Size popover.
// Using <MenuItem> as the root means MUI's MenuList includes the row in its
// arrow-key navigation — arrowing down past the last preset lands here.
// Stays blank while a preset (Small/Medium/...) is the active size, so the
// user can click in and type a fresh value without the preset's px first
// loading into the field and getting clamped by partial backspace edits.
// Only fills the input when the saved font size IS already a custom number.
// Commit happens on blur or Enter — never per-keystroke — so transient
// values during typing don't snap the canvas font size.
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

  // Sync the field to the saved value when not focused, so external
  // changes (e.g. picking a preset in the list above) are reflected.
  useEffect(() => {
    if (!isFocused) {
      setInputValue(displayValue);
    }
  }, [displayValue, isFocused]);

  // Forward focus from the MenuItem wrapper to the inner input so the
  // user can start typing immediately on arrow-down or row click. The
  // MenuItem itself is never the intended focus stop — it only exists so
  // MUI's MenuList includes the row in arrow-key navigation.
  const focusInput = useCallback(() => {
    rootRef.current?.querySelector('input')?.focus();
  }, []);

  const handleRootFocus = useCallback(
    (event: React.FocusEvent<HTMLLIElement>) => {
      // event.target === currentTarget only when the MenuItem itself
      // received focus (e.g. via arrow keys). Skip when focus bubbled up
      // from the input child, which would re-focus and loop.
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
      // Invalid or empty entry — revert to whatever's currently saved.
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
        className={classNames(styles.customOptionLabel, {
          [styles.customOptionLabelSelected]: isSelected,
        })}
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

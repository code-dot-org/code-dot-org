import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';

import {fontSizePx, FontSize, MIN_FONT_SIZE_PX} from './toolbarPalettes';

import sharedStyles from './element-toolbar.module.scss';
import styles from './font-size-custom-input.module.scss';

interface FontSizeCustomInputProps {
  selectedValue: FontSize | undefined;
  onSelect: (value: number) => void;
  isSelected: boolean;
}

// Inline Custom-px input that lives as the bottom row of the Size popover.
// Mirrors the partial-input / commit-on-blur behavior of the old
// FontSizeGroup so users can briefly empty the field without us snapping
// the size mid-edit.
export default function FontSizeCustomInput({
  selectedValue,
  onSelect,
  isSelected,
}: FontSizeCustomInputProps) {
  const resolvedPx = fontSizePx(selectedValue) ?? 0;
  const [inputValue, setInputValue] = useState(String(resolvedPx));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(resolvedPx));
    }
  }, [resolvedPx, isFocused]);

  const commitFontSize = useCallback(
    (text: string): number | null => {
      let parsedValue = Number.parseInt(text, 10);
      if (!Number.isFinite(parsedValue)) {
        return null;
      }
      if (parsedValue < MIN_FONT_SIZE_PX) {
        parsedValue = MIN_FONT_SIZE_PX;
      }
      if (parsedValue !== resolvedPx) {
        onSelect(parsedValue);
      }
      return parsedValue;
    },
    [onSelect, resolvedPx]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setInputValue(next);
      if (next === '') {
        return;
      }
      commitFontSize(next);
    },
    [commitFontSize]
  );

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    const parsedValue = commitFontSize(inputValue);
    setInputValue(String(parsedValue ?? resolvedPx));
  }, [inputValue, resolvedPx, commitFontSize]);

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
    <div
      className={classNames(styles.customOptionRow, {
        [styles.customOptionRowSelected]: isSelected,
      })}
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
        inputType="number"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        size="s"
        className={sharedStyles.smallInput}
      />
    </div>
  );
}

import TextField from '@code-dot-org/component-library/textField';
import {IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';

import {
  clampFontSizePx,
  FONT_SIZE_OPTIONS,
  FontSize,
  fontSizePx,
} from './toolbarPalettes';

import styles from './element-toolbar.module.scss';

export interface FontSizeGroupProps {
  selectedValue: FontSize | undefined;
  onSelect: (value: FontSize) => void;
}

export default function FontSizeGroup({
  selectedValue,
  onSelect,
}: FontSizeGroupProps) {
  const resolvedPx = fontSizePx(selectedValue) ?? 0;
  const [inputValue, setInputValue] = useState(String(resolvedPx));
  const [isFocused, setIsFocused] = useState(false);

  // Sync the input to the resolved px when the underlying value changes from
  // outside (e.g. a button click) but only while the input isn't being edited.
  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(resolvedPx));
    }
  }, [resolvedPx, isFocused]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setInputValue(next);
      // Skip committing on partial input so the user can briefly empty the
      // field without us snapping the size mid-edit.
      if (next === '') {
        return;
      }
      const parsed = Number.parseInt(next, 10);
      if (!Number.isFinite(parsed)) {
        return;
      }
      const clamped = clampFontSizePx(parsed);
      if (clamped !== resolvedPx) {
        onSelect(clamped);
      }
    },
    [onSelect, resolvedPx]
  );

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = Number.parseInt(inputValue, 10);
    if (Number.isFinite(parsed)) {
      const clamped = clampFontSizePx(parsed);
      setInputValue(String(clamped));
      if (clamped !== resolvedPx) {
        onSelect(clamped);
      }
    } else {
      setInputValue(String(resolvedPx));
    }
  }, [inputValue, resolvedPx, onSelect]);

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
    <div className={styles.group} role="group" aria-label="Font size">
      <Typography
        variant="overline3"
        className={styles.groupLabel}
        aria-hidden="true"
      >
        Font size
      </Typography>
      <div className={styles.fontSizeButtons}>
        {FONT_SIZE_OPTIONS.map(option => {
          const isSelected = selectedValue === option.value;
          return (
            <Tooltip key={option.value} title={option.label} placement="top">
              <IconButton
                size="small"
                className={classNames(styles.fontSizeButton, {
                  [styles.fontSizeButtonSelected]: isSelected,
                })}
                aria-label={`Font size: ${option.label}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(option.value)}
              >
                {option.shortLabel}
              </IconButton>
            </Tooltip>
          );
        })}
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
          className={styles.fontSizeInput}
        />
      </div>
    </div>
  );
}

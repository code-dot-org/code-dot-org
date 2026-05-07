import TextField from '@code-dot-org/component-library/textField';
import {IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';

import {
  FONT_SIZE_OPTIONS,
  FontSize,
  fontSizePx,
  MIN_FONT_SIZE_PX,
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
      // Skip committing on partial input so the user can briefly empty the
      // field without us snapping the size mid-edit.
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
      // Remove focus from the input box on enter.
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
          className={styles.smallInput}
        />
      </div>
    </div>
  );
}

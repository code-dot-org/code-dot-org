import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {ColorSwatch} from '../toolbarPalettes';

import TransparentSwatchIcon from './TransparentSwatchIcon';

import styles from './color-picker-popover.module.scss';

const CUSTOM_COLOR_DEFAULT = '#000000';

function isCustomHex(value: string | undefined): value is string {
  return typeof value === 'string' && value.startsWith('#');
}

export interface ColorPickerPopoverProps {
  groupLabel: string;
  swatches: ColorSwatch[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  onClose: () => void;
}

// Matches the grid `max-width` in color-picker-popover.module.scss. Keep
// the two in sync — Up/Down arrow navigation jumps this many cells.
const SWATCH_COLUMNS = 5;

export default function ColorPickerPopover({
  groupLabel,
  swatches,
  selectedValue,
  onSelect,
  onClose,
}: ColorPickerPopoverProps) {
  const {theme} = useTheme();
  const isDarkMode = theme === 'Dark';
  const customSelected = isCustomHex(selectedValue);
  const customValue = customSelected ? selectedValue : CUSTOM_COLOR_DEFAULT;
  const gridRef = useRef<HTMLDivElement>(null);

  // Focus the selected (or first) swatch on open so arrow keys work immediately.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const selected = grid.querySelector<HTMLElement>('[aria-pressed="true"]');
    const target = selected ?? grid.querySelector<HTMLElement>('button');
    target?.focus();
  }, []);

  // Arrow keys navigate the 2D grid. Left/Right move linearly across the
  // row; Up/Down jump by SWATCH_COLUMNS.
  const handleGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'ArrowDown'
    ) {
      return;
    }
    const grid = event.currentTarget;
    const focusables = Array.from(
      grid.querySelectorAll<HTMLElement>('button, input[type="color"]')
    );
    const currentIndex = focusables.indexOf(
      document.activeElement as HTMLElement
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = currentIndex + 1;
        break;
      case 'ArrowLeft':
        nextIndex = currentIndex - 1;
        break;
      case 'ArrowDown':
        nextIndex = currentIndex + SWATCH_COLUMNS;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex - SWATCH_COLUMNS;
        break;
    }
    if (nextIndex < 0 || nextIndex >= focusables.length) {
      return;
    }
    event.preventDefault();
    focusables[nextIndex].focus();
  };

  return (
    // Arrow-key navigation is the a11y affordance here.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={gridRef}
      className={styles.swatchGrid}
      role="group"
      aria-label={groupLabel}
      onKeyDown={handleGridKeyDown}
    >
      {swatches.map(swatch => {
        const isSelected = selectedValue === swatch.value;
        const label =
          isDarkMode && swatch.darkModeLabel
            ? swatch.darkModeLabel
            : swatch.label;
        const ariaLabel = `${groupLabel}: ${label}`;
        return (
          <Tooltip key={swatch.value} title={label} placement="top">
            <IconButton
              size="small"
              className={classNames(styles.swatch, {
                [styles.swatchSelected]: isSelected,
              })}
              style={
                swatch.transparent ? undefined : {backgroundColor: swatch.value}
              }
              aria-label={ariaLabel}
              aria-pressed={isSelected}
              onClick={() => {
                onSelect(swatch.value);
                onClose();
              }}
            >
              {swatch.transparent && <TransparentSwatchIcon />}
            </IconButton>
          </Tooltip>
        );
      })}
      <Tooltip title="Custom color" placement="top">
        <label
          className={classNames(styles.swatch, styles.customSwatch, {
            [styles.swatchSelected]: customSelected,
          })}
          style={customSelected ? {backgroundColor: customValue} : undefined}
        >
          {!customSelected && (
            <FontAwesomeV6Icon
              iconName="palette"
              className={styles.customSwatchIcon}
            />
          )}
          <input
            type="color"
            value={customValue}
            // Don't close per change — the native picker fires continuously.
            onChange={event => onSelect(event.target.value)}
            className={styles.customSwatchInput}
            aria-label={`${groupLabel}: Custom color`}
          />
        </label>
      </Tooltip>
    </div>
  );
}

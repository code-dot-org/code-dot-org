import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {ColorSwatch} from './toolbarPalettes';

import styles from './color-picker-popover.module.scss';
import sharedStyles from './element-toolbar.module.scss';

const CUSTOM_COLOR_DEFAULT = '#000000';

export function isCustomHex(value: string | undefined): value is string {
  return typeof value === 'string' && value.startsWith('#');
}

export interface ColorPickerPopoverProps {
  groupLabel: string;
  swatches: ColorSwatch[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  onClose: () => void;
}

// Number of swatch columns per row. Matches the grid width set in
// color-picker-popover.module.scss (max-width 144px = 5 swatches @ 24px
// + 4 gaps @ 4px + 2 paddings @ 4px). Bumping the width there means
// updating this constant too.
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
  const customLabel = `${groupLabel}: Custom color`;
  const gridRef = useRef<HTMLDivElement>(null);

  // MUI Popover auto-focuses its Paper but doesn't dive into the content,
  // so the user previously had to Tab once to land on a swatch before
  // arrow keys would work. On mount (= popover open), jump focus to the
  // currently-selected swatch, or to the first swatch if no match.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const selected = grid.querySelector<HTMLElement>('[aria-pressed="true"]');
    const target = selected ?? grid.querySelector<HTMLElement>('button');
    target?.focus();
  }, []);

  // Arrow-key navigation across the 2D swatch grid. Tab still works for
  // entry/exit; arrows move within the grid:
  //   Left/Right: linear (wraps row boundaries)
  //   Up/Down: jump by column count, clamped at grid edges
  // Focusables are the swatch <button>s plus the <input type="color"> for
  // the custom swatch.
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
    // The keydown listener here IS the keyboard-accessibility affordance
    // (arrow-key navigation across the swatch grid) — disabling the
    // a11y rule rather than dropping the handler.
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
                [sharedStyles.swatchTransparent]: swatch.transparent,
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
            />
          </Tooltip>
        );
      })}
      <Tooltip title="Custom color" placement="top">
        {/* If the user has a custom color selected, show it as the background color, otherwise show the palette icon. */}
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
            // Don't close on every change — the native picker fires
            // continuously as the user moves their cursor. They will
            // commit by clicking outside the popover.
            onChange={event => onSelect(event.target.value)}
            className={styles.customSwatchInput}
            aria-label={customLabel}
          />
        </label>
      </Tooltip>
    </div>
  );
}

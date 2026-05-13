import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {ColorSwatch} from './toolbarPalettes';

import styles from './element-toolbar.module.scss';

const CUSTOM_COLOR_DEFAULT = '#000000';

function isCustomHex(value: string | undefined): value is string {
  return typeof value === 'string' && value.startsWith('#');
}

export interface SwatchGroupProps {
  groupLabel: string;
  swatches: ColorSwatch[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

export default function SwatchGroup({
  groupLabel,
  swatches,
  selectedValue,
  onSelect,
}: SwatchGroupProps) {
  const {theme} = useTheme();
  const isDarkMode = theme === 'Dark';
  // We know a color is custom if it's a hex value. Our predefined palettes are css variables.
  const customSelected = isCustomHex(selectedValue);
  const customValue = customSelected ? selectedValue : CUSTOM_COLOR_DEFAULT;
  const customLabel = `${groupLabel}: Custom color`;
  return (
    <div className={styles.group} role="group" aria-label={groupLabel}>
      <Typography
        variant="overline3"
        className={styles.groupLabel}
        aria-hidden="true"
      >
        {groupLabel}
      </Typography>
      <div className={styles.swatches}>
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
                  [styles.swatchTransparent]: swatch.transparent,
                })}
                style={
                  swatch.transparent
                    ? undefined
                    : {backgroundColor: swatch.value}
                }
                aria-label={ariaLabel}
                aria-pressed={isSelected}
                onClick={() => onSelect(swatch.value)}
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
              onChange={event => onSelect(event.target.value)}
              className={styles.customSwatchInput}
              aria-label={customLabel}
            />
          </label>
        </Tooltip>
      </div>
    </div>
  );
}

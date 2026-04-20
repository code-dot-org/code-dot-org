import {IconButton, Tooltip} from '@mui/material';
import React from 'react';

import {ColorSwatch} from './shapePalettes';

import styles from './shape-node-toolbar.module.scss';

// MUI IconButton's theme sets a larger min size that beats CSS-module
// and `sx` classes. Set size via inline `style` — highest specificity
// short of !important, so a 24 px swatch actually renders.
const SWATCH_PX = 24;

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
  return (
    <div className={styles.group} role="group" aria-label={groupLabel}>
      <span className={styles.groupLabel} aria-hidden="true">
        {groupLabel}
      </span>
      <div className={styles.swatches}>
        {swatches.map(swatch => {
          const isSelected = selectedValue === swatch.value;
          const ariaLabel = `${groupLabel}: ${swatch.label}`;
          return (
            <Tooltip key={swatch.value} title={swatch.label} placement="top">
              <IconButton
                size="small"
                className={`${styles.swatch} ${
                  isSelected ? styles.swatchSelected : ''
                } ${swatch.transparent ? styles.swatchTransparent : ''}`}
                style={{
                  width: SWATCH_PX,
                  height: SWATCH_PX,
                  minWidth: SWATCH_PX,
                  minHeight: SWATCH_PX,
                  padding: 0,
                  backgroundColor: swatch.transparent
                    ? undefined
                    : swatch.value,
                }}
                aria-label={ariaLabel}
                aria-pressed={isSelected}
                onClick={() => onSelect(swatch.value)}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

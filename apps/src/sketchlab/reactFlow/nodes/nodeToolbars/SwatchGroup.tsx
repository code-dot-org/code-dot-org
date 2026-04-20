import {IconButton, Tooltip} from '@mui/material';
import React from 'react';

import {ColorSwatch} from './shapePalettes';

import styles from './node-toolbar.module.scss';

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
      </div>
    </div>
  );
}

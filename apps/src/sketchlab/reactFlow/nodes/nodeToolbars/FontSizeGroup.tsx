import {IconButton, Tooltip} from '@mui/material';
import React from 'react';

import {FONT_SIZE_OPTIONS} from './shapePalettes';

import styles from './shape-node-toolbar.module.scss';

// IconButton size="small" still pads ~5 px and forces a 50 % border
// radius; override both so the CSS module's 24 px rounded-rect wins.
const BUTTON_SX = {padding: 0, borderRadius: '4px'};

export interface FontSizeGroupProps {
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

export default function FontSizeGroup({
  selectedValue,
  onSelect,
}: FontSizeGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label="Font size">
      <span className={styles.groupLabel} aria-hidden="true">
        Font size
      </span>
      <div className={styles.fontSizeButtons}>
        {FONT_SIZE_OPTIONS.map(option => {
          const isSelected = selectedValue === option.value;
          return (
            <Tooltip key={option.value} title={option.label} placement="top">
              <IconButton
                size="small"
                className={`${styles.fontSizeButton} ${
                  isSelected ? styles.fontSizeButtonSelected : ''
                }`}
                aria-label={`Font size: ${option.label}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(option.value)}
                sx={BUTTON_SX}
              >
                {option.label.charAt(0)}
              </IconButton>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

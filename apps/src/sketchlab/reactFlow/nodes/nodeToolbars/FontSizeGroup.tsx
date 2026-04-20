import {IconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {FONT_SIZE_OPTIONS} from './shapePalettes';

import styles from './node-toolbar.module.scss';

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
                className={classNames(styles.fontSizeButton, {
                  [styles.fontSizeButtonSelected]: isSelected,
                })}
                aria-label={`Font size: ${option.label}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(option.value)}
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

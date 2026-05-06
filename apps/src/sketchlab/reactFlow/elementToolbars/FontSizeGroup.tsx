import {IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {FONT_SIZE_OPTIONS} from './toolbarPalettes';

import styles from './element-toolbar.module.scss';

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
      </div>
    </div>
  );
}

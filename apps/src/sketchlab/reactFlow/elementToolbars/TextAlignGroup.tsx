import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {TEXT_ALIGN_OPTIONS, TextAlignValue} from './toolbarPalettes';

import styles from './element-toolbar.module.scss';

export interface TextAlignGroupProps {
  selectedValue: TextAlignValue;
  onSelect: (value: TextAlignValue) => void;
}

export default function TextAlignGroup({
  selectedValue,
  onSelect,
}: TextAlignGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label="Text alignment">
      <Typography
        variant="overline3"
        className={styles.groupLabel}
        aria-hidden="true"
      >
        Alignment
      </Typography>
      <div className={styles.fontSizeButtons}>
        {TEXT_ALIGN_OPTIONS.map(option => {
          const isSelected = selectedValue === option.value;
          return (
            <Tooltip key={option.value} title={option.label} placement="top">
              <IconButton
                size="small"
                className={classNames(styles.fontSizeButton, {
                  [styles.fontSizeButtonSelected]: isSelected,
                })}
                aria-label={option.label}
                aria-pressed={isSelected}
                onClick={() => onSelect(option.value)}
              >
                <FontAwesomeV6Icon iconName={option.icon} />
              </IconButton>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

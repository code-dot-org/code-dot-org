import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import styles from './option-list-popover.module.scss';

export interface OptionListItem<T extends string | number> {
  value: T;
  label: string;
  icon?: string;
  iconStyle?: 'solid' | 'regular';
  iconFamily?: 'kit';
  labelStyle?: React.CSSProperties;
}

interface OptionListPopoverProps<T extends string | number> {
  options: readonly OptionListItem<T>[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  onClose: () => void;
  ariaLabel: string;
  customRow?: React.ReactNode;
}

export default function OptionListPopover<T extends string | number>({
  options,
  selectedValue,
  onSelect,
  onClose,
  ariaLabel,
  customRow,
}: OptionListPopoverProps<T>) {
  const listRef = useRef<HTMLUListElement>(null);

  // Ensure first menu item gets focus when opened.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector<HTMLElement>(
      '[role="menuitem"].Mui-selected'
    );
    const target =
      selected ?? list.querySelector<HTMLElement>('[role="menuitem"]');
    target?.focus();
  }, []);

  return (
    <MenuList
      ref={listRef}
      autoFocusItem
      className={styles.optionList}
      aria-label={ariaLabel}
    >
      {options.map(option => {
        const isSelected = selectedValue === option.value;
        return (
          <MenuItem
            key={option.value}
            selected={isSelected}
            className={styles.optionListItem}
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            {option.icon && (
              <ListItemIcon
                className={classNames(styles.optionListIcon, {
                  [styles.optionListIconSelected]: isSelected,
                })}
              >
                <FontAwesomeV6Icon
                  iconName={option.icon}
                  iconStyle={option.iconStyle}
                  iconFamily={option.iconFamily}
                />
              </ListItemIcon>
            )}
            <ListItemText className={styles.optionListLabel} disableTypography>
              <Typography
                variant="body4"
                style={option.labelStyle}
                className={classNames({
                  [styles.optionListLabelSelected]: isSelected,
                })}
              >
                {option.label}
              </Typography>
            </ListItemText>
            {isSelected && (
              <FontAwesomeV6Icon
                iconName="check"
                iconStyle="solid"
                className={styles.optionListCheck}
                aria-hidden="true"
              />
            )}
          </MenuItem>
        );
      })}
      {customRow}
    </MenuList>
  );
}

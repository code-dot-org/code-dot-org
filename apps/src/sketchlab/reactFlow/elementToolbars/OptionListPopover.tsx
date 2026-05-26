import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ListItemIcon, ListItemText, MenuItem, MenuList} from '@mui/material';
import React from 'react';

import styles from './option-list-popover.module.scss';

export interface OptionListItem<T extends string | number> {
  value: T;
  label: string;
  // Either a FontAwesome icon name (rendered via FontAwesomeV6Icon) or a
  // fully-formed preview node (e.g. a stroke-styled <span> for line shapes).
  icon?: string;
  iconStyle?: 'solid' | 'regular';
  preview?: React.ReactNode;
}

interface OptionListPopoverProps<T extends string | number> {
  options: readonly OptionListItem<T>[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  onClose: () => void;
  ariaLabel: string;
  // Optional row appended below the list (e.g. Custom px input for Size).
  // Marked selected when no preset matches the underlying value.
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
  return (
    <MenuList
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
            {(option.preview || option.icon) && (
              <ListItemIcon className={styles.optionListIcon}>
                {option.preview ?? (
                  <FontAwesomeV6Icon
                    iconName={option.icon as string}
                    iconStyle={option.iconStyle}
                  />
                )}
              </ListItemIcon>
            )}
            <ListItemText className={styles.optionListLabel}>
              {option.label}
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

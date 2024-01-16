import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './dropdownMenu.module.scss';

export interface DropdownMenuProps {
  /** Dropdown  Menu items list */
  items: {value: string; label: string}[];
  /** Dropdown selected value */
  selectedValue?: string;
  /** Dropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Dropdown label text */
  labelText: string;
  /** Is dropdown label visible or added via aria-label attribute */
  isLabelVisible?: boolean;
  /** Dropdown name */
  name: string;
  /** Dropdown id */
  id?: string;
  /** Custom class name */
  className?: string;
  /** Is dropdown disabled */
  disabled?: boolean;
  /** Dropdown color */
  color?: 'white' | 'black';
  /** Dropdown size */
  size: ComponentSizeXSToL;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/DropdownMenuTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Dropdown Component.
 * Used to render simple dropdowns with styled select (Dropdown button)
 * and browser's native select options.
 */
const DropdownMenu: React.FunctionComponent<DropdownMenuProps> = ({
  items,
  selectedValue,
  onChange,
  name,
  id,
  className,
  labelText,
  isLabelVisible = true,
  disabled = false,
  color = 'black',
  size = 'm',
}) => {
  return (
    <label
      className={classNames(
        moduleStyles.dropdownContainer,
        moduleStyles[`dropdownContainer-${size}`],
        moduleStyles[`dropdownContainer-${color}`],
        className
      )}
    >
      {isLabelVisible && (
        <span className={moduleStyles.dropdownLabel}>{labelText}</span>
      )}

      <div className={moduleStyles.dropdownArrowDiv}>
        <select
          name={name}
          aria-label={isLabelVisible ? undefined : labelText}
          onChange={onChange}
          value={selectedValue}
          id={id}
          className={moduleStyles.dropdown}
          disabled={disabled}
        >
          {items.map(({value, label}) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
};

export default DropdownMenu;

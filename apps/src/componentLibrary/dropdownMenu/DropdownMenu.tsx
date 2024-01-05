import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './dropdownMenu.module.scss';

export interface DropdownMenuProps {
  /** Dropdown  Menu items list */
  items: {value: string; label: string}[];
  /** Dropdown onChange handler */
  onChange: (args: any) => void;
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

// TODO:
// * update segmented buttons documentation
// * add tests
// * add documentation

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/DropdownMenuTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Wip```
 *
 * Design System: Dropdown Component.
 * Used to render simple dropdowns with styled select (Dropdown button)]
 * and browser's native select options.
 */
const DropdownMenu: React.FunctionComponent<DropdownMenuProps> = ({
  items,
  onChange,
  name,
  id,
  className,
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
      <span className={moduleStyles.dropdownLabelText}>Dropdown label</span>

      <div className={moduleStyles.dropdownArrowDiv}>
        <select
          name={name}
          onChange={onChange}
          id={id}
          className={moduleStyles.dropdown}
          disabled={disabled}
        >
          <option value="">Some default text</option>
          {items.map(({value, label}) => (
            <option value={value}>{label}</option>
          ))}
        </select>
      </div>
    </label>
  );
};

export default DropdownMenu;

import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './simpleDropdown.module.scss';

export interface SimpleDropdownProps {
  /** SimpleDropdown items list */
  items: {value: string; text: string}[];
  /** SimpleDropdown selected value */
  selectedValue?: string;
  /** SimpleDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLSelectElement>) => void;
  /** SimpleDropdown label text */
  labelText: string;
  /** Is SimpleDropdown label visible or added via aria-label attribute */
  isLabelVisible?: boolean;
  /** SimpleDropdown name */
  name: string;
  /** SimpleDropdown id */
  id?: string;
  /** Custom class name */
  className?: string;
  /** Is SimpleDropdown disabled */
  disabled?: boolean;
  /** SimpleDropdown color */
  color?: 'white' | 'black';
  /** SimpleDropdown size */
  size: ComponentSizeXSToL;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/SimpleDropdownTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: SimpleDropdown Component.
 * Used to render simple SimpleDropdowns with styled select (SimpleDropdown button)
 * and browser's native select options.
 */
const SimpleDropdown: React.FunctionComponent<SimpleDropdownProps> = ({
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
          {items.map(({value, text}) => (
            <option value={value} key={value}>
              {text}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
};

export default SimpleDropdown;

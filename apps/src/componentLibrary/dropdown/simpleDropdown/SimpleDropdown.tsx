import classNames from 'classnames';
import React, {AriaAttributes} from 'react';

import {getAriaPropsFromProps} from '@cdo/apps/componentLibrary/common/helpers';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import Spinner from '@cdo/apps/sharedComponents/Spinner';

import moduleStyles from './simpleDropdown.module.scss';

export interface SimpleDropdownProps extends AriaAttributes {
  /** SimpleDropdown items list */
  items?: {value: string; text: string}[];
  /** SimpleDropdown grouped list of items */
  itemGroups?: {label: string; groupItems: {value: string; text: string}[]}[];
  /** SimpleDropdown selected value */
  selectedValue?: string;
  /** SimpleDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLSelectElement>) => void;
  /** SimpleDropdown label text */
  labelText: string;
  /** SimpleDropdown dropdown text thickness */
  dropdownTextThickness?: 'thick' | 'thin';
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
  /** SimpleDropdown color. Sets the color of dropdown arrow, text, label and border color.
   * White stands for 'white' dropdown that'll be rendered on dark background,
   * 'black' stands for black dropdown that'll be rendered on the white/light background. */
  color?: 'white' | 'black' | 'gray';
  /** SimpleDropdown size */
  size: ComponentSizeXSToL;
  /** Show spinner for async data */
  loading?: boolean;
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
  items = [],
  itemGroups = [],
  selectedValue,
  onChange,
  name,
  id,
  className,
  labelText,
  loading = false,
  dropdownTextThickness = 'thick',
  isLabelVisible = true,
  disabled = false,
  color = 'black',
  size = 'm',
  ...rest
}) => {
  const ariaProps = getAriaPropsFromProps(rest);

  return (
    <label
      className={classNames(
        moduleStyles.dropdownContainer,
        moduleStyles[`dropdownContainer-${size}`],
        moduleStyles[`dropdownContainer-${color}`],
        moduleStyles[`dropdownContainer-${dropdownTextThickness}`],
        className
      )}
      aria-describedby={ariaProps['aria-describedby']}
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
          disabled={disabled}
          {...ariaProps}
        >
          {itemGroups.length > 0
            ? itemGroups.map(({label, groupItems}, index) => (
                <optgroup key={index} label={label}>
                  {groupItems.map(({value, text}) => (
                    <option value={value} key={value}>
                      {text}
                    </option>
                  ))}
                </optgroup>
              ))
            : items.map(({value, text}) => (
                <option value={value} key={value}>
                  {text}
                </option>
              ))}
        </select>
        {loading && (
          <div
            className={moduleStyles.dropdownSpinner}
            data-testid="loading-spinner"
          >
            <Spinner size="small" />
          </div>
        )}
      </div>
    </label>
  );
};

export default SimpleDropdown;

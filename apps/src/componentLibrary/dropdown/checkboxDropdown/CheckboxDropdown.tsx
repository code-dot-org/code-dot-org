import React from 'react';

import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from '@cdo/apps/componentLibrary/dropdown/customDropdown.module.scss';
import Button from '@cdo/apps/templates/Button';

import CustomDropdown from '@cdo/apps/componentLibrary/dropdown/_CustomDropdown';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import i18n from '@cdo/apps/locale';

import Checkbox from '@cdo/apps/componentLibrary/checkbox';

import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

export interface CheckboxDropdownProps {
  /** CheckboxDropdown name */
  name: string;
  /** CheckboxDropdown color */
  color?: DropdownColor;
  /** CheckboxDropdown size */
  size: ComponentSizeXSToL;
  /** CheckboxDropdown disabled state */
  disabled?: boolean;
  /** CheckboxDropdown label */
  labelText: string;
  /** CheckboxDropdown options */
  allOptions: {value: string; label: string; isOptionDisabled?: boolean}[];
  /** CheckboxDropdown checked options */
  checkedOptions: string[];
  /** CheckboxDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLInputElement>) => void;
  /** CheckboxDropdown onSelectAll handler */
  onSelectAll: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** CheckboxDropdown onClearAll handler */
  onClearAll: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/DropdownMenuTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Checkbox Dropdown Component.
 * Used to render checkbox (multiple choice) dropdowns.
 */
const CheckboxDropdown: React.FunctionComponent<CheckboxDropdownProps> = ({
  name,
  labelText,
  allOptions,
  checkedOptions = [],
  onChange,
  onSelectAll,
  onClearAll,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
}) => {
  return (
    <CustomDropdown
      name={name}
      labelText={labelText}
      color={color}
      disabled={disabled}
      size={size}
    >
      <form className={moduleStyles.dropdownMenuContainer}>
        <ul>
          {allOptions.map(({value, label, isOptionDisabled}) => (
            <li key={value}>
              <Checkbox
                checked={checkedOptions.includes(value)}
                disabled={disabled || isOptionDisabled}
                onChange={onChange}
                size={size}
                name={value}
                value={value}
                label={label}
              />
            </li>
          ))}
        </ul>
        <div className={moduleStyles.bottomButtonsContainer}>
          <Button
            type="button"
            // text={i18n.selectAll()}
            onClick={onSelectAll}
            styleAsText
            color={Button.ButtonColor.brandSecondaryDefault}
          />
          <Button
            type="button"
            // text={i18n.clearAll()}
            onClick={onClearAll}
            styleAsText
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </div>
      </form>
    </CustomDropdown>
  );
};

export default CheckboxDropdown;

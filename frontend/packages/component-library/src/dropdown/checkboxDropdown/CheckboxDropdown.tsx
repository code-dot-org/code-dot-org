import {AriaAttributes} from 'react';

import Button, {buttonColors} from '@/button';
import Checkbox from '@/checkbox';
import {dropdownColors} from '@/common/constants';
import {
  ComponentSizeXSToL,
  DropdownColor,
  DropdownFormFieldRelatedProps,
} from '@/common/types';

import CustomDropdown, {CustomDropdownOption} from '../CustomDropdown';

import moduleStyles from './../customDropdown.module.scss';

export type CheckboxDropdownOption = CustomDropdownOption;

interface BaseCheckboxDropdownProps
  extends DropdownFormFieldRelatedProps,
    AriaAttributes {
  /** CheckboxDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** CheckboxDropdown custom class name */
  className?: string;
  /** CheckboxDropdown color */
  color?: DropdownColor;
  /** CheckboxDropdown size */
  size?: ComponentSizeXSToL;
  /** CheckboxDropdown disabled state */
  disabled?: boolean;
  /** CheckboxDropdown readOnly state */
  readOnly?: boolean;
  /** CheckboxDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** CheckboxDropdown label style type*/
  labelType?: 'thick' | 'thin';
  /** CheckboxDropdown options */
  allOptions: CheckboxDropdownOption[];
  /** CheckboxDropdown checked options */
  checkedOptions: string[];
  /** CheckboxDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLInputElement>) => void;
  /** Whether the dropdown should take full width of its container */
  fullWidth?: boolean;
  /** Custom width for the dropdown (CSS width value - supports px, %, rem, etc.) */
  width?: string;
}

interface CheckboxDropdownWithoutControlProps
  extends BaseCheckboxDropdownProps {
  hideControls: true;
}

interface CheckboxDropdownWithControlsProps extends BaseCheckboxDropdownProps {
  hideControls?: false;
  onSelectAll: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  onClearAll: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  selectAllText: string;
  clearAllText: string;
}

export type CheckboxDropdownProps =
  | CheckboxDropdownWithoutControlProps
  | CheckboxDropdownWithControlsProps;

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/CheckboxDropdown.test.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Checkbox Dropdown Component.
 * Used to render checkbox (multiple choice) dropdowns.
 */
const CheckboxDropdown: React.FunctionComponent<CheckboxDropdownProps> = ({
  name,
  className,
  labelText,
  labelType = 'thick',
  allOptions,
  checkedOptions = [],
  onChange,
  disabled = false,
  readOnly = false,
  color = dropdownColors.black,
  size = 'm',
  helperMessage,
  helperIcon,
  errorMessage,
  styleAsFormField = false,
  fullWidth,
  width,
  ...rest
}) => {
  return (
    <CustomDropdown
      name={name}
      className={className}
      labelText={labelText}
      labelType={labelType}
      color={color}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      fullWidth={fullWidth}
      width={width}
      isSomeValueSelected={checkedOptions.length > 0}
      helperMessage={helperMessage}
      helperIcon={helperIcon}
      errorMessage={errorMessage}
      styleAsFormField={styleAsFormField}
      selectedValueText={checkedOptions
        ?.map(str => allOptions.find(opt => opt.value === str)?.label)
        .join(', ')}
      {...rest}
    >
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
      {!rest.hideControls && (
        <div className={moduleStyles.bottomButtonsContainer}>
          <Button
            type="tertiary"
            color={buttonColors.purple}
            text={rest.selectAllText}
            onClick={rest.onSelectAll}
            size={size}
          />
          <Button
            type="tertiary"
            color={buttonColors.purple}
            text={rest.clearAllText}
            onClick={rest.onClearAll}
            size={size}
          />
        </div>
      )}
    </CustomDropdown>
  );
};

export default CheckboxDropdown;

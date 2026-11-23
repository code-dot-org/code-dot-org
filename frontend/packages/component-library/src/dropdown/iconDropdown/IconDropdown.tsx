import classNames from 'classnames';
import {AriaAttributes} from 'react';

import {dropdownColors} from '@/common/constants';
import {useCloseDropdownMenu} from '@/common/contexts/DropdownContext';
import {
  ComponentSizeXSToL,
  DropdownColor,
  DropdownFormFieldRelatedProps,
} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import CustomDropdown, {
  CustomDropdownMenuPlacement,
  CustomDropdownMenuVerticalPlacement,
  CustomDropdownOption,
} from '../CustomDropdown';

import moduleStyles from './../customDropdown.module.scss';

export interface IconDropdownOption extends CustomDropdownOption {
  icon: FontAwesomeV6IconProps;
}

export interface IconDropdownProps
  extends DropdownFormFieldRelatedProps,
    AriaAttributes {
  /** IconDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** IconDropdown custom class name */
  className?: string;
  /** IconDropdown color */
  color?: DropdownColor;
  /** IconDropdown size */
  size?: ComponentSizeXSToL;
  /** IconDropdown disabled state */
  disabled?: boolean;
  /** IconDropdown readOnly state */
  readOnly?: boolean;
  /** IconDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** IconDropdown label style type*/
  labelType?: 'thick' | 'thin';
  /** IconDropdown options */
  options: IconDropdownOption[];
  /** IconDropdown checked options */
  selectedOption: IconDropdownOption;
  /** IconDropdown onChange handler */
  onChange: (option: IconDropdownOption) => void;
  /** IconDropdown Menu placement */
  menuPlacement?: CustomDropdownMenuPlacement;
  /** IconDropdown menu vertical placement */
  menuVerticalPlacement?: CustomDropdownMenuVerticalPlacement;
}

const IconDropdownMenu: React.FunctionComponent<
  Pick<IconDropdownProps, 'options' | 'onChange' | 'disabled'> & {
    selectedValue?: string;
  }
> = ({options, selectedValue, onChange, disabled}) => {
  const closeMenu = useCloseDropdownMenu();

  return (
    <ul>
      {options.map(option => {
        const {
          value,
          label,
          isOptionDisabled,
          icon: {
            iconName,
            iconStyle,
            title: iconTitle,
            className: iconClassName,
          },
        } = option;
        return (
          <li key={value}>
            <button
              className={classNames(
                moduleStyles.dropdownMenuItem,
                isOptionDisabled && moduleStyles.disabledDropdownMenuItem,
                selectedValue === value &&
                  moduleStyles.selectedDropdownMenuItem,
              )}
              disabled={isOptionDisabled || disabled}
              type="button"
              onClick={event => {
                if (!disabled && !isOptionDisabled) {
                  onChange(option);
                  closeMenu(event.currentTarget);
                }
              }}
            >
              <FontAwesomeV6Icon
                iconName={iconName}
                iconStyle={iconStyle}
                title={iconTitle}
                className={iconClassName}
              />
              <span>{label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/IconDropdown.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Icon Dropdown Component.
 * Used to render dropdowns with a list of options with icons.
 */
const IconDropdown: React.FunctionComponent<IconDropdownProps> = ({
  name,
  className,
  labelText,
  labelType = 'thick',
  options,
  selectedOption = {},
  onChange,
  disabled = false,
  readOnly = false,
  color = dropdownColors.black,
  size = 'm',
  helperMessage,
  helperIcon,
  errorMessage,
  styleAsFormField = false,
  menuPlacement = 'left',
  menuVerticalPlacement = 'bottom',
  ...rest
}) => {
  return (
    <CustomDropdown
      name={name}
      className={className}
      labelText={labelText}
      labelType={labelType}
      disabled={disabled}
      readOnly={readOnly}
      color={color}
      icon={selectedOption?.icon}
      size={size}
      helperMessage={helperMessage}
      helperIcon={helperIcon}
      errorMessage={errorMessage}
      styleAsFormField={styleAsFormField}
      selectedValueText={selectedOption?.label}
      menuPlacement={menuPlacement}
      menuVerticalPlacement={menuVerticalPlacement}
      {...rest}
    >
      <IconDropdownMenu
        options={options}
        selectedValue={selectedOption?.value}
        onChange={onChange}
        disabled={disabled}
      />
    </CustomDropdown>
  );
};

export default IconDropdown;

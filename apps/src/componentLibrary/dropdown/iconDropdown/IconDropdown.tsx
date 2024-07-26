import classNames from 'classnames';
import React, {useCallback, memo, AriaAttributes} from 'react';

import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';
import {
  DropdownProviderWrapper,
  useDropdownContext,
} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';
import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@cdo/apps/componentLibrary/common/types';
import CustomDropdown, {
  _CustomDropdownOption,
} from '@cdo/apps/componentLibrary/dropdown/_CustomDropdown';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from '@cdo/apps/componentLibrary/dropdown/customDropdown.module.scss';

export interface IconDropdownOption extends _CustomDropdownOption {
  icon: FontAwesomeV6IconProps;
}

export interface IconDropdownProps extends AriaAttributes {
  /** IconDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** IconDropdown custom class name */
  className?: string;
  /** IconDropdown color */
  color?: DropdownColor;
  /** IconDropdown size */
  size: ComponentSizeXSToL;
  /** IconDropdown disabled state */
  disabled?: boolean;
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
}

const IconDropdown: React.FunctionComponent<IconDropdownProps> = ({
  name,
  className,
  labelText,
  labelType = 'thick',
  options,
  selectedOption = {},
  onChange,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
  ...rest
}) => {
  const {setActiveDropdownName} = useDropdownContext();
  const onOptionClick = useCallback(
    (option: IconDropdownOption) => {
      if (!disabled && !option.isOptionDisabled) {
        onChange(option);
        setActiveDropdownName('');
      }
    },
    [disabled, onChange, setActiveDropdownName]
  );

  return (
    <CustomDropdown
      name={name}
      className={className}
      labelText={labelText}
      labelType={labelType}
      disabled={disabled}
      color={color}
      icon={selectedOption?.icon}
      size={size}
      {...rest}
    >
      <form className={moduleStyles.dropdownMenuContainer}>
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
                    selectedOption.value === value &&
                      moduleStyles.selectedDropdownMenuItem
                  )}
                  disabled={isOptionDisabled || disabled}
                  type="button"
                  onClick={() => onOptionClick(option)}
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
      </form>
    </CustomDropdown>
  );
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/IconDropdownTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Icon Dropdown Component.
 * Used to render dropdowns with a list of options with icons.
 */
const WrappedIconDropdown = (props: IconDropdownProps) => (
  <DropdownProviderWrapper>
    <IconDropdown {...props} />
  </DropdownProviderWrapper>
);

export default memo(WrappedIconDropdown);

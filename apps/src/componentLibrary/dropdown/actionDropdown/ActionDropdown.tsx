import classNames from 'classnames';
import React, {useCallback, memo, AriaAttributes} from 'react';

import {Button, ButtonProps} from '@cdo/apps/componentLibrary/button';
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
  TriggerComponentProps,
} from '@cdo/apps/componentLibrary/dropdown/_CustomDropdown';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from '@cdo/apps/componentLibrary/dropdown/customDropdown.module.scss';

export interface ActionDropdownOption {
  value: string;
  label: string;
  isOptionDisabled?: boolean;
  icon: FontAwesomeV6IconProps;
}

export interface ActionDropdownProps extends AriaAttributes {
  /** ActionDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** ActionDropdown custom class name */
  className?: string;
  /** ActionDropdown color */
  color?: DropdownColor;
  /** ActionDropdown size */
  size: ComponentSizeXSToL;
  /** ActionDropdown disabled state */
  disabled?: boolean;
  /** ActionDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** ActionDropdown options */
  options: ActionDropdownOption[];
  /** ActionDropdown checked options */
  selectedOption: ActionDropdownOption;
  /** ActionDropdown onChange handler */
  onChange: (option: ActionDropdownOption) => void;
  triggerButtonProps?: ButtonProps;
}

const ActionDropdown: React.FunctionComponent<ActionDropdownProps> = ({
  name,
  className,
  labelText,
  options,
  selectedOption = {},
  onChange,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
  triggerButtonProps,
  ...rest
}) => {
  const {setActiveDropdownName} = useDropdownContext();
  const onOptionClick = useCallback(
    (option: ActionDropdownOption) => {
      if (!disabled && !option.isOptionDisabled) {
        onChange(option);
        setActiveDropdownName('');
      }
    },
    [disabled, onChange, setActiveDropdownName]
  );

  /* TODO:
    - onOptionClick
    - list items
    - trigger component
    - props
    */
  return (
    <CustomDropdown
      name={name}
      className={className}
      labelText={labelText}
      disabled={disabled}
      color={color}
      size={size}
      {...rest}
      TriggerComponent={(props: TriggerComponentProps) => (
        <Button
          {...props}
          {...triggerButtonProps}
          text={triggerButtonProps?.isIconOnly ? undefined : labelText}
          aria-label={triggerButtonProps?.isIconOnly ? labelText : undefined}
          size={size}
        />
      )}
    >
      <div className={moduleStyles.dropdownMenuContainer}>
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
      </div>
    </CustomDropdown>
  );
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/ActionDropdownTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Action Dropdown Component.
 * Used to render dropdowns with a menu/list of different actions.
 */
const WrappedActionDropdown = (props: ActionDropdownProps) => (
  <DropdownProviderWrapper>
    <ActionDropdown {...props} />
  </DropdownProviderWrapper>
);

export default memo(WrappedActionDropdown);

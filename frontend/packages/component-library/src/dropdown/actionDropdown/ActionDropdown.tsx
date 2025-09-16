import classNames from 'classnames';
import {useCallback, AriaAttributes} from 'react';

import {ButtonProps} from '@/button';
import {useDropdownContext} from '@/common/contexts/DropdownContext';
import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import CustomDropdown, {
  CustomDropdownMenuPlacement,
  CustomDropdownMenuVerticalPlacement,
  CustomDropdownOption,
} from '../CustomDropdown';

import moduleStyles from './../customDropdown.module.scss';

export interface ActionDropdownOption extends CustomDropdownOption {
  onClick: () => void;
  isOptionDestructive?: boolean;
  icon: FontAwesomeV6IconProps;
}

export interface ActionDropdownProps extends AriaAttributes {
  /** ActionDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** ActionDropdown custom class name */
  className?: string;
  /** ActionDropdown size */
  size?: ComponentSizeXSToL;
  /** ActionDropdown Menu placement */
  menuPlacement?: CustomDropdownMenuPlacement;
  /** ActionDropdown menu vertical placement */
  menuVerticalPlacement?: CustomDropdownMenuVerticalPlacement;
  /** ActionDropdown disabled state */
  disabled?: boolean;
  /** ActionDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** ActionDropdown options */
  options: ActionDropdownOption[];
  /** ActionDropdown trigger button props */
  triggerButtonProps?: ButtonProps;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/ActionDropdown.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Action Dropdown Component.
 * Used to render dropdowns with a menu/list of different actions.
 */
const ActionDropdown: React.FunctionComponent<ActionDropdownProps> = ({
  name,
  className,
  labelText,
  options,
  disabled = false,
  menuPlacement = 'left',
  menuVerticalPlacement = 'bottom',
  size = 'm',
  triggerButtonProps,
  ...rest
}) => {
  const {setActiveDropdownName} = useDropdownContext();
  const onOptionClick = useCallback(
    (optionOnClick: () => void) => {
      if (!disabled) {
        optionOnClick();
        setActiveDropdownName('');
      }
    },
    [disabled, setActiveDropdownName],
  );

  return (
    <CustomDropdown
      name={name}
      className={className}
      labelText={labelText}
      disabled={disabled}
      menuPlacement={menuPlacement}
      menuVerticalPlacement={menuVerticalPlacement}
      size={size}
      {...rest}
      useDSCOButtonAsTrigger
      triggerButtonProps={triggerButtonProps}
    >
      <ul>
        {options.map(option => {
          const {
            value,
            label,
            onClick,
            isOptionDisabled,
            isOptionDestructive,
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
                  isOptionDestructive &&
                    moduleStyles.destructiveDropdownMenuItem,
                )}
                disabled={isOptionDisabled || disabled}
                type="button"
                onClick={() => onOptionClick(onClick)}
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
    </CustomDropdown>
  );
};

export default ActionDropdown;

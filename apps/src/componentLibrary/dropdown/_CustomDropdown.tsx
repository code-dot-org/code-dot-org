import classNames from 'classnames';
import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  AriaAttributes,
  KeyboardEvent,
} from 'react';

import {Button, ButtonProps} from '@cdo/apps/componentLibrary/button';
import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';
import {useDropdownContext} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';
import {getAriaPropsFromProps} from '@cdo/apps/componentLibrary/common/helpers';
import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './customDropdown.module.scss';

export interface TriggerComponentProps extends AriaAttributes {
  id: string;
  onClick: () => void;
  disabled: boolean;
  'aria-haspopup': boolean;
  'aria-label': string;
  'data-toggle': string;
}

export interface _CustomDropdownOption {
  value: string;
  label: string;
  isOptionDisabled?: boolean;
}

export interface CustomDropdownProps extends AriaAttributes {
  /** CustomDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** CustomDropdown custom class name */
  className?: string;
  /** CustomDropdown color */
  color?: DropdownColor;
  /** CustomDropdown size */
  size: ComponentSizeXSToL;
  /** CustomDropdown menu placement */
  menuPlacement?: 'left' | 'right';
  /** CustomDropdown disabled state */
  disabled?: boolean;
  /** CustomDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** CustomDropdown label style type*/
  labelType?: 'thick' | 'thin';
  /** Does custom dropdown hase a selected value (Renders a checkmark icon in the dropdown button if true) */
  isSomeValueSelected?: boolean;
  /** Custom icon to show for the dropdown button*/
  icon?: FontAwesomeV6IconProps;
  /** Whether to use DSCO (Design System) Button component as DropdownTrigger or not */
  useDSCOButtonAsTrigger?: boolean;
  /** Dropdown Trigger DSCO (Design System) Button Props */
  triggerButtonProps?: ButtonProps;
  /** Children */
  children: React.ReactNode;
}

/**
 * Design System: _CustomDropdown Component.
 * This is a PRIVATE component that is used to create different custom dropdowns.
 * Only used inside of Design System components. DO NOT IMPORT OR USE DIRECTLY.
 */
const CustomDropdown: React.FunctionComponent<CustomDropdownProps> = ({
  name,
  className,
  labelText,
  labelType = 'thick',
  children,
  isSomeValueSelected = false,
  icon,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
  menuPlacement = 'left',
  useDSCOButtonAsTrigger = false,
  triggerButtonProps = {},
  ...rest
}) => {
  const {activeDropdownName, setActiveDropdownName} = useDropdownContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback(
    (event: Event) => {
      if (
        activeDropdownName &&
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdownName('');
      }
    },
    [dropdownRef, setActiveDropdownName, activeDropdownName]
  );

  const ariaProps = getAriaPropsFromProps(rest);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (useDSCOButtonAsTrigger && !triggerButtonProps) {
      console.warn(
        'Warning: `triggerButtonProps` must be defined when `useDSCOButtonAsTrigger` is true.'
      );
    }
  }, [useDSCOButtonAsTrigger, triggerButtonProps]);

  const toggleDropdown = useCallback(() => {
    if (activeDropdownName !== name) {
      setActiveDropdownName(name);
    } else {
      setActiveDropdownName('');
    }
  }, [name, activeDropdownName, setActiveDropdownName]);

  const isOpen = useMemo(
    () => activeDropdownName === name,
    [activeDropdownName, name]
  );

  // Collapse dropdown if 'Escape' is pressed
  const onKeyDown: (e: KeyboardEvent) => void = e => {
    if (e.key === 'Escape') {
      e.currentTarget.classList.remove(moduleStyles.open);
    }
  };

  const triggerComponentProps: TriggerComponentProps = {
    id: `${name}-dropdown-button`,
    'data-toggle': 'dropdown',
    onClick: toggleDropdown,
    disabled: disabled,
    ...ariaProps,
    'aria-haspopup': true,
    'aria-label': ariaProps['aria-label'] || `${name} filter dropdown`,
  };

  return (
    <div
      id={`${name}-dropdown`}
      className={classNames(
        {[moduleStyles.open]: isOpen},
        moduleStyles.dropdownContainer,
        moduleStyles[`dropdownContainer-${menuPlacement}-menuPlacement`],
        moduleStyles[`dropdownContainer-${color}`],
        moduleStyles[`dropdownContainer-${size}`],
        className
      )}
      onKeyDown={onKeyDown}
      ref={dropdownRef}
      aria-describedby={ariaProps['aria-describedby']}
    >
      {useDSCOButtonAsTrigger ? (
        <Button
          {...triggerComponentProps}
          {...triggerButtonProps}
          size={size}
          aria-label={
            triggerButtonProps?.isIconOnly
              ? labelText
              : triggerButtonProps['aria-label'] ||
                triggerComponentProps['aria-label']
          }
        />
      ) : (
        <button
          {...triggerComponentProps}
          type="button"
          className={moduleStyles.dropdownButton}
        >
          {isSomeValueSelected && (
            <FontAwesomeV6Icon iconName="check-circle" iconStyle="solid" />
          )}
          {icon && (
            <FontAwesomeV6Icon
              iconName={icon.iconName}
              iconStyle={icon.iconStyle}
              title={icon.title}
              className={icon.className}
            />
          )}
          <span
            className={classNames(
              moduleStyles.dropdownLabel,
              moduleStyles[`dropdownLabel-${labelType}`]
            )}
          >
            {labelText}
          </span>
          <FontAwesomeV6Icon iconStyle="solid" iconName="chevron-down" />
        </button>
      )}

      {/** Dropdown menu content is rendered here as children props*/}
      {children}
    </div>
  );
};

export default CustomDropdown;

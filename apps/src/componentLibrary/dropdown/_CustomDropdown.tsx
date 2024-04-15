import classNames from 'classnames';
import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  KeyboardEvent,
} from 'react';

import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';
import {useDropdownContext} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';
import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './customDropdown.module.scss';

export interface CustomDropdownProps {
  /** CustomDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** CustomDropdown color */
  color?: DropdownColor;
  /** CustomDropdown size */
  size: ComponentSizeXSToL;
  /** CustomDropdown disabled state */
  disabled?: boolean;
  /** CustomDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** Does custom dropdown hase a selected value (Renders a checkmark icon in the dropdown button if true) */
  isSomeValueSelected?: boolean;
  /** Custom icon to show for the dropdown button*/
  icon?: FontAwesomeV6IconProps;
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
  labelText,
  children,
  isSomeValueSelected = false,
  icon,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleClickOutside);
    };
  }, [handleClickOutside]);

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

  return (
    <div
      id={`${name}-dropdown`}
      className={classNames(
        {[moduleStyles.open]: isOpen},
        moduleStyles.dropdownContainer,
        moduleStyles[`dropdownContainer-${color}`],
        moduleStyles[`dropdownContainer-${size}`]
      )}
      onKeyDown={onKeyDown}
      ref={dropdownRef}
    >
      <button
        id={`${name}-dropdown-button`}
        type="button"
        className={moduleStyles.dropdownButton}
        data-toggle="dropdown"
        aria-haspopup={true}
        aria-label={`${name} filter dropdown`}
        onClick={toggleDropdown}
        disabled={disabled}
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
        <span className={moduleStyles.dropdownLabel}>{labelText}</span>
        <FontAwesomeV6Icon iconStyle="solid" iconName="chevron-down" />
      </button>
      {/** Dropdown menu content is rendered here as children props*/}
      {children}
    </div>
  );
};

export default CustomDropdown;

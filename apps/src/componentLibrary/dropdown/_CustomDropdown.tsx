import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  KeyboardEvent,
} from 'react';
import classNames from 'classnames';

import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './customDropdown.module.scss';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {
  DropdownProviderWrapper,
  useDropdownContext,
} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';
import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';

export interface CustomDropdownProps {
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
  /** Does custom dropdown hase a selected value */
  isSomeValueSelected?: boolean;
  /** Whether to close dropdown on click */
  isCloseOnClick?: boolean;
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
  disabled = false,
  color = dropdownColors.black,
  isCloseOnClick = false,
  size = 'm',
}) => {
  const {activeDropdownName, setActiveDropdownName} = useDropdownContext();
  const dropdownRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

  const handleClickOutside = useCallback(
    (event: Event) => {
      if (
        activeDropdownName &&
        dropdownRef.current &&
        event.target instanceof Node &&
        (!dropdownRef.current.contains(event.target) || isCloseOnClick)
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

  // TODO: CustomDropdown (private), CheckboxDropdown and IconDropdown (public)
  // TODO: update locales logic
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
        <span className={moduleStyles.dropdownLabel}>{labelText}</span>
        <FontAwesomeV6Icon iconStyle="solid" iconName="chevron-down" />
      </button>
      {/** Dropdown menu content is rendered here as children props*/}
      {children}
    </div>
  );
};

const WrappedCustomDropdown = (props: CustomDropdownProps) => (
  <DropdownProviderWrapper>
    <CustomDropdown {...props} />
  </DropdownProviderWrapper>
);

WrappedCustomDropdown.DropdownColors = dropdownColors;

export default WrappedCustomDropdown;

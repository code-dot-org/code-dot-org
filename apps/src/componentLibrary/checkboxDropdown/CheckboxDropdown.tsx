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
import moduleStyles from './checkboxDropdown.module.scss';
import Button from '@cdo/apps/templates/Button';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import i18n from '@cdo/locale';

import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {
  DropdownProviderWrapper,
  useDropdownContext,
} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';
import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';

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
  const {activeDropdownName, setActiveDropdownName} = useDropdownContext();
  const dropdownRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

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
        {checkedOptions.length > 0 && (
          <FontAwesomeV6Icon
            iconName="check-circle"
            iconStyle="solid"
            title={i18n.filterCheckIconTitle({filter_label: labelText})}
          />
        )}
        <span className={moduleStyles.dropdownLabel}>{labelText}</span>
        <FontAwesomeV6Icon iconStyle="solid" iconName="chevron-down" />
      </button>
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
            text={i18n.selectAll()}
            onClick={onSelectAll}
            styleAsText
            color={Button.ButtonColor.brandSecondaryDefault}
          />
          <Button
            type="button"
            text={i18n.clearAll()}
            onClick={onClearAll}
            styleAsText
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </div>
      </form>
    </div>
  );
};

const WrappedCheckboxDropdown = (props: CheckboxDropdownProps) => (
  <DropdownProviderWrapper>
    <CheckboxDropdown {...props} />
  </DropdownProviderWrapper>
);

WrappedCheckboxDropdown.DropdownColors = dropdownColors;

export default WrappedCheckboxDropdown;

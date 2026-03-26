import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  AriaAttributes,
  KeyboardEvent,
  memo,
} from 'react';

import {sizeMap as buttonSizeToMuiSizeMap} from '@/button/buttonPropsToMuiCore';
import {
  ComponentLibraryButtonProps,
  ComponentLibraryIconButtonProps,
} from '@/button/muiButtonProps';
import {dropdownColors} from '@/common/constants';
import {
  DropdownProviderWrapper,
  useDropdownContext,
} from '@/common/contexts/DropdownContext';
import {getAriaPropsFromProps} from '@/common/helpers';
import {ComponentSizeXSToL, DropdownColor} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './customDropdown.module.scss';

export interface TriggerComponentProps extends AriaAttributes {
  id: string;
  onClick: () => void;
  disabled: boolean;
  'aria-haspopup': boolean;
  'aria-label': string;
  'data-toggle': string;
}

export interface CustomDropdownOption {
  value: string;
  label: string;
  isOptionDisabled?: boolean;
}

export type CustomDropdownMenuPlacement = 'left' | 'right';
export type CustomDropdownMenuVerticalPlacement = 'top' | 'bottom';

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
  menuPlacement?: CustomDropdownMenuPlacement;
  /** CustomDropdown vertical menu placement */
  menuVerticalPlacement?: CustomDropdownMenuVerticalPlacement;
  /** CustomDropdown disabled state */
  disabled?: boolean;
  /** CustomDropdown readOnly state */
  readOnly?: boolean;
  /** CustomDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** CustomDropdown label style type*/
  labelType?: 'thick' | 'thin';
  /** Does custom dropdown hase a selected value (Renders a checkmark icon in the dropdown button if true) */
  isSomeValueSelected?: boolean;
  /** Custom icon to show for the dropdown button*/
  icon?: FontAwesomeV6IconProps;
  /** Whether to use MUI Button component as DropdownTrigger or not */
  useMuiButtonAsTrigger?: boolean;
  /** Whether to use MUI IconButton component as DropdownTrigger or not */
  useMuiIconButtonAsTrigger?: boolean;
  /** @deprecated Use useMuiButtonAsTrigger instead */
  useDSCOButtonAsTrigger?: boolean;
  /** Dropdown Trigger MUI Button Props (or IconButton props when useMuiIconButtonAsTrigger is true) */
  triggerButtonProps?:
    | ComponentLibraryButtonProps
    | ComponentLibraryIconButtonProps;
  /** Children */
  children: React.ReactNode;
  /** CustomDropdown helper message */
  helperMessage?: string;
  /** CustomDropdown helper icon */
  helperIcon?: FontAwesomeV6IconProps;
  /** CustomDropdown error message */
  errorMessage?: string;
  /** Style the dropdown as a form field */
  styleAsFormField?: boolean;
  /** (used with styleAsFormField: true) Selected value text */
  selectedValueText?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/CustomDropdown.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: CustomDropdown Component.
 * Renders CustomDropdown with content passed through props.
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
  readOnly = false,
  color = dropdownColors.black,
  size = 'm',
  menuPlacement = 'left',
  menuVerticalPlacement = 'bottom',
  useMuiButtonAsTrigger = false,
  useMuiIconButtonAsTrigger = false,
  useDSCOButtonAsTrigger = false,
  triggerButtonProps = {} as
    | ComponentLibraryButtonProps
    | ComponentLibraryIconButtonProps,
  helperMessage,
  helperIcon,
  errorMessage,
  styleAsFormField = false,
  selectedValueText,
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
    [dropdownRef, setActiveDropdownName, activeDropdownName],
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

  const useButtonTrigger =
    useMuiButtonAsTrigger ||
    useMuiIconButtonAsTrigger ||
    useDSCOButtonAsTrigger;

  useEffect(() => {
    if (useButtonTrigger && !triggerButtonProps) {
      console.warn(
        'Warning: `triggerButtonProps` must be defined when `useMuiButtonAsTrigger` or `useMuiIconButtonAsTrigger` is true.',
      );
    }
  }, [useButtonTrigger, triggerButtonProps]);

  useEffect(() => {
    if (color === dropdownColors.white) {
      console.warn(
        'CustomDropdown: `white` variant is deprecated. Use `black` or `gray` and define theme context for light or dark.',
      );
    }
  }, [color]);

  const toggleDropdown = useCallback(() => {
    if (activeDropdownName !== name) {
      setActiveDropdownName(name);
    } else {
      setActiveDropdownName('');
    }
  }, [name, activeDropdownName, setActiveDropdownName]);

  const isOpen = useMemo(
    () => activeDropdownName === name,
    [activeDropdownName, name],
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
    disabled: disabled || readOnly,
    ...ariaProps,
    'aria-haspopup': true,
    'aria-label': ariaProps['aria-label'] || `${name} filter dropdown`,
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      id={`${name}-dropdown`}
      className={classNames(
        {
          [moduleStyles.open]: isOpen,
          [moduleStyles.hasError]: errorMessage,
          [moduleStyles.readOnly]: readOnly,
          [moduleStyles.styleAsFormField]: styleAsFormField,
        },
        moduleStyles.dropdownContainer,
        moduleStyles[`dropdownContainer-${menuPlacement}-menuPlacement`],
        moduleStyles[
          `dropdownContainer-${menuVerticalPlacement}-menuVerticalPlacement`
        ],
        moduleStyles[`dropdownContainer-${color}`],
        moduleStyles[`dropdownContainer-${size}`],
        className,
      )}
      onKeyDown={onKeyDown}
      ref={dropdownRef}
      aria-describedby={ariaProps['aria-describedby']}
    >
      {styleAsFormField && labelText && (
        <div className={moduleStyles.dropdownFieldLabel}>
          <span>{labelText}</span>
        </div>
      )}
      {useButtonTrigger ? (
        (() => {
          const muiSize = buttonSizeToMuiSizeMap[size] || 'medium';
          const sharedTriggerProps = {
            id: triggerComponentProps.id,
            onClick: triggerComponentProps.onClick,
            disabled: triggerComponentProps.disabled,
            'aria-haspopup': triggerComponentProps['aria-haspopup'] as true,
            'data-toggle': triggerComponentProps['data-toggle'],
            className: isOpen ? 'force-hover' : undefined,
            'data-force-hover': isOpen || undefined,
            'aria-label':
              triggerButtonProps?.['aria-label'] ||
              (useMuiIconButtonAsTrigger ? labelText : undefined) ||
              triggerComponentProps['aria-label'],
          };

          return useMuiIconButtonAsTrigger ? (
            <MuiIconButton
              size={muiSize}
              {...sharedTriggerProps}
              {...(triggerButtonProps as ComponentLibraryIconButtonProps)}
            />
          ) : (
            <MuiButton
              size={muiSize}
              {...sharedTriggerProps}
              {...(triggerButtonProps as ComponentLibraryButtonProps)}
            />
          );
        })()
      ) : (
        <button
          {...triggerComponentProps}
          type="button"
          className={classNames(
            moduleStyles.dropdownButton,
            isOpen && moduleStyles.activeDropdownButton,
          )}
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
              moduleStyles[
                `dropdownLabel-${styleAsFormField ? 'thin' : labelType}`
              ],
            )}
          >
            {styleAsFormField ? selectedValueText : labelText}
          </span>
          <FontAwesomeV6Icon iconStyle="solid" iconName="chevron-down" />
        </button>
      )}
      <div className={moduleStyles.dropdownMenuContainer}>
        {/** Dropdown menu content is rendered here as children props*/}
        {children}
      </div>

      {!errorMessage && (helperMessage || helperIcon) && (
        <div className={moduleStyles.helperSection}>
          {helperIcon && <FontAwesomeV6Icon {...helperIcon} />}
          {helperMessage && <span>{helperMessage}</span>}
        </div>
      )}
      {errorMessage && (
        <div
          className={classNames(
            moduleStyles.errorSection,
            moduleStyles.helperSection,
          )}
        >
          <FontAwesomeV6Icon iconName="circle-exclamation" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

const WrappedCustomDropdown = (props: CustomDropdownProps) => (
  <DropdownProviderWrapper>
    <CustomDropdown {...props} />
  </DropdownProviderWrapper>
);

export default memo(WrappedCustomDropdown);

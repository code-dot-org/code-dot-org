import {Button as MuiButton} from '@mui/material';
import {AriaAttributes} from 'react';

import Checkbox from '@/checkbox';
import {dropdownColors} from '@/common/constants';
import {useDropdownContext} from '@/common/contexts/DropdownContext';
import {
  ComponentSizeXSToL,
  DropdownColor,
  DropdownFormFieldRelatedProps,
} from '@/common/types';

import CustomDropdown, {
  buttonSizeToMuiSizeMap,
  CustomDropdownMenuPlacement,
  CustomDropdownMenuVerticalPlacement,
  CustomDropdownOption,
} from '../CustomDropdown';

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
  /** CheckboxDropdown menu placement */
  menuPlacement?: CustomDropdownMenuPlacement;
  /** CheckboxDropdown menu vertical placement */
  menuVerticalPlacement?: CustomDropdownMenuVerticalPlacement;
}

type ActionClickEvent =
  | React.MouseEvent<HTMLButtonElement>
  | React.MouseEvent<HTMLAnchorElement>;

interface CheckboxDropdownWithoutControlProps
  extends BaseCheckboxDropdownProps {
  hideControls: true;
}

interface CheckboxDropdownWithControlsProps extends BaseCheckboxDropdownProps {
  hideControls?: false;
  onSelectAll: (event: ActionClickEvent) => void;
  onClearAll: (event: ActionClickEvent) => void;
  /** Shown on the toggle when nothing is selected. */
  selectAllText: string;
  /** Shown on the toggle when one or more options are selected. */
  clearAllText: string;
  /** Closes the menu. Selection count is appended when greater than zero, e.g. "Done (2)". */
  doneText: string;
}

export type CheckboxDropdownProps =
  | CheckboxDropdownWithoutControlProps
  | CheckboxDropdownWithControlsProps;

function actionButtonSize(
  size: ComponentSizeXSToL,
): 'medium' | 'small' | 'extraSmall' {
  if (size === 'l') {
    return 'medium';
  }
  if (size === 'm') {
    return 'small';
  }
  return 'extraSmall';
}

const CheckboxDropdownActionRow: React.FunctionComponent<{
  name: string;
  size: ComponentSizeXSToL;
  selectionCount: number;
  onSelectAll: (event: ActionClickEvent) => void;
  onClearAll: (event: ActionClickEvent) => void;
  selectAllText: string;
  clearAllText: string;
  doneText: string;
}> = ({
  name,
  size,
  selectionCount,
  onSelectAll,
  onClearAll,
  selectAllText,
  clearAllText,
  doneText,
}) => {
  const {setActiveDropdownName} = useDropdownContext();
  const hasSelection = selectionCount > 0;

  return (
    <div className={moduleStyles.bottomButtonsContainer}>
      <MuiButton
        variant="text"
        color="secondary"
        size={actionButtonSize(size)}
        onClick={hasSelection ? onClearAll : onSelectAll}
      >
        {hasSelection ? clearAllText : selectAllText}
      </MuiButton>
      <MuiButton
        variant="contained"
        color="secondary"
        size={actionButtonSize(size)}
        onClick={() => {
          setActiveDropdownName('');
          document.getElementById(`${name}-dropdown-button`)?.focus();
        }}
      >
        {hasSelection ? `${doneText} (${selectionCount})` : doneText}
      </MuiButton>
    </div>
  );
};

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
      color={color}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      isSomeValueSelected={checkedOptions.length > 0}
      helperMessage={helperMessage}
      helperIcon={helperIcon}
      errorMessage={errorMessage}
      styleAsFormField={styleAsFormField}
      selectedValueText={checkedOptions
        ?.map(str => allOptions.find(opt => opt.value === str)?.label)
        .join(', ')}
      menuPlacement={menuPlacement}
      menuVerticalPlacement={menuVerticalPlacement}
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
        <CheckboxDropdownActionRow
          name={name}
          size={size}
          selectionCount={checkedOptions.length}
          onSelectAll={rest.onSelectAll}
          onClearAll={rest.onClearAll}
          selectAllText={rest.selectAllText}
          clearAllText={rest.clearAllText}
          doneText={rest.doneText}
        />
      )}
    </CustomDropdown>
  );
};

export default CheckboxDropdown;

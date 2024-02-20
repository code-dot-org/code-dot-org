import React, {useCallback} from 'react';

import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from '@cdo/apps/componentLibrary/dropdown/customDropdown.module.scss';

import CustomDropdown from '@cdo/apps/componentLibrary/dropdown/_CustomDropdown';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import i18n from '@cdo/apps/locale';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';
import {
  DropdownProviderWrapper,
  useDropdownContext,
} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';

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
  onChange: (args: React.MouseEvent<HTMLLIElement>) => void;
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
const IconDropdown: React.FunctionComponent<CheckboxDropdownProps> = ({
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
  const onOptionClick = useCallback(
    (args: React.MouseEvent<HTMLLIElement>) => {
      onChange(args);
      setActiveDropdownName('');
    },
    [onChange, setActiveDropdownName]
  );
  return (
    <CustomDropdown
      name={name}
      labelText={labelText}
      disabled={disabled}
      color={color}
      size={size}
    >
      <form className={moduleStyles.dropdownMenuContainer}>
        <ul>
          {allOptions.map(({value, label, isOptionDisabled}) => (
            <li key={value} onClick={onOptionClick}>
              <div className={moduleStyles.dropdownMenuItem}>
                <FontAwesomeV6Icon iconName={'check'} iconStyle={'solid'} />
                <span>{label}</span>
              </div>
            </li>
          ))}
        </ul>
      </form>
    </CustomDropdown>
  );
};

const WrappedIconDropdown = (props: CheckboxDropdownProps) => (
  <DropdownProviderWrapper>
    <IconDropdown {...props} />
  </DropdownProviderWrapper>
);

export default WrappedIconDropdown;

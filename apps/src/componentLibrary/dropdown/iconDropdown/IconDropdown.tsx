import React, {useCallback} from 'react';
import classNames from 'classnames';

import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from '@cdo/apps/componentLibrary/dropdown/customDropdown.module.scss';

import CustomDropdown from '@cdo/apps/componentLibrary/dropdown/_CustomDropdown';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import i18n from '@cdo/apps/locale';

import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import {dropdownColors} from '@cdo/apps/componentLibrary/common/constants';
import {
  DropdownProviderWrapper,
  useDropdownContext,
} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';

export interface IconDropdownProps {
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
  options: {
    value: string;
    label: string;
    isOptionDisabled?: boolean;
    icon: FontAwesomeV6IconProps;
  }[];
  /** CheckboxDropdown checked options */
  checkedOptions: string[];
  /** CheckboxDropdown onChange handler */
  onChange: (args: React.MouseEvent<HTMLLIElement>) => void;
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
const IconDropdown: React.FunctionComponent<IconDropdownProps> = ({
  name,
  labelText,
  options,
  checkedOptions = [],
  onChange,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
}) => {
  const {setActiveDropdownName} = useDropdownContext();
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
          {options.map(
            ({
              value,
              label,
              isOptionDisabled,
              icon: {
                iconName,
                iconStyle,
                title: iconTitle,
                className: iconClassName,
              },
            }) => (
              <li key={value} onClick={onOptionClick}>
                <div
                  className={classNames(
                    moduleStyles.dropdownMenuItem,
                    isOptionDisabled && moduleStyles.disabledDropdownMenuItem,
                    false && moduleStyles.selectedDropdownMenuItem
                  )}
                >
                  <FontAwesomeV6Icon
                    iconName={iconName}
                    iconStyle={iconStyle}
                    title={iconTitle}
                    className={iconClassName}
                  />
                  <span>{label}</span>
                </div>
              </li>
            )
          )}
        </ul>
      </form>
    </CustomDropdown>
  );
};

const WrappedIconDropdown = (props: IconDropdownProps) => (
  <DropdownProviderWrapper>
    <IconDropdown {...props} />
  </DropdownProviderWrapper>
);

export default WrappedIconDropdown;

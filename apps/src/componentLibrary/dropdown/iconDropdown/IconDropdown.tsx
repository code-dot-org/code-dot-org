import React, {useCallback, memo} from 'react';
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

export interface IconDropdownOption {
  value: string;
  label: string;
  isOptionDisabled?: boolean;
  icon: FontAwesomeV6IconProps;
}

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
  options: IconDropdownOption[];
  /** CheckboxDropdown checked options */
  selectedOption: IconDropdownOption;
  /** CheckboxDropdown onChange handler */
  onChange: (option: IconDropdownOption) => void;
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
 * Design System: Icon Dropdown Component.
 * Used to render dropdowns with a list of options with icons.
 */
const IconDropdown: React.FunctionComponent<IconDropdownProps> = ({
  name,
  labelText,
  options,
  selectedOption = {},
  onChange,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
}) => {
  const {setActiveDropdownName} = useDropdownContext();
  const onOptionClick = useCallback(
    (option: IconDropdownOption) => {
      onChange(option);
      // console.log(
      //   option
      //   // args.target,
      //   // args.target.value,
      //   // args.target.dataValue,
      //   // args.target['data-value']
      // );
      setActiveDropdownName('');
    },
    [onChange, setActiveDropdownName]
  );

  console.log('rerender');
  return (
    <CustomDropdown
      name={name}
      labelText={labelText}
      disabled={disabled}
      color={color}
      // isSomeValueSelected={true}
      icon={selectedOption?.icon}
      size={size}
    >
      <form className={moduleStyles.dropdownMenuContainer}>
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
              <li key={value} onClick={() => onOptionClick(option)}>
                <div
                  className={classNames(
                    moduleStyles.dropdownMenuItem,
                    isOptionDisabled && moduleStyles.disabledDropdownMenuItem,
                    selectedOption.value === value &&
                      moduleStyles.selectedDropdownMenuItem
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
            );
          })}
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

export default memo(WrappedIconDropdown);

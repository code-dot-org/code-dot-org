// Dropdown for theme selection that shows sample icons of what
// each theme will look like
import {useDropdownContext} from '@code-dot-org/component-library/common/contexts';
import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {themeOptionsForSelect} from '../constants';
import applabMsg from '../locale';

import moduleStyles from './theme-dropdown.module.scss';

export interface ThemeMenuProps {
  selectedValue: string;
  onSelect: (value: string) => void;
}

// Rendered as a child of CustomDropdown so useDropdownContext resolves to
// the provider CustomDropdown wraps itself in; calling it from ThemeDropdown's
// level would reach a different context and the menu would not close on
// select (see the workaround comment in aiTeacherDrawer/AiDiffChatHeader.tsx).
function ThemeMenu({selectedValue, onSelect}: ThemeMenuProps) {
  const {setActiveDropdownName} = useDropdownContext();

  return (
    <ul className={moduleStyles.menu}>
      {themeOptionsForSelect.map(themeOption => (
        <li key={themeOption.option}>
          <button
            type="button"
            className={classNames(
              moduleStyles.option,
              selectedValue === themeOption.option &&
                moduleStyles.selectedOption
            )}
            onClick={() => {
              onSelect(themeOption.option);
              setActiveDropdownName('');
            }}
          >
            <img
              src={themeOption.icon}
              alt={applabMsg.iconForTheme({selectedTheme: themeOption.option})}
            />
            <MuiTypography variant="body3" component="span">
              {applabMsg[
                `designElementTheme_${themeOption.option}` as keyof typeof applabMsg
              ]()}
            </MuiTypography>
          </button>
        </li>
      ))}
    </ul>
  );
}

export interface ThemeDropdownProps {
  initialValue: string;
  handleChange: (value: string) => void;
  description?: string;
}

export const ThemeDropdown = ({
  initialValue,
  handleChange,
  description,
}: ThemeDropdownProps) => {
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const onSelect = (value: string) => {
    handleChange(value);
    setSelectedValue(value);
  };

  return (
    <CustomDropdown
      name="design-toolbox-theme"
      className={moduleStyles.themeDropdown}
      size="s"
      styleAsFormField={true}
      labelText={description || ''}
      selectedValueText={applabMsg[
        `designElementTheme_${selectedValue}` as keyof typeof applabMsg
      ]()}
      aria-label={description}
    >
      <ThemeMenu selectedValue={selectedValue} onSelect={onSelect} />
    </CustomDropdown>
  );
};

export default ThemeDropdown;

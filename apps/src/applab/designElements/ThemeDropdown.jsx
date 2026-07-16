// Dropdown for theme selection that shows sample icons of what
// each theme will look like
import {useDropdownContext} from '@code-dot-org/component-library/common/contexts';
import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import applabMsg from '@cdo/applab/locale';

import {themeOptionsForSelect} from '../constants';

import moduleStyles from './theme-dropdown.module.scss';

// Rendered as a child of CustomDropdown so useDropdownContext resolves to
// the provider CustomDropdown wraps itself in; calling it from ThemeDropdown's
// level would reach a different context and the menu would not close on
// select (see the workaround comment in aiTeacherDrawer/AiDiffChatHeader.tsx).
function ThemeMenu({selectedValue, onSelect}) {
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
              {applabMsg[`designElementTheme_${themeOption.option}`]()}
            </MuiTypography>
          </button>
        </li>
      ))}
    </ul>
  );
}

ThemeMenu.propTypes = {
  selectedValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default function ThemeDropdown({
  initialValue,
  handleChange,
  description,
}) {
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const onSelect = value => {
    handleChange(value);
    setSelectedValue(value);
  };

  return (
    <CustomDropdown
      name="design-toolbox-theme"
      className={moduleStyles.themeDropdown}
      size="s"
      styleAsFormField={true}
      labelText={description}
      selectedValueText={applabMsg[`designElementTheme_${selectedValue}`]()}
      aria-label={description}
    >
      <ThemeMenu selectedValue={selectedValue} onSelect={onSelect} />
    </CustomDropdown>
  );
}

ThemeDropdown.propTypes = {
  initialValue: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  description: PropTypes.string,
};

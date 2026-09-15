import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';

import {BLOCKLY_THEME, Themes} from '@cdo/apps/blockly/constants';
import commonI18n from '@cdo/locale';

import {setWorkspaceTheme} from '../blockly/utils';
import UserPreferences from '../lib/util/UserPreferences';

const themeOptions = [
  {value: Themes.MODERN, text: commonI18n.blocklyModernTheme()},
  {value: Themes.HIGH_CONTRAST, text: commonI18n.blocklyHighContrastTheme()},
  {value: Themes.PROTANOPIA, text: commonI18n.blocklyProtanopiaTheme()},
  {value: Themes.DEUTERANOPIA, text: commonI18n.blocklyDeuteranopiaTheme()},
  {value: Themes.TRITANOPIA, text: commonI18n.blocklyTritanopiaTheme()},
];

const SettingsModal = ({onClose}) => {
  const [selectedTheme, setSelectedTheme] = useState('');

  useEffect(() => {
    new UserPreferences()
      .getBlocklyTheme(() => ({
        blockly: localStorage.getItem(BLOCKLY_THEME) || Themes.MODERN,
      }))
      .then(theme => setSelectedTheme(theme));
  }, []);

  const handleChange = value => {
    const theme = Blockly.themes[value];
    if (theme) {
      setSelectedTheme(value);
      setWorkspaceTheme(value);
      new UserPreferences().setBlocklyTheme(value, () =>
        localStorage.setItem(BLOCKLY_THEME, value)
      );
    }
  };

  return (
    <Modal
      title={commonI18n.settings()}
      onClose={onClose}
      customContent={
        <SimpleDropdown
          id="dsco-dialog-description"
          name="blockly-theme"
          labelText={commonI18n.blocklyTheme()}
          selectedValue={selectedTheme}
          onChange={e => handleChange(e.target.value)}
          items={themeOptions}
        />
      }
      primaryButtonProps={{
        children: commonI18n.closeDialog(),
        onClick: onClose,
      }}
    />
  );
};

SettingsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default SettingsModal;

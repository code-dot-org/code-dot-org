import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import React, {useState, useEffect} from 'react';

import {BLOCKLY_THEME, Themes} from '@cdo/apps/blockly/constants';
import commonI18n from '@cdo/locale';

import {setAllWorkspacesTheme} from '../blockly/utils';
import UserPreferences from '../lib/util/UserPreferences';

import styles from './settings.module.scss';

const themeOptions = [
  {value: Themes.MODERN, text: commonI18n.blocklyModernTheme()},
  {value: Themes.HIGH_CONTRAST, text: commonI18n.blocklyHighContrastTheme()},
  {value: Themes.PROTANOPIA, text: commonI18n.blocklyProtanopiaTheme()},
  {value: Themes.DEUTERANOPIA, text: commonI18n.blocklyDeuteranopiaTheme()},
  {value: Themes.TRITANOPIA, text: commonI18n.blocklyTritanopiaTheme()},
];

const SettingsModal = () => {
  const [selectedTheme, setSelectedTheme] = useState(undefined);

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
      setAllWorkspacesTheme(theme, Blockly.getMainWorkspace()?.getTheme());
      new UserPreferences().setBlocklyTheme(value, () =>
        localStorage.setItem(BLOCKLY_THEME, value)
      );
    }
  };

  return (
    <div className="modal-content" style={{margin: 0}}>
      <h5 className="dialog-title">{commonI18n.settings()}</h5>
      <div className={styles.settingsRow}>
        <p>{commonI18n.blocklyTheme()}</p>
        <SimpleDropdown
          name="theme"
          items={themeOptions}
          selectedValue={selectedTheme}
          onChange={e => handleChange(e.target.value)}
          isLabelVisible={false}
        />
      </div>
    </div>
  );
};

export default SettingsModal;

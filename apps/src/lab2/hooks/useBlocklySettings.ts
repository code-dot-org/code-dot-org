import {useEffect, useState} from 'react';

import {BLOCKLY_THEME, Themes} from '@cdo/apps/blockly/constants';
import {getBaseName, setWorkspaceTheme} from '@cdo/apps/blockly/utils';
import {Setting} from '@cdo/apps/lab2/views/components/Settings/SettingsDropdown';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {commonI18n} from '@cdo/apps/types/locale';

const blockThemeOptions = [
  {
    value: Themes.MODERN,
    text: commonI18n.blocklyModernTheme(),
  },
  {
    value: Themes.HIGH_CONTRAST,
    text: commonI18n.blocklyHighContrastTheme(),
  },
  {
    value: Themes.PROTANOPIA,
    text: commonI18n.blocklyProtanopiaTheme(),
  },
  {
    value: Themes.DEUTERANOPIA,
    text: commonI18n.blocklyDeuteranopiaTheme(),
  },
  {
    value: Themes.TRITANOPIA,
    text: commonI18n.blocklyTritanopiaTheme(),
  },
];

export function useBlocklySettings(): Setting[] {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    new UserPreferences()
      .getBlocklyTheme(() =>
        getBaseName(
          (localStorage.getItem(BLOCKLY_THEME) || Themes.MODERN) as Themes
        )
      )
      .then((theme: string) => {
        setSelectedTheme(theme);
      });
  }, []);

  const handleBlocklyThemeChange = (name: string) => {
    setWorkspaceTheme(Blockly.getMainWorkspace(), name);
    setSelectedTheme(name);
  };

  return [
    {
      id: 'blocklyTheme',
      label: commonI18n.blocklyTheme(),
      options: blockThemeOptions,
      selectedValue: selectedTheme || undefined,
      onChange: handleBlocklyThemeChange,
    },
  ];
}

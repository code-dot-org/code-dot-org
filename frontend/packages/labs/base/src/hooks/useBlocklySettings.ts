import {useEffect, useState} from 'react';

import {useBlocklyContext} from '@code-dot-org/blockly-workspace/contexts';
import {themes, themeOptions} from '@code-dot-org/blockly-workspace/themes';

import type {Setting} from '../resourcePanel/types';
import UserPreferences from '../UserPreferences';

const BLOCKLY_THEME = 'blocklyTheme';

export function useBlocklySettings(): Setting[] {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const {setTheme} = useBlocklyContext();

  useEffect(() => {
    new UserPreferences()
      .getBlocklyTheme(
        () => localStorage.getItem(BLOCKLY_THEME) || themeOptions[0].value,
      )
      .then((theme: string | undefined) => {
        setSelectedTheme(theme || themeOptions[0].value);
      });
  }, []);

  const handleBlocklyThemeChange = (name: string) => {
    setTheme(themes[name]);
    setSelectedTheme(name);
  };

  return [
    {
      id: 'blocklyTheme',
      label: 'Block Color Theme',
      options: [...themeOptions],
      selectedValue: selectedTheme || undefined,
      onChange: handleBlocklyThemeChange,
    },
  ];
}

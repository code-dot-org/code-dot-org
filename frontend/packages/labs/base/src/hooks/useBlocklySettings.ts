import {useEffect, useCallback} from 'react';

import {
  useApiClient,
  useUpdateThemeSettings,
  useThemeSettings,
} from '@code-dot-org/core/api';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {useBlocklyContext} from '@code-dot-org/blockly-workspace/contexts';
import {themes, themeOptions} from '@code-dot-org/blockly-workspace/themes';

import type {SettingWithValue} from '../resourcePanel/types';

const BLOCKLY_THEME = 'blocklyTheme';

export function useBlocklySettings(): SettingWithValue[] {
  const api = useApiClient();
  const {data: themeSettings} = useThemeSettings(api, {
    errorCallback: () => ({
      blockly: localStorage.getItem(BLOCKLY_THEME) || themeOptions[0].value,
    }),
  });
  const {mutate: setThemeSettings} = useUpdateThemeSettings(api);
  const {theme: siteTheme} = useTheme();

  const {setTheme} = useBlocklyContext();

  const selectedTheme = themeSettings?.blockly || themeOptions[0].value;

  // Switch the blockly theme to match the site dark/light theme
  useEffect(() => {
    const suffix = siteTheme === 'Dark' ? '-dark' : '';
    setTheme(themes[`${selectedTheme}${suffix}`]);
  }, [setTheme, selectedTheme, siteTheme]);

  const handleBlocklyThemeChange = useCallback(
    (name: string) => {
      const suffix = siteTheme === 'Dark' ? '-dark' : '';
      setTheme(themes[`${name}${suffix}`]);
      setThemeSettings({
        themeUpdate: {
          blockly: name,
        },
      });
    },
    [setTheme, setThemeSettings, siteTheme],
  );

  return [
    {
      id: 'blocklyTheme',
      label: 'Block Color Theme',
      options: [...themeOptions],
      selectedValue: selectedTheme,
      onChange: handleBlocklyThemeChange,
    },
  ];
}

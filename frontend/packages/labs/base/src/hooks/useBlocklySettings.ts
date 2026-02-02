import {
  useApiClient,
  useUpdateThemeSettings,
  useThemeSettings,
} from '@code-dot-org/core/api';
import {useBlocklyContext} from '@code-dot-org/blockly-workspace/contexts';
import {themes, themeOptions} from '@code-dot-org/blockly-workspace/themes';

import type {Setting} from '../resourcePanel/types';

const BLOCKLY_THEME = 'blocklyTheme';

export function useBlocklySettings(): Setting[] {
  const api = useApiClient();
  const {data: themeSettings} = useThemeSettings(api, {
    errorCallback: () => ({
      blockly: localStorage.getItem(BLOCKLY_THEME) || themeOptions[0].value,
    }),
  });
  const {mutate: setThemeSettings} = useUpdateThemeSettings(api);

  const {setTheme} = useBlocklyContext();

  const selectedTheme = themeSettings?.blockly || themeOptions[0].value;

  const handleBlocklyThemeChange = (name: string) => {
    setTheme(themes[name]);
    setThemeSettings({
      themeUpdate: {
        blockly: name,
      },
    });
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

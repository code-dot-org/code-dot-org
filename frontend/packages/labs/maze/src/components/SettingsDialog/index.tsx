import {
  useApiClient,
  useUpdateThemeSettings,
  useThemeSettings,
} from '@code-dot-org/core/api';
import {useState, type ChangeEvent} from 'react';
import Dialog, {type DialogProps} from '@code-dot-org/component-library/dialog';
import {
  SimpleDropdown,
  type SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import {themes, themeOptions} from '@code-dot-org/blockly-workspace/themes';
import {useBlocklyContext} from '@code-dot-org/blockly-workspace/contexts';

import moduleStyles from './settingsDialog.module.scss';

const BLOCKLY_THEME = 'blocklyTheme';

interface SettingsDialogContentProps {
  selectedTheme: string;
  setSelectedTheme: (value: string) => void;
}

const SettingsDialogContent = ({
  selectedTheme,
  setSelectedTheme,
}: SettingsDialogContentProps) => {
  const api = useApiClient();
  const {setTheme} = useBlocklyContext();
  const {mutate: setThemeSettings} = useUpdateThemeSettings(api);

  return (
    <>
      <SimpleDropdown
        name="theme"
        labelText="Block Color Theme"
        selectedValue={selectedTheme}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const name = event.target.value;
          // We pre-emptively set the theme, here
          // That way the update is 'instant'
          setTheme(themes[name]);
          setSelectedTheme(name);
          // Update the user preference to save the setting
          setThemeSettings({
            themeUpdate: {
              blockly: name,
            },
          });
        }}
        items={themeOptions as unknown as SimpleDropdownProps['items']}
      />
      <SimpleDropdown
        name="language"
        labelText="Language"
        onChange={() => {}}
        items={[
          {
            value: 'en',
            text: 'English',
          },
        ]}
      />
    </>
  );
};

export interface SettingsDialogProps {
  onClose: DialogProps['onClose'];
}

const SettingsDialog = ({onClose}: SettingsDialogProps) => {
  const api = useApiClient();
  const {data: themeSettings} = useThemeSettings(api, {
    errorCallback: () => ({
      blockly: localStorage.getItem(BLOCKLY_THEME) || themeOptions[0].value,
    }),
  });
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const currentTheme =
    selectedTheme || themeSettings?.blockly || themeOptions[0].value;

  return (
    <Dialog
      title="Settings"
      customContent={
        <SettingsDialogContent
          selectedTheme={currentTheme}
          setSelectedTheme={setSelectedTheme}
        />
      }
      primaryButtonProps={{
        text: 'Close',
        onClick: () => {
          // Null out the selected theme so the next time we open the dialog
          // it uses the one from the API call
          setSelectedTheme(null);
          onClose?.();
        },
      }}
      className={moduleStyles.settingsDialog}
      closeLabel="Close Settings"
      icon={{
        iconName: 'gear',
        iconStyle: 'solid',
      }}
      onClose={onClose}
    />
  );
};

export default SettingsDialog;

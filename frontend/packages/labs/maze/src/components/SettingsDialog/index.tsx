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

const SettingsDialogContent = () => {
  const api = useApiClient();
  const {data: themeSettings} = useThemeSettings(api, {
    errorCallback: () => ({
      blockly: localStorage.getItem(BLOCKLY_THEME) || themeOptions[0].value,
    }),
  });
  const {setTheme} = useBlocklyContext();
  const {mutate: setThemeSettings} = useUpdateThemeSettings(api);
  const [selectedTheme, setSelectedTheme] = useState<string>(
    themeSettings?.blockly || themeOptions[0].value,
  );

  return (
    <>
      <SimpleDropdown
        name="theme"
        labelText="Block Color Theme"
        selectedValue={selectedTheme}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const name = event.target.value;
          console.log('setting theme to', name);
          setSelectedTheme(name);
          setTheme(themes[name]);
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
  return (
    <Dialog
      title="Settings"
      customContent={<SettingsDialogContent />}
      primaryButtonProps={{
        text: 'Close',
        onClick: onClose,
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

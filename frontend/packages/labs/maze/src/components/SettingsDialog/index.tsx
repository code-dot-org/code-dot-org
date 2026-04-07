import {useState, type ChangeEvent} from 'react';
import Dialog, {type DialogProps} from '@code-dot-org/component-library/dialog';
import {
  SimpleDropdown,
  type SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import {themeOptions} from '@code-dot-org/blockly-workspace/themes';
import {useBlocklySettings} from '@code-dot-org/lab/hooks';
import {
  useTheme,
  type Theme,
} from '@code-dot-org/component-library/common/contexts';

import moduleStyles from './settingsDialog.module.scss';

interface SettingsDialogContentProps {
  selectedTheme: string;
  setSelectedTheme: (value: string) => void;
}

const SettingsDialogContent = ({
  selectedTheme,
  setSelectedTheme,
}: SettingsDialogContentProps) => {
  const {onChange} = useBlocklySettings()[0];

  const {theme, setTheme} = useTheme();

  return (
    <>
      <p id="dsco-dialog-description" hidden>
        This dialog has several dropdowns to select different visual themes and
        the language
      </p>
      <SimpleDropdown
        name="theme"
        labelText="Block Color Theme"
        selectedValue={selectedTheme}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const name = event.target.value;
          onChange(name);
          setSelectedTheme(name);
        }}
        items={themeOptions as unknown as SimpleDropdownProps['items']}
      />
      <SimpleDropdown
        name="site-theme"
        labelText="Site Theme"
        selectedValue={theme}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const name = event.target.value as Theme;
          setTheme(name);
        }}
        items={[
          {
            value: 'Light',
            text: 'Light',
          },
          {
            value: 'Dark',
            text: 'Dark',
          },
        ]}
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
  const {selectedValue} = useBlocklySettings()[0];
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const currentTheme = selectedTheme || selectedValue || themeOptions[0].value;

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

import type {ChangeEvent, FunctionComponent} from 'react';
import {useEffect, useState} from 'react';

import CloseButton from '@code-dot-org/component-library/closeButton';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import localization, {useLocalization} from '@code-dot-org/localization';
import type {LanguageInfo} from '@code-dot-org/localization';
import {EVENTS} from '@code-dot-org/metrics';

import PanelContainer from '../../components/PanelContainer';
import {sendLabAnalyticsEvent} from '../../utils/analyticsReporterHelper';
import type {Setting} from '../types';

import styles from './settings-panel.module.scss';

export interface SettingsPanelProps {
  settings: Setting[];
  closePanel: () => void;
  appName: string;
}

const SettingsPanel: FunctionComponent<SettingsPanelProps> = ({
  settings,
  closePanel,
}) => {
  const {theme} = useTheme();
  // SimpleDropdown isn't themed properly, so we have to manually set the color.
  const dropdownColor = theme === 'Dark' ? 'white' : 'gray';
  const locale = useLocalization();
  const [localeOptions, setLocaleOptions] = useState<LanguageInfo[]>(
    localization.locales,
  );

  useEffect(() => {
    // Set up a listener for localization changes.
    localization.on('change', _ => {
      setLocaleOptions(localization.locales);
    });

    // On load, focus the language dropdown.
    const languageDropdown = document.getElementById(
      'settings-language-dropdown',
    );
    languageDropdown?.focus();
  }, []);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    sendLabAnalyticsEvent(EVENTS.RESOURCE_PANEL_LANGUAGE_CHANGE, {
      languageChangedTo: event.target.value,
      languageChangedFrom: locale,
    });

    if (localization.isLocalizeJS()) {
      localization.locale = event.target.value;
    } else {
      event.target.form?.submit();
    }
  };

  const handleSettingChange = (
    setting: Setting,
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    sendLabAnalyticsEvent(EVENTS.RESOURCE_PANEL_SETTINGS_CHANGE, {
      settingName: setting.label,
      settingChangedTo: event.target.value,
      settingChangedFrom: setting.selectedValue || '',
    });
    setting.onChange(event.target.value);
  };

  return (
    <PanelContainer
      id="settings-panel"
      headerContent="Settings"
      className={styles.settingsPanel}
      headerClassName={styles.settingsHeader}
      rightHeaderContent={
        <CloseButton onClick={closePanel} aria-label="Close Settings" />
      }
    >
      <div className={styles.settingsList}>
        <form
          action={'/locale'}
          method="post"
          style={{marginBottom: '0px'}}
          data-notranslate=""
          className={styles.languageForm}
        >
          <input
            type="hidden"
            name="user_return_to"
            value={window.location.href}
          />
          <SimpleDropdown
            name="locale"
            selectedValue={locale}
            onChange={handleLanguageChange}
            items={localeOptions}
            labelText="Language"
            isLabelVisible={true}
            size="s"
            color={dropdownColor}
            dropdownTextThickness="thin"
            className={styles.dropdown}
            id={'settings-language-dropdown'}
          />
        </form>
        {settings.map(setting => (
          <SimpleDropdown
            key={setting.id}
            labelText={setting.label}
            isLabelVisible={true}
            onChange={event => handleSettingChange(setting, event)}
            items={setting.options}
            selectedValue={setting.selectedValue}
            name={setting.id}
            size="s"
            color={dropdownColor}
            dropdownTextThickness="thin"
            className={styles.dropdown}
          />
        ))}
      </div>
    </PanelContainer>
  );
};

export default SettingsPanel;

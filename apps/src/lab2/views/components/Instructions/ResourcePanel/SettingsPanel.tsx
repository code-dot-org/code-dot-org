import CloseButton from '@code-dot-org/component-library/closeButton';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import Typography from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {Setting} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import localization, {useLocalization} from '@cdo/apps/localization';
import {LanguageInfo} from '@cdo/apps/localization/Localization';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import styles from './settings-panel.module.scss';
interface SettingsPanelProps {
  settings: Setting[];
  closePanel: () => void;
  appName: string;
}

const SettingsPanel: React.FunctionComponent<SettingsPanelProps> = ({
  settings,
  closePanel,
  appName,
}) => {
  const {theme} = useTheme();
  // SimpleDropdown isn't themed properly, so we have to manually set the color.
  const dropdownColor = theme === 'Dark' ? 'white' : 'black';
  const locale = useLocalization();
  const [localeOptions, setLocaleOptions] = useState<LanguageInfo[]>(
    localization.locales
  );
  const levelPath = useAppSelector(state => getCurrentLevel(state)?.path);

  useEffect(() => {
    // Set up a listener for localization changes.
    localization.on('change', info => {
      setLocaleOptions(localization.locales);
    });

    // On load, focus the language dropdown.
    const languageDropdown = document.getElementById(
      'settings-language-dropdown'
    );
    languageDropdown?.focus();
  }, []);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    sendLab2AnalyticsEvent(EVENTS.RESOURCE_PANEL_LANGUAGE_CHANGE, appName, {
      languageChangedTo: event.target.value,
      languageChangedFrom: locale,
      levelPath,
    });
    event.target.form?.submit();
  };

  const handleSettingChange = (
    setting: Setting,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    sendLab2AnalyticsEvent(EVENTS.RESOURCE_PANEL_SETTINGS_CHANGE, appName, {
      settingName: setting.label,
      settingChangedTo: event.target.value,
      settingChangedFrom: setting.selectedValue || '',
      levelPath,
    });
    setting.onChange(event.target.value);
  };

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.header}>
        <Typography
          semanticTag="h2"
          visualAppearance="overline-two"
          className={styles.headerText}
        >
          {commonI18n.settings()}
        </Typography>
        <CloseButton
          onClick={closePanel}
          aria-label={commonI18n.closeSettings()}
        />
      </div>
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
            labelText={commonI18n.language()}
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
    </div>
  );
};

export default SettingsPanel;

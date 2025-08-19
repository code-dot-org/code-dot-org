import CloseButton from '@code-dot-org/component-library/closeButton';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {LocaleProps} from '@cdo/apps/lab2/types';
import {Setting} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {commonI18n} from '@cdo/apps/types/locale';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';

import styles from './settings-panel.module.scss';
interface SettingsPanelProps {
  settings: Setting[];
  closePanel: () => void;
}

function getLocaleProps() {
  if (hasScriptData('script[data-localeProps]')) {
    return getScriptData('localeProps') as LocaleProps;
  }
  return undefined;
}

const SettingsPanel: React.FunctionComponent<SettingsPanelProps> = ({
  settings,
  closePanel,
}) => {
  const localeProps = getLocaleProps();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    event.target.form?.submit();
  };

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.header}>
        <Heading2 className={styles.headerText} visualAppearance={'body-three'}>
          {commonI18n.settings()}
        </Heading2>
        <CloseButton
          onClick={closePanel}
          aria-label={commonI18n.closeSettings()}
        />
      </div>
      <div className={styles.settingsList}>
        {localeProps && (
          <form
            action={localeProps.localeUrl}
            method="post"
            style={{marginBottom: '0px'}}
            data-notranslate=""
          >
            <input
              type="hidden"
              name="user_return_to"
              value={window.location.href}
            />
            <SimpleDropdown
              name="locale"
              selectedValue={localeProps.currentLocale}
              onChange={handleLanguageChange}
              items={localeProps.localeOptions}
              labelText={commonI18n.language()}
              isLabelVisible={true}
              size="s"
            />
          </form>
        )}
        {settings.map(setting => (
          <SimpleDropdown
            key={setting.id}
            labelText={setting.label}
            isLabelVisible={true}
            onChange={event => setting.onChange(event.target.value)}
            items={setting.options}
            selectedValue={setting.selectedValue}
            name={setting.id}
            size="s"
          />
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel;

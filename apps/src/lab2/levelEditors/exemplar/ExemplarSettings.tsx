import React, {useState} from 'react';

import {
  EXEMPLAR_VALIDATION_MODE_OPTIONS as MUSIC_VALIDATION_MODE_OPTIONS,
  EXEMPLAR_VALIDATION_DESCRIPTION as MUSIC_EXEMPLAR_VALIDATION_DESCRIPTION,
} from '@cdo/apps/music/constants';

import {AppName, ExemplarSettings} from '../../types';

import ExemplarPlayer from './ExemplarPlayer';
import ExemplarValidation from './ExemplarValidation';

const AppExemplarSupport: {[key in AppName]?: boolean} = {
  music: true,
};

interface ExemplarSettingsProps {
  initialExemplarSettings: ExemplarSettings;
  exemplarDefined: boolean;
  appName: AppName;
}

const validationModeOptions: Partial<{
  [key in AppName]: {label: string; value: string}[];
}> = {
  music: MUSIC_VALIDATION_MODE_OPTIONS,
};
const validationModeDescriptions: Partial<Record<AppName, string>> = {
  music: MUSIC_EXEMPLAR_VALIDATION_DESCRIPTION,
};

const ExemplarSettings: React.FunctionComponent<ExemplarSettingsProps> = ({
  initialExemplarSettings,
  exemplarDefined,
  appName,
}) => {
  const updateSettings = (updatedFields: Partial<ExemplarSettings>) => {
    setExemplarSettings((prevSettings: ExemplarSettings) => ({
      ...prevSettings,
      ...updatedFields,
    }));
  };
  const appExemplarSupported = AppExemplarSupport[appName];
  const [exemplarSettings, setExemplarSettings] = useState<ExemplarSettings>(
    initialExemplarSettings
  );

  if (!appExemplarSupported) {
    return (
      <div>
        {`Exemplar settings are not available for ${appName}. Contact the engineering team for further details.`}
      </div>
    );
  }

  return (
    <div>
      <input
        type="hidden"
        id="level_exemplar_settings"
        name="level[exemplar_settings]"
        value={JSON.stringify(exemplarSettings)}
      />
      <ExemplarValidation
        appName={appName}
        exemplarDefined={exemplarDefined}
        exemplarSettings={exemplarSettings}
        onChange={updateSettings}
        modeOptions={validationModeOptions[appName]}
        description={validationModeDescriptions[appName]}
      />
      {appName === 'music' && (
        <ExemplarPlayer
          appName={appName}
          exemplarDefined={exemplarDefined}
          exemplarSettings={exemplarSettings}
          onChange={updateSettings}
        />
      )}
    </div>
  );
};

export default ExemplarSettings;

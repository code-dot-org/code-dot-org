import React, {useState} from 'react';

import {VALIDATION_MODE_OPTIONS as MUSIC_VALIDATION_MODE_OPTIONS} from '@cdo/apps/music/constants';

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

const exemplarValidationDescriptions: Partial<
  Record<AppName, React.ReactNode>
> = {
  music: (
    <>
      <p>
        If checked, the playback events on the student's timeline must match
        those on the exemplar's timeline. If condition-based validations are
        defined (in the section above), they will be checked first. Exemplar
        validation cannot check code organization (such as loops or functions) -
        use condition-based validation in combination with exemplar validation
        to achieve this. You can choose between two modes:
      </p>
      <ul>
        <li>
          <strong>Compare all events by type and id (Default):</strong>{' '}
          Everything on the timeline must match exactly as defined in the
          blocks.
        </li>
        <li>
          <strong>Compare all events by type only:</strong> Only the event type
          (sound, chord, instrument) and sound type (beat, bass, lead, fx,
          vocal) must match, not the specific sound.
        </li>
      </ul>
    </>
  ),
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
        description={exemplarValidationDescriptions[appName]}
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

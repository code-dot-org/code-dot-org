import React, {useState} from 'react';
import {LevelPredictSettings} from '../types';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import moduleStyles from './edit-predict-settings.module.scss';

interface EditPredictSettingsProps {
  initialSettings: LevelPredictSettings;
}

const EditPredictSettings: React.FunctionComponent<
  EditPredictSettingsProps
> = ({initialSettings}) => {
  const [predictSettings, setPredictSettings] = useState<LevelPredictSettings>(
    initialSettings || {is_predict_level: false}
  );

  const handlePredictEnabledToggle = () => {
    setPredictSettings({
      ...predictSettings,
      is_predict_level: !predictSettings.is_predict_level,
    });
  };

  return (
    <div>
      <input
        id="level_predict_settings"
        name={'level[predict_settings]'}
        type="hidden"
        value={JSON.stringify(predictSettings)}
      />
      <label className={moduleStyles.checkboxLabel}>
        <input
          id="is_predict_level"
          type="checkbox"
          onChange={handlePredictEnabledToggle}
          checked={predictSettings.is_predict_level}
        />
        <Typography semanticTag="span" visualAppearance="body-three">
          Set this level as a predict level
        </Typography>
      </label>
      {predictSettings?.is_predict_level && <div>Hello</div>}
    </div>
  );
};

export default EditPredictSettings;

import React, {useState} from 'react';
import {LevelPredictSettings} from '../types';

interface EditPredictSettingsProps {
  initialSettings: LevelPredictSettings;
}

const EditPredictSettings: React.FunctionComponent<
  EditPredictSettingsProps
> = ({initialSettings}) => {
  const [predictSettings, setPredictSettings] =
    useState<LevelPredictSettings>(initialSettings);

  const handlePredictEnabledToggle = () => {
    setPredictSettings({
      ...predictSettings,
      is_predict_level: !predictSettings.is_predict_level,
    });
  };

  return (
    <div>
      <input
        id="level_is_predict_level"
        name={'level[is_predict_level]'}
        type="checkbox"
        checked={predictSettings.is_predict_level}
        onChange={handlePredictEnabledToggle}
      />
      <label htmlFor="level_is_predict_level">
        Mark level as predict level
      </label>
    </div>
  );
};

export default EditPredictSettings;

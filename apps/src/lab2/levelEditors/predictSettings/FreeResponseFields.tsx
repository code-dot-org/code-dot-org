import React from 'react';
import {LevelPredictSettings} from '../types';
import moduleStyles from './edit-predict-settings.module.scss';
import TextField from '@cdo/apps/componentLibrary/textField';

interface FreeResponseFieldsProps {
  predictSettings: LevelPredictSettings;
  setPredictSettings: (settings: LevelPredictSettings) => void;
}

const FreeResponseFields: React.FunctionComponent<FreeResponseFieldsProps> = ({
  predictSettings,
  setPredictSettings,
}) => {
  return (
    <div>
      <TextField
        label="Placeholder text to show in the answer text area"
        value={predictSettings.placeholder_text}
        onChange={e =>
          setPredictSettings({
            ...predictSettings,
            placeholder_text: e.target.value,
          })
        }
        name="placeholder_text"
        className={moduleStyles.fieldArea}
      />
      <label className={moduleStyles.fieldArea}>
        <div className={moduleStyles.label}>
          Optional solution markdown to display to teachers
        </div>
        <textarea
          value={predictSettings.solution}
          onChange={e =>
            setPredictSettings({
              ...predictSettings,
              solution: e.target.value,
            })
          }
          name="solution"
          rows={3}
          className={'input-block-level'}
        />
      </label>
      <label className={moduleStyles.fieldArea}>
        <div className={moduleStyles.label}>
          Height of the answer textarea in px
        </div>
        <input
          type="number"
          value={predictSettings.free_response_height}
          onChange={e =>
            setPredictSettings({
              ...predictSettings,
              free_response_height: parseInt(e.target.value),
            })
          }
          name="free_response_height"
          min={0}
          step={50}
        />
      </label>
    </div>
  );
};

export default FreeResponseFields;

import React from 'react';

import TextField from '@cdo/apps/componentLibrary/textField';

import {PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT} from '../../constants';
import {LevelPredictSettings} from '../types';

import moduleStyles from './edit-predict-settings.module.scss';

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
        value={predictSettings.placeholderText}
        onChange={e =>
          setPredictSettings({
            ...predictSettings,
            placeholderText: e.target.value,
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
          Height of the answer textarea in px. Default is{' '}
          {PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT}px.
        </div>
        <input
          type="number"
          value={predictSettings.freeResponseHeight}
          onChange={e =>
            setPredictSettings({
              ...predictSettings,
              freeResponseHeight:
                e.target.value !== undefined
                  ? parseInt(e.target.value)
                  : undefined,
            })
          }
          name="free_response_height"
          min={0}
          step={1}
        />
      </label>
    </div>
  );
};

export default FreeResponseFields;

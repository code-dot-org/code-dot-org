import React, {useState} from 'react';
import {LevelPredictSettings, PredictQuestionType} from '../types';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
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

  const handleIsPredictToggle = () => {
    setPredictSettings({
      ...predictSettings,
      is_predict_level: !predictSettings.is_predict_level,
      question_type:
        predictSettings.question_type || PredictQuestionType.FreeResponse,
    });
  };

  const handleQuestionTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPredictSettings({
      ...predictSettings,
      question_type: e.target.value as PredictQuestionType,
    });
  };

  const renderFreeResponseOptions = () => {
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

  const renderMultipleChoiceOptions = () => {
    return <div>hi multiple choice</div>;
  };

  return (
    <div>
      <input
        id="level_predict_settings"
        name={'level[predict_settings]'}
        type="hidden"
        value={JSON.stringify(predictSettings)}
      />
      <Checkbox
        label="Set this level as a predict level"
        checked={predictSettings.is_predict_level}
        onChange={handleIsPredictToggle}
        name="is_predict_level"
      />
      {predictSettings?.is_predict_level && (
        <div>
          <SimpleDropdown
            items={[
              {value: PredictQuestionType.FreeResponse, text: 'Free Response'},
              {
                value: PredictQuestionType.MultipleChoice,
                text: 'Multiple Choice',
              },
            ]}
            selectedValue={
              predictSettings.question_type || PredictQuestionType.FreeResponse
            }
            onChange={handleQuestionTypeChange}
            labelText="Question Type"
            name="Question Type"
            size="s"
            className={moduleStyles.fieldArea}
          />
          {predictSettings.question_type === PredictQuestionType.FreeResponse
            ? renderFreeResponseOptions()
            : renderMultipleChoiceOptions()}
          <Checkbox
            label="Allow multiple tries"
            checked={predictSettings.allow_multiple_attempts || false}
            onChange={e =>
              setPredictSettings({
                ...predictSettings,
                allow_multiple_attempts: e.target.checked,
              })
            }
            name="allow_multiple_tries"
          />
        </div>
      )}
    </div>
  );
};

export default EditPredictSettings;

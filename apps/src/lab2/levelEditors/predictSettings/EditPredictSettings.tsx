import React, {useState} from 'react';
import {LevelPredictSettings, PredictQuestionType} from '../types';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import moduleStyles from './edit-predict-settings.module.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import FreeResponseFields from './FreeResponseFields';
import MultipleChoiceFields from './MultipleChoiceFields';

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

  const renderMultipleChoiceOptions = () => {
    if (!predictSettings.multiple_choice_options) {
      setPredictSettings({
        ...predictSettings,
        multiple_choice_options: [''],
      });
    }
    return (
      <MultipleChoiceFields
        predictSettings={predictSettings}
        setPredictSettings={setPredictSettings}
      />
    );
  };

  return (
    <div>
      <BodyThreeText>
        Predict levels are read only for students. Either a free response or
        multiple choice question is shown to students in the instructions panel.
        The student must answer the question before they can run the code.
        Specify the question in the long instructions.
      </BodyThreeText>
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
          {predictSettings.question_type ===
          PredictQuestionType.FreeResponse ? (
            <FreeResponseFields
              predictSettings={predictSettings}
              setPredictSettings={setPredictSettings}
            />
          ) : (
            renderMultipleChoiceOptions()
          )}
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

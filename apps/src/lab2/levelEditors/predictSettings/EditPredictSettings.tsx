import React, {useState} from 'react';
import {LevelPredictSettings, PredictQuestionType} from '../types';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import moduleStyles from './edit-predict-settings.module.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import {Button} from '@cdo/apps/componentLibrary/button';

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

  const handleToggleMultipleChoiceAnswer = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newCorrectAnswers = predictSettings.multiple_choice_answers
      ? [...predictSettings.multiple_choice_answers]
      : [];
    if (e.target.checked && !newCorrectAnswers.includes(e.target.value)) {
      newCorrectAnswers.push(e.target.value);
    } else if (
      !e.target.checked &&
      newCorrectAnswers.includes(e.target.value)
    ) {
      newCorrectAnswers.splice(newCorrectAnswers.indexOf(e.target.value), 1);
    }
    console.log({newCorrectAnswers});
    setPredictSettings({
      ...predictSettings,
      multiple_choice_answers: newCorrectAnswers,
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
    if (!predictSettings.multiple_choice_options) {
      setPredictSettings({
        ...predictSettings,
        multiple_choice_options: [''],
      });
    }
    return (
      <div>
        <label className={moduleStyles.fieldArea}>
          <div className={moduleStyles.label}>Multiple Choice Options</div>
          {predictSettings.multiple_choice_options &&
            predictSettings.multiple_choice_options.map((option, index) => (
              <div key={index} className={moduleStyles.multipleChoiceOption}>
                <input
                  type="text"
                  value={option}
                  onChange={e => {
                    const newOptions = [
                      ...predictSettings.multiple_choice_options!,
                    ];
                    newOptions[index] = e.target.value;
                    setPredictSettings({
                      ...predictSettings,
                      multiple_choice_options: newOptions,
                    });
                  }}
                  name={`multiple_choice_option_${index}`}
                />
                <Checkbox
                  label="Mark as correct answer"
                  checked={
                    predictSettings.multiple_choice_answers?.includes(option) ||
                    false
                  }
                  onChange={handleToggleMultipleChoiceAnswer}
                  name={`mark_correct_answer_${index}`}
                  value={option}
                />
                {index > 0 && (
                  <Button
                    onClick={() => {
                      const newOptions = [
                        ...predictSettings.multiple_choice_options!,
                      ];
                      newOptions.splice(index, 1);
                      setPredictSettings({
                        ...predictSettings,
                        multiple_choice_options: newOptions,
                      });
                    }}
                    ariaLabel={'Delete option'}
                    color={'black'}
                    size={'xs'}
                    isIconOnly={true}
                    icon={{iconName: 'trash'}}
                  />
                )}
              </div>
            ))}
          <Button
            onClick={() =>
              setPredictSettings({
                ...predictSettings,
                multiple_choice_options: [
                  ...predictSettings.multiple_choice_options!,
                  '',
                ],
              })
            }
            isIconOnly={true}
            color={'black'}
            size={'s'}
            icon={{iconName: 'plus'}}
            ariaLabel={'Add Option'}
          />
        </label>
      </div>
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

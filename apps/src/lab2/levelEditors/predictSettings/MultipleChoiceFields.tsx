import React from 'react';
import {LevelPredictSettings} from '../types';
import moduleStyles from './edit-predict-settings.module.scss';
import {Button} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';

interface MultipleChoiceFieldsProps {
  predictSettings: LevelPredictSettings;
  setPredictSettings: (settings: LevelPredictSettings) => void;
}

const MultipleChoiceFields: React.FunctionComponent<
  MultipleChoiceFieldsProps
> = ({predictSettings, setPredictSettings}) => {
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
    setPredictSettings({
      ...predictSettings,
      multiple_choice_answers: newCorrectAnswers,
    });
  };

  return predictSettings.multiple_choice_options ? (
    <div>
      <label className={moduleStyles.fieldArea}>
        <div className={moduleStyles.label}>Multiple Choice Options</div>
        {predictSettings.multiple_choice_options.map((option, index) => (
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
              label="Correct answer"
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
  ) : null;
};

export default MultipleChoiceFields;

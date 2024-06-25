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
    const newCorrectAnswers = predictSettings.multipleChoiceAnswers
      ? [...predictSettings.multipleChoiceAnswers]
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
      multipleChoiceAnswers: newCorrectAnswers,
    });
  };

  const handleEditMultipleChoiceOption = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOptions = [...predictSettings.multipleChoiceOptions!];
    const newAnswers = predictSettings.multipleChoiceAnswers
      ? [...predictSettings.multipleChoiceAnswers]
      : [];
    const oldValue = predictSettings.multipleChoiceOptions![index];
    const newValue = e.target.value;
    if (newAnswers.includes(oldValue)) {
      newAnswers.splice(newAnswers.indexOf(oldValue), 1, newValue);
    }
    newOptions[index] = newValue;
    setPredictSettings({
      ...predictSettings,
      multipleChoiceOptions: newOptions,
      multipleChoiceAnswers: newAnswers,
    });
  };

  if (!predictSettings.multipleChoiceOptions) {
    return null;
  }

  return (
    <div>
      <label className={moduleStyles.fieldArea}>
        <div className={moduleStyles.label}>Multiple Choice Options</div>
        {predictSettings.multipleChoiceOptions.map((option, index) => (
          <div key={index} className={moduleStyles.multipleChoiceOption}>
            <input
              type="text"
              value={option}
              onChange={e => handleEditMultipleChoiceOption(e, index)}
              name={`multiple_choice_option_${index}`}
            />
            <Checkbox
              label="Correct answer"
              checked={
                predictSettings.multipleChoiceAnswers?.includes(option) || false
              }
              onChange={handleToggleMultipleChoiceAnswer}
              name={`mark_correct_answer_${index}`}
              value={option}
            />
            {index > 0 && (
              <Button
                onClick={() => {
                  const newOptions = [
                    ...predictSettings.multipleChoiceOptions!,
                  ];
                  newOptions.splice(index, 1);
                  setPredictSettings({
                    ...predictSettings,
                    multipleChoiceOptions: newOptions,
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
              multipleChoiceOptions: [
                ...predictSettings.multipleChoiceOptions!,
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

export default MultipleChoiceFields;

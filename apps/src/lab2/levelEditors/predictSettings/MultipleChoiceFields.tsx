import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';

import {LevelPredictSettings} from '../types';

import moduleStyles from './edit-predict-settings.module.scss';

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
    const newCorrectAnswers = predictSettings.solution
      ? predictSettings.solution.split(',')
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
      solution: newCorrectAnswers.join(','),
    });
  };

  const handleEditMultipleChoiceOption = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOptions = [...predictSettings.multipleChoiceOptions!];
    const newAnswers = predictSettings.solution
      ? predictSettings.solution.split(',')
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
      solution: newAnswers.join(','),
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
              checked={predictSettings.solution?.includes(option) || false}
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

        <Checkbox
          label="Mark as multiple select"
          checked={predictSettings.isMultiSelect || false}
          onChange={e =>
            setPredictSettings({
              ...predictSettings,
              isMultiSelect: e.target.checked,
            })
          }
          name={`mark_multiple_select`}
        />
      </label>
    </div>
  );
};

export default MultipleChoiceFields;

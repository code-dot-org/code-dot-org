import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import React from 'react';

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

  const solutions = predictSettings.solution?.split(',') || [];
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
              checked={solutions.includes(option) || false}
              onChange={handleToggleMultipleChoiceAnswer}
              name={`mark_correct_answer_${index}`}
              value={option}
            />
            {index > 0 && (
              <MuiIconButton
                variant="contained"
                color="secondary"
                size="extraSmall"
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
                aria-label="Delete option"
                type="button"
              >
                <FontAwesomeV6Icon iconName="trash" />
              </MuiIconButton>
            )}
          </div>
        ))}
        <MuiIconButton
          variant="contained"
          color="secondary"
          size="small"
          onClick={() =>
            setPredictSettings({
              ...predictSettings,
              multipleChoiceOptions: [
                ...predictSettings.multipleChoiceOptions!,
                '',
              ],
            })
          }
          aria-label="Add Option"
          type="button"
        >
          <FontAwesomeV6Icon iconName="plus" />
        </MuiIconButton>

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

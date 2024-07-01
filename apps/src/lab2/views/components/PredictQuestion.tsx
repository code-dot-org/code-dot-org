import React from 'react';
import {
  LevelPredictSettings,
  PredictQuestionType,
} from '@cdo/apps/lab2/levelEditors/types';
import moduleStyles from './predict-question.module.scss';

interface PredictQuestionProps {
  predictSettings: LevelPredictSettings | undefined;
  predictResponse: string | undefined;
  setPredictResponse: (response: string) => void;
}

const PredictQuestion: React.FunctionComponent<PredictQuestionProps> = ({
  predictSettings,
  predictResponse,
  setPredictResponse,
}) => {
  if (!predictSettings?.isPredictLevel) {
    return null;
  }

  // const lockAnswer =
  //   !predictSettings.allowMultipleAttempts && !!predictResponse;
  const lockAnswer = false;
  console.log({lockAnswer});

  const handleMultiSelectChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (predictSettings.isMultiSelect) {
      const newResponse = predictResponse ? predictResponse.split(',') : [];
      if (e.target.checked) {
        newResponse.push(e.target.value);
      } else if (newResponse.includes(e.target.value)) {
        newResponse.splice(newResponse.indexOf(e.target.value), 1);
      }
      setPredictResponse(newResponse.join(','));
    } else {
      setPredictResponse(e.target.value);
    }
  };

  return (
    <>
      {predictSettings.questionType === PredictQuestionType.FreeResponse ? (
        <textarea
          value={predictResponse}
          placeholder={predictSettings.placeholderText}
          onChange={e => setPredictResponse(e.target.value)}
          style={{height: predictSettings.freeResponseHeight || 20}}
          className={moduleStyles.freeResponse}
          readOnly={lockAnswer}
        />
      ) : (
        predictSettings.multipleChoiceOptions?.map((option, index) => (
          <label
            key={`multiple-choice-${index}`}
            className={moduleStyles.multipleChoiceContainer}
          >
            <input
              type={predictSettings.isMultiSelect ? 'checkbox' : 'radio'}
              value={option}
              checked={
                (predictResponse &&
                  predictResponse.split(',').includes(option)) ||
                false
              }
              onChange={handleMultiSelectChanged}
              name={option}
              key={index}
              disabled={lockAnswer}
            />
            <span className={moduleStyles.multipleChoiceLabel}>{option}</span>
          </label>
        ))
      )}
    </>
  );
};

export default PredictQuestion;

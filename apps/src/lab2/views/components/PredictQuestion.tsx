import React from 'react';

import {
  LevelPredictSettings,
  PredictQuestionType,
} from '@cdo/apps/lab2/levelEditors/types';

import {PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT} from '../../constants';

import PredictResetButton from './PredictResetButton';

import moduleStyles from './predict.module.scss';

interface PredictQuestionProps {
  predictSettings: LevelPredictSettings | undefined;
  predictResponse: string | undefined;
  setPredictResponse: (response: string) => void;
  predictAnswerLocked: boolean;
  className?: string;
}

const PredictQuestion: React.FunctionComponent<PredictQuestionProps> = ({
  predictSettings,
  predictResponse,
  setPredictResponse,
  predictAnswerLocked,
  className,
}) => {
  if (!predictSettings?.isPredictLevel) {
    return null;
  }

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
    <div className={className}>
      {predictSettings.questionType === PredictQuestionType.FreeResponse ? (
        <textarea
          value={predictResponse}
          placeholder={predictSettings.placeholderText}
          onChange={e => setPredictResponse(e.target.value)}
          style={{
            height:
              predictSettings.freeResponseHeight ||
              PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT,
          }}
          className={moduleStyles.freeResponse}
          readOnly={predictAnswerLocked}
        />
      ) : (
        predictSettings.multipleChoiceOptions?.map((option, index) => {
          // Add a capital letter to the beginning of each option, starting with A.
          const letterForOption = String.fromCharCode(index + 65) + '.';
          return (
            <label
              key={`multiple-choice-${index}`}
              className={moduleStyles.multipleChoiceContainer}
            >
              <input
                type={predictSettings.isMultiSelect ? 'checkbox' : 'radio'}
                value={index.toString()}
                checked={
                  (predictResponse &&
                    predictResponse.split(',').includes(index.toString())) ||
                  false
                }
                onChange={handleMultiSelectChanged}
                name={option}
                key={index}
                disabled={predictAnswerLocked}
              />
              <span className={moduleStyles.multipleChoiceLetter}>
                {letterForOption}
              </span>
              <span className={moduleStyles.multipleChoiceLabel}>{option}</span>
            </label>
          );
        })
      )}
      <PredictResetButton />
    </div>
  );
};

export default PredictQuestion;

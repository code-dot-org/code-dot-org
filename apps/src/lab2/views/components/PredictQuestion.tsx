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
  // TODO: Handle multiple choice predict questions.
  const showFreeResponse =
    predictSettings?.isPredictLevel &&
    predictSettings?.questionType === PredictQuestionType.FreeResponse;
  const showMultipleChoice =
    predictSettings?.isPredictLevel &&
    predictSettings?.questionType === PredictQuestionType.MultipleChoice;

  if (!showFreeResponse && !showMultipleChoice) {
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

  const renderMultipleChoice = () => {
    return predictSettings.multipleChoiceOptions?.map((option, index) => (
      <label
        key={`multiple-choice-${index}`}
        className={moduleStyles.multipleChoiceLabel}
      >
        <input
          type={predictSettings.isMultiSelect ? 'checkbox' : 'radio'}
          value={option}
          checked={
            (predictResponse && predictResponse.split(',').includes(option)) ||
            false
          }
          onChange={handleMultiSelectChanged}
          name={option}
          key={index}
          className={moduleStyles.multipleChoiceInput}
        />
        {option}
      </label>
    ));
  };

  return (
    <>
      {showFreeResponse && (
        <div key="predict-free-response" id="predict-free-response">
          <textarea
            value={predictResponse}
            placeholder={predictSettings.placeholderText}
            onChange={e => setPredictResponse(e.target.value)}
            style={{height: predictSettings.freeResponseHeight || 20}}
          />
        </div>
      )}
      {showMultipleChoice && renderMultipleChoice()}
    </>
  );
};

export default PredictQuestion;

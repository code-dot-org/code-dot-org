import React from 'react';
import {
  LevelPredictSettings,
  PredictQuestionType,
} from '@cdo/apps/lab2/levelEditors/types';

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
  return (
    <>
      {showFreeResponse && (
        <div key="predict-response" id="predict-response">
          <textarea
            value={predictResponse}
            placeholder={predictSettings.placeholderText}
            onChange={e => setPredictResponse(e.target.value)}
            style={{height: predictSettings.freeResponseHeight || 20}}
          />
        </div>
      )}
    </>
  );
};

export default PredictQuestion;

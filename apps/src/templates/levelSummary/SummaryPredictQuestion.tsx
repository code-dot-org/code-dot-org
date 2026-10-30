import React from 'react';

import {
  LevelPredictSettings,
  PredictQuestionType,
} from '@cdo/apps/lab2/levelEditors/types';

import EnhancedSafeMarkdown from '../EnhancedSafeMarkdown';

import moduleStyles from './summary.module.scss';

interface SummaryPredictQuestionProps {
  question: string;
  predictSettings: LevelPredictSettings;
}

const SummaryPredictQuestion: React.FunctionComponent<
  SummaryPredictQuestionProps
> = ({question, predictSettings}) => {
  return (
    <div>
      <EnhancedSafeMarkdown markdown={question} />
      {predictSettings.questionType === PredictQuestionType.FreeResponse ? (
        <textarea
          placeholder={predictSettings.placeholderText}
          style={{height: predictSettings.freeResponseHeight || 20}}
          readOnly={true}
        />
      ) : (
        predictSettings.multipleChoiceOptions?.map((option, index) => {
          // Add a capital letter to the beginning of each option, starting with A.
          const letterForOption = String.fromCharCode(index + 65) + '.';
          return (
            <p key={`multiple-choice-${index}`}>
              <span className={moduleStyles.predictMultipleChoiceLetter}>
                {letterForOption}
              </span>
              <span>{option}</span>
            </p>
          );
        })
      )}
    </div>
  );
};

export default SummaryPredictQuestion;

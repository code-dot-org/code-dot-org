import Checkbox from '@code-dot-org/component-library/checkbox';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import classNames from 'classnames';
import React from 'react';

import {
  LevelPredictSettings,
  PredictQuestionType,
} from '@cdo/apps/lab2/levelEditors/types';

import {PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT} from '../../../constants';

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

  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (predictSettings.isMultiSelect) {
      const selections = predictResponse ? predictResponse.split(',') : [];
      if (e.target.checked) {
        selections.push(value);
      } else if (selections.includes(value)) {
        selections.splice(selections.indexOf(value), 1);
      }
      setPredictResponse(selections.join(','));
    } else {
      setPredictResponse(value);
    }
  };

  const disabledAndNotSelected = (index: number) =>
    predictAnswerLocked &&
    !Boolean(predictResponse?.split(',').includes(index.toString()));

  return (
    <div className={className}>
      <div className={moduleStyles.predictQuestionContainer}>
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
            className={moduleStyles.freeResponseTextArea}
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
                {predictSettings.isMultiSelect ? (
                  <Checkbox
                    size="s"
                    name={option}
                    value={index.toString()}
                    key={index}
                    disabled={predictAnswerLocked}
                    checked={Boolean(
                      predictResponse?.split(',').includes(index.toString())
                    )}
                    onChange={handleSelectionChange}
                  />
                ) : (
                  <RadioButton
                    size="xs"
                    name={option}
                    value={index.toString()}
                    key={index}
                    disabled={predictAnswerLocked}
                    onChange={handleSelectionChange}
                    checked={Boolean(
                      predictResponse?.split(',').includes(index.toString())
                    )}
                  />
                )}
                <span
                  className={classNames(
                    moduleStyles.multipleChoiceLetter,
                    {
                      [moduleStyles.disabledNotSelectedLabel]:
                        disabledAndNotSelected(index),
                    },
                    {[moduleStyles.disabled]: predictAnswerLocked}
                  )}
                >
                  {letterForOption}
                </span>
                <span
                  className={classNames(
                    moduleStyles.multipleChoiceText,
                    {
                      [moduleStyles.disabledNotSelectedLabel]:
                        disabledAndNotSelected(index),
                    },
                    {
                      [moduleStyles.disabled]: predictAnswerLocked,
                    }
                  )}
                >
                  {option}
                </span>
              </label>
            );
          })
        )}
      </div>
      <PredictResetButton />
    </div>
  );
};

export default PredictQuestion;

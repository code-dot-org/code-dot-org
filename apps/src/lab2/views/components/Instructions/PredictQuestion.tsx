import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import classNames from 'classnames';
import React, {useCallback} from 'react';

import {PredictQuestionType} from '@cdo/apps/lab2/levelEditors/types';
import {
  isPredictAnswerLocked,
  setPredictResponse,
  submitPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT} from '../../../constants';

import PredictResetButton from './PredictResetButton';

import moduleStyles from './predict.module.scss';

interface PredictQuestionProps {
  className?: string;
}

const PredictQuestion: React.FunctionComponent<PredictQuestionProps> = ({
  className,
}) => {
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const isWeblab2 = appName === 'weblab2';
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);
  const dispatch = useAppDispatch();

  const onSubmitAnswer = useCallback(() => {
    if (appName) {
      dispatch(submitPredictResponse({appType: appName}));
    }
  }, [dispatch, appName]);

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
      dispatch(setPredictResponse(selections.join(',')));
    } else {
      dispatch(setPredictResponse(value));
    }
  };

  const disabledAndNotSelected = (index: number) =>
    predictAnswerLocked &&
    !Boolean(predictResponse?.split(',').includes(index.toString()));

  const isFreeResponse =
    predictSettings.questionType === PredictQuestionType.FreeResponse;
  const hasAnswer = isFreeResponse
    ? predictResponse.trim().length > 0
    : predictResponse.length > 0;

  return (
    <div className={className}>
      <div className={moduleStyles.predictQuestionContainer}>
        {predictSettings.questionType === PredictQuestionType.FreeResponse ? (
          <textarea
            value={predictResponse}
            placeholder={predictSettings.placeholderText}
            onChange={e => dispatch(setPredictResponse(e.target.value))}
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
      {/* Because weblab2 does not have a 'Run' button to indicate that they have submitted their answer,
        we display a 'Submit answer button. */}
      {isWeblab2 && (
        <Button
          onClick={onSubmitAnswer}
          text={commonI18n.submitAnswer()}
          size="s"
          className={moduleStyles.submitButton}
          disabled={predictAnswerLocked || !hasAnswer}
        />
      )}
      <PredictResetButton />
    </div>
  );
};

export default PredictQuestion;

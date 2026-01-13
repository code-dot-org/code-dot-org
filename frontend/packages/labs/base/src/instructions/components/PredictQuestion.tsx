import classNames from 'classnames';
import type {ChangeEvent, FunctionComponent} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import {RadioButton} from '@code-dot-org/component-library/radioButton';

import {PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT} from '../../constants';
import {PredictQuestionType} from '../../levelEditors/types';
import {
  isPredictAnswerLocked,
  setPredictResponse,
} from '../../redux/predictLevelSlice';
import {useAppDispatch, useAppSelector} from '../../redux/store';

import PredictResetButton from './PredictResetButton';

import moduleStyles from './predict.module.scss';

export interface PredictQuestionProps {
  className?: string;
}

const PredictQuestion: FunctionComponent<PredictQuestionProps> = ({
  className,
}) => {
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings,
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);
  const dispatch = useAppDispatch();

  if (!predictSettings?.isPredictLevel) {
    return null;
  }

  const handleSelectionChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    !predictResponse?.split(',').includes(index.toString());

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
          predictSettings.multipleChoiceOptions?.map(
            (option: string, index: number) => {
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
                        predictResponse?.split(',').includes(index.toString()),
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
                        predictResponse?.split(',').includes(index.toString()),
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
                      {[moduleStyles.disabled]: predictAnswerLocked},
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
                      },
                    )}
                  >
                    {option}
                  </span>
                </label>
              );
            },
          )
        )}
      </div>
      <PredictResetButton />
    </div>
  );
};

export default PredictQuestion;

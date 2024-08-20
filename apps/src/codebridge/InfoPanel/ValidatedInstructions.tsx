import classNames from 'classnames';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {navigateToNextLevel} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {
  isPredictAnswerLocked,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import PredictQuestion from '@cdo/apps/lab2/views/components/PredictQuestion';
import PredictSummary from '@cdo/apps/lab2/views/components/PredictSummary';
import {ThemeContext} from '@cdo/apps/lab2/views/ThemeWrapper';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@codebridge/InfoPanel/styles/validated-instructions.module.scss';

const commonI18n = require('@cdo/locale');

interface InstructionsProps {
  /** Additional callback to fire before navigating to the next level. */
  beforeNextLevel?: () => void;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  manageNavigation?: boolean;
  /** Optional classname for the container */
  className?: string;
}

/**
 * Lab2 instructions component. This can be used by any Lab2 lab, and will retrieve
 * all necessary data from the Lab2 redux store.
 *
 * Note that currently, this component solely renders instructions, and does not include any features
 * present on the legacy instructions panel, such as Help & Tips, Documentation, Code Review,
 * For Teachers Only, etc.
 */
const ValidatedInstructions: React.FunctionComponent<InstructionsProps> = ({
  beforeNextLevel,
  layout = 'vertical',
  handleInstructionsTextClick,
  className,
  manageNavigation = true,
}) => {
  const instructionsText = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.longInstructions
  );
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, message, satisfied, index} = useSelector(
    (state: {lab: LabState}) => state.lab.validationState
  );
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);

  // If there are no validation conditions, we can show the continue button so long as
  // there is another level and manageNavigation is true.
  // If validation is present, also check that conditions are satisfied.
  const showContinueButton =
    manageNavigation && (!hasConditions || satisfied) && hasNextLevel;

  // If there are no validation conditions, we can show the finish button so long as
  // this is the last level in the progression and the instructions panel is managing navigation.
  // If validation is present, also check that conditions are satisfied.
  const showFinishButton =
    manageNavigation && (!hasConditions || satisfied) && !hasNextLevel;

  const dispatch = useAppDispatch();

  const {theme} = useContext(ThemeContext) || 'dark';

  const [isFinished, setIsFinished] = useState(false);

  const vertical = layout === 'vertical';

  const canShowFinishButton = showFinishButton;

  const onFinish = useCallback(() => {
    if (beforeNextLevel) {
      beforeNextLevel();
    }
    setIsFinished(true);
  }, [beforeNextLevel]);

  // Reset the Finish button state when it changes from shown to hidden.
  useEffect(() => {
    setIsFinished(false);
  }, [canShowFinishButton]);

  const finalMessage =
    'You finished this lesson! Check in with your teacher for the next activity';

  const onNextPanel = useCallback(() => {
    if (beforeNextLevel) {
      beforeNextLevel();
    }
    dispatch(navigateToNextLevel());
  }, [dispatch, beforeNextLevel]);

  const canShowContinueButton = showContinueButton && onNextPanel;

  // Don't render anything if we don't have any instructions.
  if (instructionsText === undefined) {
    return null;
  }

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles['instructions-' + theme],
        vertical && moduleStyles.vertical,
        'instructions',
        className
      )}
    >
      <div
        id="instructions-panel"
        className={classNames(
          moduleStyles.item,
          vertical && moduleStyles.itemVertical
        )}
      >
        {instructionsText && (
          <div
            key={instructionsText}
            id="instructions-text"
            className={moduleStyles['text-' + theme]}
          >
            {predictSettings?.isPredictLevel && <PredictSummary />}
            <EnhancedSafeMarkdown
              markdown={instructionsText}
              className={moduleStyles.markdownText}
              handleInstructionsTextClick={handleInstructionsTextClick}
            />
            <PredictQuestion
              predictSettings={predictSettings}
              predictResponse={predictResponse}
              setPredictResponse={setPredictResponse}
              predictAnswerLocked={predictAnswerLocked}
            />
          </div>
        )}
        {(message || canShowContinueButton || canShowFinishButton) && (
          <div
            key={index + ' - ' + message}
            id="instructions-feedback"
            className={moduleStyles.feedback}
          >
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              {message && (
                <EnhancedSafeMarkdown
                  markdown={message}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
              )}
              {canShowContinueButton && (
                <button
                  id="instructions-continue-button"
                  type="button"
                  onClick={onNextPanel}
                  className={moduleStyles.buttonInstruction}
                >
                  {commonI18n.continue()}
                </button>
              )}
              {canShowFinishButton && (
                <>
                  <button
                    id="instructions-finish-button"
                    type="button"
                    onClick={onFinish}
                    disabled={isFinished}
                    className={moduleStyles.buttonInstruction}
                  >
                    {commonI18n.finish()}
                  </button>
                  {isFinished && <Heading6>{finalMessage}</Heading6>}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidatedInstructions;

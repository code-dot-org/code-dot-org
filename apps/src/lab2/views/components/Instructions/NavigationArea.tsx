import {Button} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef} from 'react';

import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import TextToSpeech from '../TextToSpeech';

import {SubmitButton} from './NavigationButton';

import moduleStyles from './instructions.module.scss';

interface NavigationAreaProps {
  levelProperties: LevelProperties;
  handleInstructionsTextClick?: (id: string) => void;
  isRunning: boolean;
  hasRun: boolean;
  hasEdited: boolean;
  requireRun?: boolean;
}

/**
 * Displays the feedback message and the navigation button.
 */
const NavigationArea: React.FC<NavigationAreaProps> = ({
  levelProperties,
  isRunning,
  hasRun,
  hasEdited,
  requireRun,
  handleInstructionsTextClick,
}) => {
  const {
    id,
    appName,
    predictSettings,
    useSecondaryFinishButton,
    submittable,
    disableEditRunForSubmission,
    offerBrowserTts,
  } = levelProperties;
  const hasValidationConditions = useAppSelector(
    state => state.lab.validationState?.hasConditions
  );
  const validationMessage = useAppSelector(
    state => state.lab.validationState?.message
  );
  const validationIndex = useAppSelector(
    state => state.lab.validationState?.index
  );
  const validationSatisfied = useAppSelector(
    state => state.lab.validationState?.satisfied
  );
  const hasNextLevel = useAppSelector(
    state => nextLevelId(state) !== undefined
  );
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted
  );
  const isPredictLevel = predictSettings?.isPredictLevel;
  const showSecondaryFinishButton =
    useSecondaryFinishButton ||
    (queryParams('use-secondary-finish-button') === 'true' && !hasNextLevel);
  const feedbackMessage =
    showSecondaryFinishButton &&
    queryParams('show-secondary-finish-button-question') === 'true'
      ? commonI18n.finishMessage()
      : validationMessage;

  const showTts = offerBrowserTts || queryParams('show-tts') === 'true';

  // The secondary finish button avoids a reappearance animation by not using
  // the unique index.
  const useMessageIndex = showSecondaryFinishButton
    ? undefined
    : validationIndex;

  const dispatch = useAppDispatch();

  const [type, color] =
    showSecondaryFinishButton && !hasNextLevel
      ? (['secondary', 'black'] as const)
      : (['primary', 'purple'] as const);

  const iconRight = hasNextLevel
    ? ({iconName: 'arrow-right', iconStyle: 'solid'} as const)
    : undefined;

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus on the feedback message when it first becomes present and the program is not running.
    // This ensures it will be read by screen readers.
    // It's ok to focus after each run switch, as the message will also reappear when the user re-runs
    // the program.
    if (validationMessage && !isRunning) {
      feedbackRef.current?.focus();
    }
  }, [validationMessage, isRunning]);

  const canShowButton = useMemo(() => {
    if (isPredictLevel) {
      return predictResponseSubmitted;
    } else if (submittable && hasSubmitted) {
      return true;
    } else if (hasValidationConditions) {
      return validationSatisfied;
    } else {
      return submittable || !requireRun || hasRun;
    }
  }, [
    isPredictLevel,
    hasValidationConditions,
    predictResponseSubmitted,
    validationSatisfied,
    submittable,
    hasSubmitted,
    requireRun,
    hasRun,
  ]);

  if (!submittable && !canShowButton && !feedbackMessage) {
    return null;
  }

  return (
    <div
      key={useMessageIndex + ' - ' + feedbackMessage}
      id="instructions-feedback"
      className={classNames(
        moduleStyles.feedback,
        showSecondaryFinishButton && moduleStyles.feedbackBottom
      )}
    >
      <div
        id="instructions-feedback-message"
        className={classNames(
          moduleStyles.bubble,
          moduleStyles.bubbleNoBorderRadius
        )}
      >
        {feedbackMessage && (
          <div ref={feedbackRef} tabIndex={-1}>
            <EnhancedSafeMarkdown
              markdown={feedbackMessage}
              className={moduleStyles.markdownText}
              handleInstructionsTextClick={handleInstructionsTextClick}
            />
          </div>
        )}
        {canShowButton &&
          (submittable ? (
            <SubmitButton
              levelId={id}
              appName={appName}
              disableEditRunForSubmission={disableEditRunForSubmission}
              hasRun={hasRun}
              hasEdited={hasEdited}
              className={moduleStyles.buttonInstruction}
            />
          ) : (
            <Button
              id="instructions-continue-button"
              size={'s'}
              className={moduleStyles.buttonInstruction}
              text={hasNextLevel ? commonI18n.continue() : commonI18n.finish()}
              onClick={() => dispatch(continueOrFinishLesson())}
              {...{type, color, iconRight}}
            />
          ))}
        {showTts && feedbackMessage && !canShowButton && (
          <div className={moduleStyles.ttsContainer}>
            <TextToSpeech text={feedbackMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationArea;

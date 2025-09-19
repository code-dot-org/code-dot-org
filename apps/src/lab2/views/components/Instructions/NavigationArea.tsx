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

import {SubmitButton, ContinueButtonActionNeeded} from './NavigationButton';

import moduleStyles from './instructions.module.scss';

interface NavigationAreaProps {
  levelProperties: LevelProperties;
  handleInstructionsTextClick?: (id: string) => void;
  isRunning: boolean;
  hasRun: boolean;
  hasEdited: boolean;
  requireRun?: boolean;
  isResourcePanel?: boolean;
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
  isResourcePanel,
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

  const iconRight = useMemo(
    () =>
      hasNextLevel
        ? ({iconName: 'arrow-right', iconStyle: 'solid'} as const)
        : undefined,
    [hasNextLevel]
  );

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

  // For music lab levels, we want to hide the navigation button until the user validates or runs their code.
  // For other labs, we want to always show the navigation button.
  const musicCanShowContinueButton = useMemo(() => {
    if (isPredictLevel) {
      return predictResponseSubmitted;
    } else if (submittable) {
      return true;
    } else if (hasValidationConditions) {
      return validationSatisfied;
    } else {
      return hasRun; // music does not have requireRun
    }
  }, [
    isPredictLevel,
    hasValidationConditions,
    predictResponseSubmitted,
    validationSatisfied,
    submittable,
    hasRun,
  ]);

  const continueActionNeededButtonIsEnabled = useMemo(() => {
    if (isPredictLevel) {
      return predictResponseSubmitted;
    } else if (hasValidationConditions) {
      return validationSatisfied;
    } else if (requireRun) {
      return hasRun;
    } else {
      return true;
    }
  }, [
    isPredictLevel,
    predictResponseSubmitted,
    hasValidationConditions,
    validationSatisfied,
    requireRun,
    hasRun,
  ]);

  const continueTooltipMessage = useMemo(() => {
    if (submittable) {
      return undefined;
    }
    const action = hasNextLevel ? 'continue' : 'finish';
    if (isPredictLevel) {
      return `To ${action}, submit your prediction`;
    } else if (hasValidationConditions && !validationSatisfied) {
      return `To ${action}, validate your code`;
    } else if (requireRun && !hasRun) {
      return `To ${action}, run your code`;
    }
    return undefined;
  }, [
    submittable,
    hasNextLevel,
    isPredictLevel,
    hasValidationConditions,
    validationSatisfied,
    requireRun,
    hasRun,
  ]);

  const ContinueButton = useMemo(() => {
    if (appName === 'music') {
      return (
        <Button
          id="instructions-continue-button"
          size={'s'}
          className={moduleStyles.buttonInstruction}
          text={hasNextLevel ? commonI18n.continue() : commonI18n.finish()}
          onClick={() => dispatch(continueOrFinishLesson())}
          {...{type, color, iconRight}}
        />
      );
    }
    return (
      <ContinueButtonActionNeeded
        isDisabled={!continueActionNeededButtonIsEnabled}
        type={type}
        color={color}
        iconRight={iconRight}
        text={hasNextLevel ? commonI18n.continue() : commonI18n.finish()}
        tooltipMessage={continueTooltipMessage}
      />
    );
  }, [
    appName,
    continueActionNeededButtonIsEnabled,
    type,
    color,
    iconRight,
    hasNextLevel,
    dispatch,
    continueTooltipMessage,
  ]);

  const submitButtonEnabled =
    disableEditRunForSubmission || hasSubmitted || (hasRun && hasEdited);
  const submitTooltipMessage = useMemo(() => {
    if (submittable && !submitButtonEnabled) {
      if (requireRun) {
        return `To submit, edit and run your code.`;
      } else {
        return `To submit, edit your code.`;
      }
    }
    return undefined;
  }, [requireRun, submitButtonEnabled, submittable]);

  if (appName === 'music' && !musicCanShowContinueButton && !feedbackMessage) {
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
          isResourcePanel && moduleStyles.resourcePanelNavigationAreaBubble
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
        {submittable ? (
          <SubmitButton
            levelId={id}
            appName={appName}
            disableEditRunForSubmission={disableEditRunForSubmission}
            hasRun={hasRun}
            hasEdited={hasEdited}
            className={moduleStyles.buttonInstruction}
            tooltipMessage={submitTooltipMessage}
          />
        ) : (
          ContinueButton
        )}

        {showTts && feedbackMessage && !musicCanShowContinueButton && (
          <div className={moduleStyles.ttsContainer}>
            <TextToSpeech text={feedbackMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationArea;

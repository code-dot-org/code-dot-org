import classNames from 'classnames';
import React, {useEffect, useMemo, useRef} from 'react';

import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import lab2I18n from '@cdo/apps/lab2/locale';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import commonI18n from '@cdo/locale';

import TextToSpeech from '../TextToSpeech';

import ContinueButton from './ContinueButton';
import SubmitButton from './SubmitButton';

import moduleStyles from './instructions.module.scss';

interface NavigationAreaProps {
  levelProperties: LevelProperties;
  handleInstructionsTextClick?: (id: string) => void;
  isRunning: boolean;
  hasRun: boolean;
  hasEdited: boolean;
  requireRun?: boolean;
  isResourcePanel?: boolean;
  hideContinueIfDisabled?: boolean;
}

/**
 * Displays the feedback message and the Continue/Finish or Submit button.
 */
const NavigationArea: React.FC<NavigationAreaProps> = ({
  levelProperties,
  isRunning,
  hasRun,
  hasEdited,
  requireRun,
  handleInstructionsTextClick,
  isResourcePanel,
  hideContinueIfDisabled,
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
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted
  );

  // The secondary finish button avoids a reappearance animation by not using
  // the unique index.
  const useMessageIndex = showSecondaryFinishButton
    ? undefined
    : validationIndex;

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

  const continueButtonIsEnabled = useMemo(() => {
    if (isPredictLevel) {
      return predictResponseSubmitted;
    } else if (hasValidationConditions) {
      return validationSatisfied;
    } else if (requireRun) {
      return hasRun;
    } else if (submittable && hasSubmitted) {
      return true;
    } else {
      return true;
    }
  }, [
    isPredictLevel,
    hasValidationConditions,
    requireRun,
    submittable,
    hasSubmitted,
    predictResponseSubmitted,
    validationSatisfied,
    hasRun,
  ]);

  const continueTooltipMessage = useMemo(() => {
    if (submittable) {
      return undefined;
    }
    if (isPredictLevel) {
      return hasNextLevel
        ? lab2I18n.toContinueSubmitPrediction()
        : lab2I18n.toFinishSubmitPrediction();
    } else if (hasValidationConditions && !validationSatisfied) {
      return hasNextLevel
        ? lab2I18n.toContinueValidate()
        : lab2I18n.toFinishValidate();
    } else if (requireRun && !hasRun) {
      return hasNextLevel ? lab2I18n.toContinueRun() : lab2I18n.toFinishRun();
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

  if (hideContinueIfDisabled && !continueButtonIsEnabled && !feedbackMessage) {
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
            requireRun={requireRun}
            hasRun={hasRun}
            hasEdited={hasEdited}
            className={moduleStyles.buttonInstruction}
          />
        ) : (
          <ContinueButton
            disabled={!continueButtonIsEnabled}
            type={type}
            color={color}
            iconRight={iconRight}
            text={hasNextLevel ? commonI18n.continue() : commonI18n.finish()}
            tooltipMessage={continueTooltipMessage}
            hideIfDisabled={hideContinueIfDisabled}
          />
        )}

        {showTts && feedbackMessage && !hideContinueIfDisabled && (
          <div className={moduleStyles.ttsContainer}>
            <TextToSpeech text={feedbackMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationArea;

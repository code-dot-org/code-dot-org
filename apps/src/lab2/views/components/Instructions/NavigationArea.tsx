import classNames from 'classnames';
import React, {useEffect, useMemo, useRef} from 'react';

import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {LABS_HIDE_CONTINUE_BUTTON_RESOURCE_PANEL} from '@cdo/apps/lab2/constants';
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

  // Certain labs hide the continue button until the user has met the conditions for the next level. Example: Music lab.
  const isLabHidesContinueButton = useMemo(() => {
    return LABS_HIDE_CONTINUE_BUTTON_RESOURCE_PANEL.includes(appName);
  }, [appName]);

  // For labs that hide the continue button, we show the button if the user has met the conditions for the next level.
  // For labs that always show the continue button, this boolean is always true.
  const showContinueButton = useMemo(() => {
    let showContinueButton = true;
    if (isLabHidesContinueButton) {
      if (isPredictLevel) {
        showContinueButton = predictResponseSubmitted;
      } else if (hasValidationConditions) {
        showContinueButton = validationSatisfied;
      } else {
        showContinueButton = hasRun; // We are assuming that the lab does not use requireRun as in the case of music lab.
      }
    }
    return showContinueButton;
  }, [
    isLabHidesContinueButton,
    isPredictLevel,
    predictResponseSubmitted,
    hasValidationConditions,
    validationSatisfied,
    hasRun,
  ]);

  // For labs that always show the continue button, the button is enabled if the user has met the conditions for the next level.
  // For labs that hide the continue button, this boolean is always true.
  const continueButtonIsEnabled = useMemo(() => {
    if (isLabHidesContinueButton) {
      return true;
    }
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
    isLabHidesContinueButton,
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

  const submitButtonEnabled =
    disableEditRunForSubmission || hasSubmitted || (hasRun && hasEdited);
  const submitTooltipMessage = useMemo(() => {
    if (submittable && !submitButtonEnabled) {
      if (requireRun || !hasRun) {
        return lab2I18n.toSubmitEditRun();
      } else {
        return lab2I18n.toSubmitEdit();
      }
    }
    return undefined;
  }, [hasRun, requireRun, submitButtonEnabled, submittable]);

  if (isLabHidesContinueButton && !showContinueButton && !feedbackMessage) {
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
          <ContinueButton
            isDisabled={!continueButtonIsEnabled}
            type={type}
            color={color}
            iconRight={iconRight}
            text={hasNextLevel ? commonI18n.continue() : commonI18n.finish()}
            tooltipMessage={continueTooltipMessage}
            isLabHidesContinueButton={isLabHidesContinueButton}
            showContinueButton={showContinueButton}
          />
        )}

        {showTts && feedbackMessage && !showContinueButton && (
          <div className={moduleStyles.ttsContainer}>
            <TextToSpeech text={feedbackMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationArea;

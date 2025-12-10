import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useEffect, useState, useMemo, useRef} from 'react';

import {
  getCurrentLevel,
  getNextLevel,
  getParentLevel,
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
import {resourcePanelNavigationButtonElementId} from './ResourcePanel/constants';
import SubmitButton from './SubmitButton';

import moduleStyles from './instructions.module.scss';

interface NavigationAreaProps {
  levelProperties: LevelProperties;
  handleInstructionsTextClick?: (id: string) => void;
  isRunning: boolean;
  hasRun: boolean;
  hasEdited: boolean;
  requireRun?: boolean;
  hideContinueIfDisabled?: boolean;
  className?: string;
  markdownClassName?: string;
  overrideTheme?: Theme;
  styleAsBubble?: boolean;
  /** Optional on continue/finish callback. */
  onContinue?: () => void;
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
  hideContinueIfDisabled,
  className,
  markdownClassName,
  overrideTheme,
  styleAsBubble = false,
  onContinue,
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
  // Get the level number of the next level (in the progression)
  const continueToLevel = useAppSelector(
    state => getNextLevel(state)?.levelNumber
  );
  // Get the current main level (parent if it is a sublevel)
  const currentLevel = useAppSelector(
    state =>
      getParentLevel(state)?.levelNumber || getCurrentLevel(state)?.levelNumber
  );
  // Determine what level is next in the progression
  const hasNextLevel = useAppSelector(
    state => getNextLevel(state)?.id !== undefined
  );
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);
  const isPredictLevel = predictSettings?.isPredictLevel;
  const isAiTutorVersion = useAppSelector(
    state => state.lab2Project.viewingAiTutorVersion
  );
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

  const [small, setSmall] = useState<boolean>(false);

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
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const {theme: defaultTheme} = useTheme();

  useEffect(() => {
    const container = buttonContainerRef.current;

    let resizeObserver: ResizeObserver | undefined;
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        setSmall(container.clientWidth < 215);
      });
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver?.disconnect();
    };
  }, [setSmall]);

  useEffect(() => {
    // Focus on the feedback message when it first becomes present and the program is not running.
    // This ensures it will be read by screen readers.
    // It's ok to focus after each run switch, as the message will also reappear when the user re-runs
    // the program.
    if (validationMessage && !isRunning) {
      feedbackRef.current?.focus();
    }
  }, [validationMessage, isRunning]);

  // Determines if the submit button should be enabled and what tooltip to show if any.
  const [submitEnabled, submitTooltip] = useMemo(() => {
    if (!submittable) {
      return [false, undefined];
    }
    if (hasSubmitted) {
      return [true, undefined];
    }
    if (hasValidationConditions && !validationSatisfied) {
      return [false, lab2I18n.toSubmitValidate()];
    }
    if (disableEditRunForSubmission || (hasRun && hasEdited)) {
      return [true, undefined];
    }
    const key = hasEdited ? 'Run' : hasRun ? 'Edit' : 'EditRun';
    return [false, lab2I18n[`toSubmit${key}`]()];
  }, [
    submittable,
    hasSubmitted,
    hasValidationConditions,
    validationSatisfied,
    disableEditRunForSubmission,
    hasRun,
    hasEdited,
  ]);

  // Determines if the continue/finish button should be enabled and what tooltip to show if any.
  const [continueEnabled, continueTooltip] = useMemo(() => {
    if (submittable) {
      return [false, undefined] as const;
    }
    let action:
      | 'Validate'
      | 'SubmitPrediction'
      | 'Run'
      | 'AiTutorVersion'
      | undefined;
    let canContinue: boolean = true;
    if (isPredictLevel) {
      action = 'SubmitPrediction';
      canContinue = predictResponseSubmitted;
    } else if (hasValidationConditions) {
      action = 'Validate';
      canContinue = validationSatisfied;
    } else if (isAiTutorVersion) {
      action = 'AiTutorVersion';
      canContinue = false;
    } else if (requireRun) {
      action = 'Run';
      canContinue = hasRun;
    }
    const key = action
      ? (`to${hasNextLevel ? 'Continue' : 'Finish'}${action}` as const)
      : undefined;
    return [canContinue, key ? lab2I18n[key]() : undefined];
  }, [
    submittable,
    hasNextLevel,
    isPredictLevel,
    predictResponseSubmitted,
    hasValidationConditions,
    validationSatisfied,
    requireRun,
    hasRun,
    isAiTutorVersion,
  ]);

  // If we can't show the continue button or the feedback message and the level is not submittable, don't render anything to avoid displaying a blank space.
  if (
    !submittable &&
    hideContinueIfDisabled &&
    !continueEnabled &&
    !feedbackMessage
  ) {
    return null;
  }

  // Construct the button text.
  // For when we would go to another level, say 'Continue to Level {x}'
  // For when we would actually just go back to the same level (parent for a sublevel) just say 'Continue'
  // For when we are already at the end of a lesson, say 'Finish Lesson'
  const text = hasNextLevel
    ? currentLevel !== continueToLevel
      ? commonI18n.continueToLevel({level: continueToLevel})
      : commonI18n.continue()
    : commonI18n.finishLesson();

  const smallText = hasNextLevel
    ? commonI18n.continue()
    : commonI18n.finishLesson();

  return (
    <div
      key={useMessageIndex + ' - ' + feedbackMessage}
      id="instructions-feedback"
      className={classNames(
        className,
        showSecondaryFinishButton && moduleStyles.feedbackBottom
      )}
    >
      <div
        ref={buttonContainerRef}
        id="instructions-feedback-message"
        className={classNames(styleAsBubble && moduleStyles.bubble)}
        data-theme={overrideTheme || defaultTheme}
      >
        {feedbackMessage && (
          <div ref={feedbackRef} tabIndex={-1}>
            <EnhancedSafeMarkdown
              markdown={feedbackMessage}
              className={classNames(
                moduleStyles.markdownText,
                markdownClassName
              )}
              handleInstructionsTextClick={handleInstructionsTextClick}
            />
          </div>
        )}
        <div id={resourcePanelNavigationButtonElementId}>
          {submittable ? (
            <SubmitButton
              levelId={id}
              appName={appName}
              className={moduleStyles.buttonInstruction}
              enabled={submitEnabled}
              tooltipMessage={submitTooltip}
            />
          ) : (
            <ContinueButton
              disabled={!continueEnabled}
              type={type}
              color={color}
              iconRight={iconRight}
              text={small ? smallText : text}
              tooltipMessage={continueTooltip}
              hideIfDisabled={hideContinueIfDisabled}
              onContinue={onContinue}
            />
          )}
        </div>
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

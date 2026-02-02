import classNames from 'classnames';
import type {FunctionComponent} from 'react';
import {useEffect, useMemo, useRef} from 'react';

import TextToSpeech from '@code-dot-org/audio/textToSpeech';
import {
  type Theme,
  useTheme,
} from '@code-dot-org/component-library/common/contexts';
import type {LevelProperties} from '@code-dot-org/core/api';
import {LevelStatus} from '@code-dot-org/progress';
import {progressActions} from '@code-dot-org/progress/redux';

import EnhancedMarkdown from '../../components/EnhancedMarkdown';
import {isPredictResponseSubmitted} from '../../redux/predictLevelSlice';
import {useAppSelector} from '../../redux/store';
import {resourcePanelNavigationButtonElementId} from '../../resourcePanel/constants';
import {queryParams} from '../../utils/queryParams';

import ContinueButton from './ContinueButton';
import SubmitButton from './SubmitButton';

import moduleStyles from './instructions.module.scss';

const {getCurrentLevel, nextLevelId} = progressActions;

interface NavigationAreaProps {
  levelProperties: LevelProperties;
  onInstructionsTextClick?: (id: string) => void;
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
const NavigationArea: FunctionComponent<NavigationAreaProps> = ({
  levelProperties,
  isRunning,
  hasRun,
  hasEdited,
  requireRun,
  onInstructionsTextClick,
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
    state => state.lab.validationState?.hasConditions,
  );
  const validationMessage = useAppSelector(
    state => state.lab.validationState?.message,
  );
  const validationIndex = useAppSelector(
    state => state.lab.validationState?.index,
  );
  const validationSatisfied = useAppSelector(
    state => state.lab.validationState?.satisfied,
  );
  const hasNextLevel = useAppSelector(
    state => nextLevelId(state) !== undefined,
  );
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);
  const isPredictLevel = predictSettings?.isPredictLevel;
  const isAiTutorVersion = useAppSelector(
    state => state.labProject.viewingAiTutorVersion,
  );
  const showSecondaryFinishButton =
    useSecondaryFinishButton ||
    (queryParams('use-secondary-finish-button') === 'true' && !hasNextLevel);
  const feedbackMessage =
    showSecondaryFinishButton &&
    queryParams('show-secondary-finish-button-question') === 'true'
      ? 'Finished with your project?'
      : validationMessage;

  const showTts = offerBrowserTts || queryParams('show-tts') === 'true';
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted,
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
    [hasNextLevel],
  );

  const feedbackRef = useRef<HTMLDivElement>(null);
  const {theme: defaultTheme} = useTheme();

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
      return [false, 'To submit, your code must meet all goals'];
    }
    if (disableEditRunForSubmission || (hasRun && hasEdited)) {
      return [true, undefined];
    }
    return [
      false,
      hasEdited
        ? 'To submit, run your code'
        : hasRun
          ? 'To submit, edit your code'
          : 'To submit, edit and run your code',
    ];
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
    let canContinue: boolean = true;
    let text: string | undefined;
    if (isPredictLevel) {
      text = hasNextLevel
        ? 'To continue, submit your prediction'
        : 'To finish, submit your prediction';
      canContinue = predictResponseSubmitted;
    } else if (hasValidationConditions) {
      text = hasNextLevel
        ? 'To continue, validate your code'
        : 'To finish, validate your code';
      canContinue = validationSatisfied;
    } else if (isAiTutorVersion) {
      text = hasNextLevel
        ? "To continue, accept or reject AI Tutor's version"
        : "To finish, accept or reject AI Tutor's version";
      canContinue = false;
    } else if (requireRun) {
      text = hasNextLevel
        ? 'To continue, run your code'
        : 'To finish, run your code';
      canContinue = hasRun;
    }
    return [canContinue, text];
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

  return (
    <div
      key={useMessageIndex + ' - ' + feedbackMessage}
      id="instructions-feedback"
      className={classNames(
        className,
        showSecondaryFinishButton && moduleStyles.feedbackBottom,
      )}
    >
      <div
        id="instructions-feedback-message"
        className={classNames(styleAsBubble && moduleStyles.bubble)}
        data-theme={overrideTheme || defaultTheme}
      >
        {feedbackMessage && (
          <div ref={feedbackRef} tabIndex={-1}>
            <EnhancedMarkdown
              className={classNames(
                moduleStyles.markdownText,
                markdownClassName,
              )}
              onInstructionsTextClick={onInstructionsTextClick}
            >
              {feedbackMessage}
            </EnhancedMarkdown>
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
              text={hasNextLevel ? 'Continue' : 'Finish'}
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

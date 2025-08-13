import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef} from 'react';
import {useSelector} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import ValidationResults from '@cdo/apps/lab2/views/components/Instructions/ValidationResults';
import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import NavigationButton from './NavigationButton';
import PredictQuestion from './PredictQuestion';
import PredictQuestionRunPrompt from './PredictQuestionRunPrompt';
import PredictSummary from './PredictSummary';
import ValidationButton from './ValidationButton';

import moduleStyles from './instructions.module.scss';

interface InstructionsProps {
  levelProperties: LevelProperties | undefined;
  /** Whether the lab is currently running (different labs may define this differently). */
  isRunning: boolean;
  /** Whether the lab's code has been executed/run on this level. */
  hasRun: boolean;
  /** Whether the lab's code has been edited on this level. */
  hasEdited: boolean;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  /** Optional classname for the container */
  className?: string;
  /** Optional component to render at the bottom of the main instructions. */
  bottomComponent?: React.ReactNode;
  /** Props for in-panel validation button and results table. */
  validationSettings?: ValidationSettings;
  /** If the instructions panel should always have a dark background, regardless of theme */
  fixedDarkBackground?: boolean;
  /** Component to use for AI Tutor responses, if any. */
  AiTutor2ResponseView?: React.ReactNode;
  overrideTheme?: Theme;
  /** If the lab requires the user to click run in order to continue.
   * Only applies to non-validated levels. */
  requireRun?: boolean;
}

interface ValidationSettings {
  onValidate: () => void;
  onStopValidation: () => void;
  isValidating: boolean;
  isValidateDisabled: boolean;
}

/**
 * Lab2 instructions component. This can be used by any Lab2 lab, and will retrieve
 * all necessary data from the Lab2 redux store.
 *
 * Note that currently, this component solely renders instructions, and does not include any features
 * present on the legacy instructions panel, such as Help & Tips, Documentation, Code Review,
 * For Teachers Only, etc.
 */
const Instructions: React.FunctionComponent<InstructionsProps> = ({
  levelProperties,
  isRunning,
  hasRun,
  hasEdited,
  layout = 'vertical',
  handleInstructionsTextClick,
  className,
  bottomComponent,
  validationSettings,
  fixedDarkBackground,
  AiTutor2ResponseView,
  overrideTheme,
  requireRun,
}) => {
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
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
  const validationResults = useAppSelector(
    state => state.lab.validationState?.validationResults
  );
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel
  );
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);

  const offerBrowserTts =
    useAppSelector(state => state.lab.levelProperties?.offerBrowserTts) ||
    queryParams('show-tts') === 'true';

  const useSecondaryFinishButton =
    useAppSelector(
      state => state.lab.levelProperties?.useSecondaryFinishButton
    ) || queryParams('use-secondary-finish-button') === 'true';

  const defaultTheme = useTheme();
  const theme = overrideTheme || defaultTheme;

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

  const canShowNextButton = useMemo(() => {
    if (levelProperties?.submittable) {
      return true;
    } else if (isPredictLevel) {
      return predictResponseSubmitted;
    } else if (hasValidationConditions) {
      return validationSatisfied;
    } else {
      return !requireRun || hasRun;
    }
  }, [
    levelProperties?.submittable,
    isPredictLevel,
    hasValidationConditions,
    predictResponseSubmitted,
    validationSatisfied,
    requireRun,
    hasRun,
  ]);

  // Don't render anything if we don't have any instructions.
  if (
    levelProperties === undefined ||
    levelProperties.longInstructions === undefined
  ) {
    return null;
  }

  const vertical = layout === 'vertical';
  const showSecondaryFinishButton = useSecondaryFinishButton && !hasNextLevel;

  const useMessage =
    showSecondaryFinishButton &&
    queryParams('show-secondary-finish-button-question') === 'true'
      ? commonI18n.finishMessage()
      : validationMessage;

  // The secondary finish button avoids a reappearance animation by not using
  // the unique index.
  const useMessageIndex = useSecondaryFinishButton
    ? undefined
    : validationIndex;
  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles.instructions,
        fixedDarkBackground
          ? moduleStyles.fixedDarkBackground
          : moduleStyles.standardBackground,
        moduleStyles['instructions-' + layout],
        vertical && moduleStyles.vertical,
        'instructions',
        className
      )}
      data-theme={theme}
    >
      <div
        id="instructions-panel"
        className={classNames(
          moduleStyles.item,
          vertical && moduleStyles.itemVertical
        )}
      >
        <div
          key={levelProperties.longInstructions}
          id="instructions-text"
          className={classNames(moduleStyles.bubble, moduleStyles.textContent)}
        >
          <div className={moduleStyles.scrollingContent}>
            <MainInstructionsContent
              instructionsText={levelProperties.longInstructions}
              handleInstructionsTextClick={handleInstructionsTextClick}
            />
            <PredictQuestion className={moduleStyles.predictQuestion} />
          </div>
          {offerBrowserTts && (
            <div className={moduleStyles.ttsContainer}>
              <TextToSpeech text={levelProperties.longInstructions} />
            </div>
          )}
          {validationSettings && (
            <ValidationButton
              onValidate={validationSettings.onValidate}
              onStopValidation={validationSettings.onStopValidation}
              isValidating={validationSettings.isValidating}
              isValidateDisabled={validationSettings.isValidateDisabled}
            />
          )}
          {bottomComponent && (
            <div className={moduleStyles.bottomComponent}>
              {bottomComponent}
            </div>
          )}
        </div>
        {validationResults && (
          <div className={moduleStyles.bubble}>
            <div className={moduleStyles.textContent}>
              <div className={moduleStyles.scrollingContent}>
                <ValidationResults />
              </div>
            </div>
          </div>
        )}
        {AiTutor2ResponseView && AiTutor2ResponseView}
        {isPredictLevel && (
          <>
            <InstructorsOnly>
              <div
                className={classNames(
                  moduleStyles.bubble,
                  moduleStyles.predictSummaryBubble
                )}
              >
                <PredictSummary />
              </div>
            </InstructorsOnly>
            <PredictQuestionRunPrompt />
          </>
        )}
        {(useMessage || canShowNextButton) && (
          <div
            key={useMessageIndex + ' - ' + useMessage}
            id="instructions-feedback"
            className={classNames(
              moduleStyles.feedback,
              showSecondaryFinishButton && moduleStyles.feedbackBottom
            )}
          >
            <div
              id="instructions-feedback-message"
              className={moduleStyles.bubble}
            >
              {useMessage && (
                <div ref={feedbackRef} tabIndex={-1}>
                  <EnhancedSafeMarkdown
                    markdown={useMessage}
                    className={moduleStyles.markdownText}
                    handleInstructionsTextClick={handleInstructionsTextClick}
                  />
                </div>
              )}
              <NavigationButton
                levelProperties={levelProperties}
                hasRun={hasRun}
                hasEdited={hasEdited}
                className={moduleStyles.buttonInstruction}
                size={'s'}
              />
              {offerBrowserTts && useMessage && !canShowNextButton && (
                <div className={moduleStyles.ttsContainer}>
                  <TextToSpeech text={useMessage} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Instructions;

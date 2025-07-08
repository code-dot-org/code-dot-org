import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  isPredictAnswerLocked,
  isPredictResponseSubmitted,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import ValidationResults from '@cdo/apps/lab2/views/components/Instructions/ValidationResults';
import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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
}) => {
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const validationState = useAppSelector(state => state.lab.validationState);
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);

  const offerBrowserTts =
    useAppSelector(state => state.lab.levelProperties?.offerBrowserTts) ||
    queryParams('show-tts') === 'true';

  const useSecondaryFinishButton =
    useAppSelector(
      state => state.lab.levelProperties?.useSecondaryFinishButton
    ) || queryParams('use-secondary-finish-button') === 'true';

  const dispatch = useAppDispatch();
  const defaultTheme = useTheme();
  const theme = overrideTheme || defaultTheme;

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus on the feedback message when it first becomes present and the program is not running.
    // This ensures it will be read by screen readers.
    // It's ok to focus after each run switch, as the message will also reappear when the user re-runs
    // the program.
    if (validationState?.message && !isRunning) {
      feedbackRef.current?.focus();
    }
  }, [validationState?.message, isRunning]);

  const validationScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the validation results when they are updated.
    if (validationState?.validationResults) {
      // We must at least set a timeout with a wait of 0 to ensure the scroll happens at all,
      // because the DOM needs to update before we can scroll to the new element.
      setTimeout(
        () => validationScrollRef.current?.scrollIntoView({behavior: 'smooth'}),
        0
      );
    }
  }, [validationState?.validationResults]);

  // Don't render anything if we don't have any instructions.
  if (
    levelProperties === undefined ||
    levelProperties.longInstructions === undefined
  ) {
    return null;
  }

  const canShowNextButton =
    (!validationState?.hasConditions || validationState?.satisfied) &&
    (!predictSettings?.isPredictLevel || predictResponseSubmitted);

  const vertical = layout === 'vertical';
  const showSecondaryFinishButton = useSecondaryFinishButton && !hasNextLevel;

  const useMessage =
    showSecondaryFinishButton &&
    queryParams('show-secondary-finish-button-question') === 'true'
      ? commonI18n.finishMessage()
      : validationState?.message;

  // The secondary finish button avoids a reappearance animation by not using
  // the unique index.
  const useMessageIndex = useSecondaryFinishButton
    ? undefined
    : validationState?.index;
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
          className={classNames(moduleStyles.bubble)}
        >
          {offerBrowserTts && (
            <TextToSpeech
              text={levelProperties.longInstructions}
              higherPosition={!!bottomComponent}
            />
          )}
          <div
            id="instructions-text-content"
            className={moduleStyles.textContent}
          >
            <div
              className={
                offerBrowserTts
                  ? moduleStyles.scrollingContentWithTTS
                  : moduleStyles.scrollingContentWithoutTTS
              }
            >
              <MainInstructionsContent
                instructionsText={levelProperties.longInstructions}
                handleInstructionsTextClick={handleInstructionsTextClick}
              />
              <PredictQuestion
                predictSettings={predictSettings}
                predictResponse={predictResponse}
                setPredictResponse={response =>
                  dispatch(setPredictResponse(response))
                }
                predictAnswerLocked={predictAnswerLocked}
                className={moduleStyles.predictQuestion}
              />
            </div>
            {validationSettings && (
              <ValidationButton
                onValidate={validationSettings.onValidate}
                onStopValidation={validationSettings.onStopValidation}
                hasConditions={validationState?.hasConditions}
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
        </div>
        {validationState?.validationResults && (
          <>
            <div ref={validationScrollRef} />
            <div className={moduleStyles.bubble}>
              <div className={moduleStyles.textContent}>
                <div className={moduleStyles.scrollingContentWithoutTTS}>
                  <ValidationResults />
                </div>
              </div>
            </div>
          </>
        )}
        {AiTutor2ResponseView && AiTutor2ResponseView}
        {predictSettings?.isPredictLevel && (
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

            <PredictQuestionRunPrompt
              hasSelected={!!predictResponse}
              hasSubmitted={predictAnswerLocked}
            />
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
              {offerBrowserTts && useMessage && !canShowNextButton && (
                <TextToSpeech text={useMessage} />
              )}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Instructions;

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {LevelPredictSettings} from '@cdo/apps/lab2/levelEditors/types';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {
  isPredictAnswerLocked,
  isPredictResponseSubmitted,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LevelProperties} from '../../types';

import NavigationButton from './Instructions/NavigationButton';
import PredictQuestion from './PredictQuestion';
import PredictSummary from './PredictSummary';
import TextToSpeech from './TextToSpeech';

import moduleStyles from './instructions.module.scss';

interface InstructionsProps {
  hasRun: boolean;
  hasEdited: boolean;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  /** Whether the instructions panel should show lesson navigation buttons (Continue & Finish) */
  manageNavigation?: boolean;
  /** Optional classname for the container */
  className?: string;
  /** Optional component to render at the bottom of the main instructions. */
  bottomComponent?: React.ReactNode;
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
  hasRun,
  hasEdited,
  layout,
  handleInstructionsTextClick,
  className,
  manageNavigation = true,
  bottomComponent,
}) => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, message, satisfied, index} = useAppSelector(
    state => state.lab.validationState
  );
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

  const {theme} = useTheme();

  // Don't render anything if we don't have any instructions.
  if (
    levelProperties === undefined ||
    levelProperties.longInstructions === undefined
  ) {
    return null;
  }

  const canShowNextButton =
    manageNavigation &&
    (!hasConditions || satisfied) &&
    (!predictSettings?.isPredictLevel || predictResponseSubmitted);

  return (
    <InstructionsPanel
      text={levelProperties.longInstructions}
      message={message || undefined}
      messageIndex={index}
      theme={theme}
      predictSettings={predictSettings}
      predictResponse={predictResponse}
      setPredictResponse={response => dispatch(setPredictResponse(response))}
      predictAnswerLocked={predictAnswerLocked}
      layout={layout}
      handleInstructionsTextClick={handleInstructionsTextClick}
      offerBrowserTts={offerBrowserTts}
      className={className}
      canShowNextButton={canShowNextButton}
      hasNextLevel={hasNextLevel}
      useSecondaryFinishButton={useSecondaryFinishButton}
      onContinueOrFinish={() => dispatch(continueOrFinishLesson())}
      bottomComponent={bottomComponent}
      levelProperties={levelProperties}
      hasRun={hasRun}
      hasEdited={hasEdited}
    />
  );
};

interface InstructionsPanelProps {
  /** Primary instructions text to display. */
  text: string;
  /** Optional message to display under the main text. This is typically a validation message. */
  message?: string;
  /** Key for rendering the optional message. A unique value ensures the appearance animation shows. */
  messageIndex?: number;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /** Display theme. Defaults to Dark. */
  theme?: 'Dark' | 'Light';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  predictSettings?: LevelPredictSettings;
  predictResponse?: string;
  setPredictResponse: (response: string) => void;
  predictAnswerLocked: boolean;
  /** Optional classname for the container */
  className?: string;
  offerBrowserTts?: boolean;
  canShowNextButton: boolean;
  hasNextLevel: boolean;
  useSecondaryFinishButton: boolean;
  onContinueOrFinish: () => void;
  bottomComponent?: React.ReactNode;
  levelProperties: LevelProperties;
  hasRun: boolean;
  hasEdited: boolean;
}

/**
 * Renders the instructions panel view. This was initially set up as a separate component
 * so that it could be used without the Lab2 redux integration if necessary.
 * If the level is a predict level, the predict reset button now uses redux, as it needs
 * multiple unique redux values and there isn't a clear use case for having no redux integration
 * anymore.
 * TODO: Determine if we need this separate component anymore, or if we can merge this into Instructions.
 * https://codedotorg.atlassian.net/browse/CT-671
 */
const InstructionsPanel: React.FunctionComponent<InstructionsPanelProps> = ({
  text,
  message,
  messageIndex,
  layout = 'vertical',
  theme = 'Dark',
  handleInstructionsTextClick,
  predictSettings,
  predictResponse,
  setPredictResponse,
  predictAnswerLocked,
  className,
  offerBrowserTts,
  canShowNextButton,
  hasNextLevel,
  useSecondaryFinishButton,
  bottomComponent,
  levelProperties,
  hasRun,
  hasEdited,
}) => {
  const vertical = layout === 'vertical';

  const showSecondaryFinishButton = useSecondaryFinishButton && !hasNextLevel;

  const useMessage =
    showSecondaryFinishButton &&
    queryParams('show-secondary-finish-button-question') === 'true'
      ? commonI18n.finishMessage()
      : message;

  // The secondary finish button avoids a reappearance animation by not using
  // the unique index.
  const useMessageIndex = useSecondaryFinishButton ? undefined : messageIndex;

  const feedbackRef = useRef<HTMLDivElement>(null);
  const runButton = document.querySelector('#run-button');

  useEffect(() => {
    const checkRunButton = () => {
      if (feedbackRef.current && runButton?.textContent === 'Run') {
        feedbackRef.current.focus();
        return true;
      }
      return false;
    };

    const observer = new MutationObserver(mutations => {
      if (checkRunButton()) {
        // Stop observing once the run button is found and has the text 'Run'
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, [useMessage, canShowNextButton, runButton?.textContent]);

  return (
    <div
      id="instructions"
      data-theme="Light"
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
        {text && (
          <div
            key={text}
            id="instructions-text"
            className={moduleStyles['text-' + theme]}
          >
            {offerBrowserTts && (
              <TextToSpeech text={text} higherPosition={!!bottomComponent} />
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
                <EnhancedSafeMarkdown
                  markdown={text}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
                <PredictQuestion
                  predictSettings={predictSettings}
                  predictResponse={predictResponse}
                  setPredictResponse={setPredictResponse}
                  predictAnswerLocked={predictAnswerLocked}
                />
                {predictSettings?.isPredictLevel && (
                  <InstructorsOnly>
                    <div
                      className={classNames(
                        moduleStyles['message-' + theme],
                        moduleStyles.predictSummary
                      )}
                    >
                      <PredictSummary />
                    </div>
                  </InstructorsOnly>
                )}
              </div>
              {bottomComponent && (
                <div className={moduleStyles.bottomComponent}>
                  {bottomComponent}
                </div>
              )}
            </div>
          </div>
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
              className={moduleStyles['message-' + theme]}
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;

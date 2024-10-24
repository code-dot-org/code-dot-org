import classNames from 'classnames';
import React, {useContext} from 'react';
import {useSelector} from 'react-redux';

import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {Button} from '@cdo/apps/componentLibrary/button';
import {LevelPredictSettings} from '@cdo/apps/lab2/levelEditors/types';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {
  isPredictAnswerLocked,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ThemeContext} from '../ThemeWrapper';

import PredictQuestion from './PredictQuestion';
import PredictSummary from './PredictSummary';
import TextToSpeech from './TextToSpeech';

import moduleStyles from './instructions.module.scss';

interface InstructionsProps {
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
  layout,
  handleInstructionsTextClick,
  className,
  manageNavigation = true,
}) => {
  const instructionsText = useAppSelector(
    state => state.lab.levelProperties?.longInstructions
  );
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, message, satisfied, index} = useAppSelector(
    state => state.lab.validationState
  );
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);
  const offerBrowserTts = useAppSelector(
    state => state.lab.levelProperties?.offerBrowserTts
  );

  const dispatch = useAppDispatch();

  const {theme} = useContext(ThemeContext);

  // Don't render anything if we don't have any instructions.
  if (instructionsText === undefined) {
    return null;
  }

  return (
    <InstructionsPanel
      text={instructionsText}
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
      canShowNextButton={manageNavigation && (!hasConditions || satisfied)}
      hasNextLevel={hasNextLevel}
      onContinueOrFinish={() => dispatch(continueOrFinishLesson())}
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
  /** Display theme. Defaults to dark. */
  theme?: 'dark' | 'light';
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
  onContinueOrFinish: () => void;
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
  theme = 'dark',
  handleInstructionsTextClick,
  predictSettings,
  predictResponse,
  setPredictResponse,
  predictAnswerLocked,
  className,
  offerBrowserTts,
  canShowNextButton,
  hasNextLevel,
  onContinueOrFinish,
}) => {
  const vertical = layout === 'vertical';

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
        {text && (
          <div
            key={text}
            id="instructions-text"
            className={moduleStyles['text-' + theme]}
          >
            {offerBrowserTts && <TextToSpeech text={text} />}
            <div
              id="instructions-text-content"
              className={moduleStyles.textContent}
            >
              {predictSettings?.isPredictLevel && <PredictSummary />}
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
            </div>
          </div>
        )}
        {(message || canShowNextButton) && (
          <div
            key={messageIndex + ' - ' + message}
            id="instructions-feedback"
            className={moduleStyles.feedback}
          >
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              {offerBrowserTts && message && <TextToSpeech text={message} />}
              {message && (
                <EnhancedSafeMarkdown
                  markdown={message}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
              )}
              {canShowNextButton && (
                <Button
                  id="instructions-continue-button"
                  text={
                    hasNextLevel ? commonI18n.continue() : commonI18n.finish()
                  }
                  type={hasNextLevel ? 'primary' : 'secondary'}
                  color={hasNextLevel ? 'purple' : 'black'}
                  onClick={onContinueOrFinish}
                  className={moduleStyles.buttonInstruction}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;

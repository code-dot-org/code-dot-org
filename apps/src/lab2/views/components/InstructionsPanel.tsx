import classNames from 'classnames';
import React from 'react';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {LevelPredictSettings} from '@cdo/apps/lab2/levelEditors/types';
import PredictQuestion from '@cdo/apps/lab2/views/components/Instructions/PredictQuestion';
import PredictSummary from '@cdo/apps/lab2/views/components/Instructions/PredictSummary';
import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';

import {LevelProperties} from '../../types';

import NavigationButton from './Instructions/NavigationButton';

import moduleStyles from '@cdo/apps/lab2/views/components/instructions.module.scss';

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
  bottomComponent?: React.ReactNode;
  noTextAnimation?: boolean;
  isRunning?: boolean;
  levelProperties: LevelProperties;
  hasRun: boolean;
  hasEdited: boolean;
}

/**
 * Renders the instructions panel view, which is used within labs as well as to render a preview
 * of the instructions panel on the level edit page. Note that this component has
 * a minor Redux dependency via the PredictSummary component, but that this is not rendered on the level edit page.
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
  noTextAnimation,
  isRunning,
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
        aria-live="polite"
        className={classNames(
          moduleStyles.item,
          vertical && moduleStyles.itemVertical
        )}
      >
        {text && (
          <div
            key={text}
            id="instructions-text"
            className={classNames(
              moduleStyles['text-' + theme],
              noTextAnimation && moduleStyles.noAnimation
            )}
          >
            <div
              id="instructions-text-content"
              className={moduleStyles.textContent}
            >
              <div className={moduleStyles.scrollingContent}>
                <EnhancedSafeMarkdown
                  markdown={text}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
                <PredictQuestion />
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
              {offerBrowserTts && (
                <div className={moduleStyles.ttsContainer}>
                  <TextToSpeech text={text} />
                </div>
              )}
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
              <div className={moduleStyles.messageContent}>
                {useMessage && (
                  <div tabIndex={-1}>
                    <EnhancedSafeMarkdown
                      markdown={useMessage}
                      className={moduleStyles.markdownText}
                      handleInstructionsTextClick={handleInstructionsTextClick}
                    />
                  </div>
                )}
                <div className={moduleStyles.navigationContainer}>
                  <NavigationButton
                    levelProperties={levelProperties}
                    hasRun={hasRun}
                    hasEdited={hasEdited}
                    className={moduleStyles.buttonInstruction}
                  />
                </div>
              </div>
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

export default InstructionsPanel;

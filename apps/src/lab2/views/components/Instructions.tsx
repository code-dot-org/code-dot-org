import classNames from 'classnames';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {navigateToNextLevel} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import {LevelPredictSettings} from '@cdo/apps/lab2/levelEditors/types';
import {
  isPredictAnswerLocked,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LabState} from '../../lab2Redux';
import {ThemeContext} from '../ThemeWrapper';

import PredictQuestion from './PredictQuestion';
import PredictSummary from './PredictSummary';
import TextToSpeech from './TextToSpeech';

import moduleStyles from './instructions.module.scss';

const commonI18n = require('@cdo/locale');

interface InstructionsProps {
  /** Additional callback to fire before navigating to the next level. */
  beforeNextLevel?: () => void;
  /**
   * Base asset URL for images. Note: this is currently unused but may be needed in the future if we support
   * instructions images.
   * */
  baseUrl?: string;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * If the image should pop out to the right of the panel or to the left when clicked. Note: instructions images
   * are currently unsupported. Defaults to right.
   */
  imagePopOutDirection?: 'right' | 'left';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  manageNavigation?: boolean;
  /** Optional classname for the container */
  className?: string;
  /** Whether we support TTS. */
  offerTts?: boolean;
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
  beforeNextLevel,
  baseUrl,
  layout,
  imagePopOutDirection,
  handleInstructionsTextClick,
  className,
  manageNavigation = true,
  offerTts = false,
}) => {
  const instructionsText = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.longInstructions
  );
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, message, satisfied, index} = useSelector(
    (state: {lab: LabState}) => state.lab.validationState
  );
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);

  // If there are no validation conditions, we can show the continue button so long as
  // there is another level and manageNavigation is true.
  // If validation is present, also check that conditions are satisfied.
  const showContinueButton =
    manageNavigation && (!hasConditions || satisfied) && hasNextLevel;

  // If there are no validation conditions, we can show the finish button so long as
  // this is the last level in the progression and the instructions panel is managing navigation.
  // If validation is present, also check that conditions are satisfied.
  const showFinishButton =
    manageNavigation && (!hasConditions || satisfied) && !hasNextLevel;

  const dispatch = useAppDispatch();

  const {theme} = useContext(ThemeContext);

  const onNextPanel = useCallback(() => {
    if (beforeNextLevel) {
      beforeNextLevel();
    }
    dispatch(navigateToNextLevel());
  }, [dispatch, beforeNextLevel]);

  // Don't render anything if we don't have any instructions.
  if (instructionsText === undefined) {
    return null;
  }

  return (
    <InstructionsPanel
      text={instructionsText}
      message={message || undefined}
      messageIndex={index}
      showContinueButton={showContinueButton}
      showFinishButton={showFinishButton}
      beforeFinish={beforeNextLevel}
      onNextPanel={onNextPanel}
      theme={theme}
      predictSettings={predictSettings}
      predictResponse={predictResponse}
      setPredictResponse={response => dispatch(setPredictResponse(response))}
      predictAnswerLocked={predictAnswerLocked}
      layout={layout}
      imagePopOutDirection={imagePopOutDirection}
      handleInstructionsTextClick={handleInstructionsTextClick}
      offerTts={offerTts}
      className={className}
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
  /** Optional image URL to display. */
  imageUrl?: string;
  /** If the continue button should be shown. */
  showContinueButton?: boolean;
  /** If the finish button should be shown. */
  showFinishButton?: boolean;
  /** Additional callback to fire before finishing the level. */
  beforeFinish?: () => void;
  /** Callback to call when clicking the next button. */
  onNextPanel?: () => void;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * If the image should pop out to the right of the panel or to the left when clicked. Note: instructions images
   * are currently unsupported. Defaults to right.
   */
  imagePopOutDirection?: 'right' | 'left';
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
  offerTts?: boolean;
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
  imageUrl,
  showContinueButton,
  showFinishButton,
  beforeFinish,
  onNextPanel,
  layout = 'vertical',
  imagePopOutDirection = 'right',
  theme = 'dark',
  handleInstructionsTextClick,
  predictSettings,
  predictResponse,
  setPredictResponse,
  predictAnswerLocked,
  className,
  offerTts,
}) => {
  const [showBigImage, setShowBigImage] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const imageClicked = () => {
    setShowBigImage(!showBigImage);
  };

  const vertical = layout === 'vertical';

  const canShowContinueButton = showContinueButton && onNextPanel;

  const canShowFinishButton = showFinishButton;

  const onFinish = useCallback(() => {
    if (beforeFinish) {
      beforeFinish();
    }
    setIsFinished(true);
  }, [beforeFinish]);

  // Reset the Finish button state when it changes from shown to hidden.
  useEffect(() => {
    setIsFinished(false);
  }, [canShowFinishButton]);

  const finalMessage =
    'You finished this lesson! Check in with your teacher for the next activity';

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
        {imageUrl && (
          <div
            className={classNames(
              moduleStyles.imageContainer,
              !vertical && moduleStyles.horizontal
            )}
          >
            {
              // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
              // Verify or update this alt-text as necessary
            }
            <img
              src={imageUrl}
              className={classNames(
                moduleStyles.image,
                !vertical && moduleStyles.fixedHeight
              )}
              onClick={() => imageClicked()}
              alt=""
            />
            {showBigImage && (
              <div
                className={classNames(
                  moduleStyles.bigImage,
                  imagePopOutDirection === 'left' && moduleStyles.bigImageLeft
                )}
              >
                {
                  // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
                  // Verify or update this alt-text as necessary
                }
                <img src={imageUrl} onClick={() => imageClicked()} alt="" />
              </div>
            )}
          </div>
        )}
        {text && (
          <div
            key={text}
            id="instructions-text"
            className={moduleStyles['text-' + theme]}
          >
            {offerTts && <TextToSpeech text={text} />}
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
        )}
        {(message || canShowContinueButton || canShowFinishButton) && (
          <div
            key={messageIndex + ' - ' + message}
            id="instructions-feedback"
            className={moduleStyles.feedback}
          >
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              {offerTts && message && <TextToSpeech text={message} />}
              {message && (
                <EnhancedSafeMarkdown
                  markdown={message}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
              )}
              {canShowContinueButton && (
                <button
                  id="instructions-continue-button"
                  type="button"
                  onClick={onNextPanel}
                  className={moduleStyles.buttonInstruction}
                >
                  {commonI18n.continue()}
                </button>
              )}
              {canShowFinishButton && (
                <>
                  <button
                    id="instructions-finish-button"
                    type="button"
                    onClick={onFinish}
                    disabled={isFinished}
                    className={moduleStyles.buttonInstruction}
                  >
                    {commonI18n.finish()}
                  </button>
                  {isFinished && <Heading6>{finalMessage}</Heading6>}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;

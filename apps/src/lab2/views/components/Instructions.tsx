import React, {useCallback, useContext, useEffect, useState} from 'react';
import classNames from 'classnames';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import moduleStyles from './instructions.module.scss';
import {useSelector} from 'react-redux';
import {navigateToNextLevel} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import {LabState} from '../../lab2Redux';
import {ProjectLevelData} from '../../types';
import {ThemeContext} from '../ThemeWrapper';
const commonI18n = require('@cdo/locale');

import ControlButtons from '../../../codebridge/ControlButtons';
import Console from '../../../codebridge/Console';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import aiBotIcon from '@cdo/static/aichat/ai-bot-icon.svg';
const Typist = require('react-typist').default;

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
}) => {
  // Prefer using long instructions if available, otherwise fall back to level data text.
  const instructionsText = useSelector(
    (state: {lab: LabState}) =>
      state.lab.levelProperties?.longInstructions ||
      (state.lab.levelProperties?.levelData as ProjectLevelData | undefined)
        ?.text
  );
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, message, satisfied, index} = useSelector(
    (state: {lab: LabState}) => state.lab.validationState
  );

  // If there are no validation conditions, we can show the continue button so long as
  // there is another level. If validation is present, also check that conditions are satisfied.
  const showContinueButton = (!hasConditions || satisfied) && hasNextLevel;

  // If there are no validation conditions, we can show the finish button so long as
  // this is the last level in the progression. If validation is present, also
  // check that conditions are satisfied.
  const showFinishButton = (!hasConditions || satisfied) && !hasNextLevel;

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
      {...{baseUrl, layout, imagePopOutDirection, handleInstructionsTextClick}}
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
}

/**
 * Renders the instructions panel view. This is a separate component so that it can be
 * used without the Lab2 redux integration if necessary.
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
}) => {
  const [showBigImage, setShowBigImage] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showAiHelp, setShowAiHelp] = useState(false);

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

  const codeOutput = useAppSelector(
    state => state.codebridgeConsole.output
  ).filter(text => ['system_out', 'system_in'].includes(text.type));

  const done = codeOutput.find(
    text => text.contents.includes('FAILED') || text.contents.includes('OK')
  );
  const succeeded = !codeOutput.find(text => text.contents.includes('FAILED'));

  if (done) {
    console.log(succeeded);
  }

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles['instructions-' + theme],
        vertical && moduleStyles.vertical,
        'instructions'
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
            <EnhancedSafeMarkdown
              markdown={text}
              className={moduleStyles.markdownText}
              handleInstructionsTextClick={handleInstructionsTextClick}
            />
          </div>
        )}

        {codeOutput.length > 0 && (
          <div id="instructions-text" className={moduleStyles['text-' + theme]}>
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              <Console />
            </div>
          </div>
        )}

        {done && succeeded && (
          <div
            id="instructions-text"
            className={classNames(
              moduleStyles['text-' + theme],
              moduleStyles.fullMessage
            )}
          >
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              Nice work. You passed all the tests.
            </div>
          </div>
        )}

        {done && !succeeded && (
          <div
            id="instructions-text"
            className={classNames(
              moduleStyles['text-' + theme],
              moduleStyles.fullMessage
            )}
          >
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              <div className={moduleStyles.aiHelp}>
                <img src={aiBotIcon} alt="An icon depicting a robot" />
                {!showAiHelp && (
                  <button
                    id="ai-help"
                    type="button"
                    onClick={() => setShowAiHelp(true)}
                    className={classNames(
                      moduleStyles.buttonInstruction,
                      moduleStyles.buttonAiHelp
                    )}
                  >
                    I would like some help
                  </button>
                )}
                {showAiHelp && (
                  <Typist
                    cursor={{show: false}}
                    className={moduleStyles.textAiHelp}
                  >
                    Okay, let's take a look at what's going on. You seem to have
                    some tests that are failing. Read the error messages
                    carefully.
                  </Typist>
                )}
              </div>
            </div>
          </div>
        )}

        {(message || canShowContinueButton || canShowFinishButton) && (
          <div
            key={messageIndex + ' - ' + message}
            id="instructions-feedback"
            className={classNames(
              moduleStyles.feedback,
              moduleStyles.feedbackBottom
            )}
          >
            <div
              id="instructions-feedback-message"
              className={classNames(
                moduleStyles['message-' + theme],
                moduleStyles.horizontalButtons
              )}
            >
              {message && (
                <EnhancedSafeMarkdown
                  markdown={message}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
              )}
              {canShowContinueButton && <ControlButtons />}
              {done && succeeded && canShowContinueButton && (
                <button
                  id="instructions-continue-button"
                  type="button"
                  onClick={onNextPanel}
                  className={classNames(
                    moduleStyles.buttonInstruction,
                    moduleStyles.buttonInstructionContinue
                  )}
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

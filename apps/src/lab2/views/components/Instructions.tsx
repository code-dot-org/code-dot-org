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
}) => {
  const [showBigImage, setShowBigImage] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const imageClicked = () => {
    setShowBigImage(!showBigImage);
  };

  const vertical = layout === 'vertical';

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

  const texts = [
    '__1. Import Necessary Libraries__',
    '__2. Load the Data__',
    '__3. Inspect the Data__',
    '__4. Calculate Average Ratings__',
    '__5. Plot the Data__',
    '__6. Analyze the Output__',
  ];

  const bodies = [
    "Let's start by importing the Python libraries pandas and matplotlib.\n" +
      '- Import `pandas` as `pd`\n' +
      '- Import `matplotlib.pyplot` as `plt`',
    "You'll need to load your dataset from a CSV file into a pandas DataFrame so you can manipulate and analyze the data.\n" +
      '- Load the dataset containing the product ratings.',
    "Let's display the first few rows of the dataset to understand its structure.\n" +
      '- Print the first few rows of the dataset to understand its structure.',
    'Calculate the average rating for each product so we can understand the overall customer satisfaction for each item. Group the data by product to find the average.\n' +
      '- Use `groupby` to group the data by product.\n' +
      '- Calculate the average rating for each product.',
    "Let's visualize it! Create a bar chart to visually represent the average ratings for each product to compare them at a glance.\n" +
      '- Use plot to create a bar chart. Be sure to set:\n' +
      '  - the title of the chart\n' +
      '  - the label for the x axis\n' +
      '  - the label for the y axis\n' +
      '- Show the bar chart!',
    'Take a look at the resulting bar chart.',
  ];

  const testSteps = [
    {showTexts: 1, dotColors: ['grey']},
    {showTexts: 2, dotColors: ['green', 'grey']},
    {showTexts: 3, dotColors: ['green', 'green', 'grey']},
    {showTexts: 3, dotColors: ['green', 'green', 'red']},
    {showTexts: 4, dotColors: ['green', 'green', 'green', 'grey']},
    {showTexts: 4, dotColors: ['green', 'red', 'green', 'red']},
    {showTexts: 4, dotColors: ['green', 'green', 'green', 'green']},
    {showTexts: 5, dotColors: ['green', 'green', 'green', 'green', 'grey']},
    {
      showTexts: 6,
      dotColors: ['green', 'green', 'green', 'green', 'green', 'grey'],
    },
    {
      showTexts: 6,
      dotColors: ['green', 'green', 'green', 'green', 'green', 'green'],
    },
  ];

  const [testStep, setTestStep] = useState(0);

  const currentTestStep = testSteps[testStep];

  const canShowContinueButton = testStep === testSteps.length - 1;
  const canShowRunTestButtons = !canShowContinueButton;

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
        <div className={moduleStyles.lessonHeading}>Data science lesson</div>
        {texts
          .filter((entry, entryIndex) => entryIndex < currentTestStep.showTexts)
          .map((text, index) => (
            <div
              key={text}
              id="instructions-text"
              className={classNames(
                moduleStyles.instructionText,
                moduleStyles['text-' + theme]
              )}
            >
              <EnhancedSafeMarkdown
                markdown={
                  text +
                  (currentTestStep.dotColors[index] !== 'green'
                    ? '\n\n' + bodies[index]
                    : '')
                }
                className={moduleStyles.markdownText}
                handleInstructionsTextClick={handleInstructionsTextClick}
              />
              <div
                className={classNames(
                  moduleStyles.dot,
                  currentTestStep.dotColors[index] === 'red'
                    ? moduleStyles.dotRed
                    : currentTestStep.dotColors[index] === 'green'
                    ? moduleStyles.dotGreen
                    : undefined
                )}
              />
            </div>
          ))}

        {(message ||
          canShowContinueButton ||
          canShowFinishButton ||
          canShowRunTestButtons) && (
          <div
            key={messageIndex + ' - ' + message}
            id="instructions-feedback"
            className={moduleStyles.feedback}
          >
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              {message && (
                <EnhancedSafeMarkdown
                  markdown={message}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
              )}
              {canShowRunTestButtons && (
                <div className={moduleStyles.runtestcontainer}>
                  <button
                    id="instructions-run-button"
                    type="button"
                    onClick={onNextPanel}
                    className={moduleStyles.buttonInstruction}
                  >
                    Run
                  </button>
                  <button
                    id="instructions-test-button"
                    type="button"
                    onClick={() => setTestStep(testStep + 1)}
                    className={moduleStyles.buttonInstruction}
                  >
                    Test
                  </button>
                </div>
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

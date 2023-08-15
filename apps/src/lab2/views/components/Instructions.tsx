import React, {useState} from 'react';
import classNames from 'classnames';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import moduleStyles from './instructions.module.scss';
import {useSelector} from 'react-redux';
import {navigateToNextLevel} from '@cdo/apps/code-studio/progressRedux';
import {
  levelCount,
  currentLevelIndex,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {LabState} from '../../lab2Redux';
import {ProjectLevelData} from '../../types';
const commonI18n = require('@cdo/locale');

interface InstructionsProps {
  /** Base asset URL for images */
  baseUrl: string;
  /** If the instructions panel should be rendered vertically. Defaults to false */
  vertical?: boolean;
  /** If the instructions panel should be rendered on the right side of the screen. Defaults to false. */
  right?: boolean;
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
  baseUrl, // Currently unused, but may be needed in the future if we support instructions images.
  vertical = false,
  right = false,
}) => {
  // Prefer using long instructions if available, otherwise fall back to level data text.
  const instructionsText = useSelector(
    (state: {lab: LabState}) =>
      state.lab.levelProperties?.longInstructions ||
      (state.lab.levelProperties?.levelData as ProjectLevelData | undefined)
        ?.text
  );
  const levelIndex = useSelector(currentLevelIndex);
  const currentLevelCount = useSelector(levelCount);
  const validationState = useSelector(
    (state: {lab: LabState}) => state.lab.validationState
  );
  const showNextButton =
    validationState.satisfied && levelIndex + 1 < currentLevelCount;
  const dispatch = useAppDispatch();

  // Don't render anything if we don't have any instructions.
  if (instructionsText === undefined) {
    return null;
  }

  return (
    <InstructionsPanel
      text={instructionsText}
      message={validationState.message || undefined}
      showNextButton={showNextButton}
      onNextPanel={() => dispatch(navigateToNextLevel())}
      vertical={vertical}
      right={right}
    />
  );
};

interface InstructionsPanelProps {
  /** Primary instructions text to display. */
  text: string;
  /** Optional message to display under the main text. This is typically a validation message. */
  message?: string;
  /** Optional image URL to display. */
  imageUrl?: string;
  /** If the next button should be shown. */
  showNextButton?: boolean;
  /** Callback to call when clicking the next button. */
  onNextPanel?: () => void;
  /** If the instructions panel should be rendered vertically. Defaults to false */
  vertical?: boolean;
  /** If the instructions panel should be rendered on the right side of the screen. Defaults to false. */
  right?: boolean;
}

/**
 * Renders the instructions panel view. This is a separate component so that it can be
 * used without the Lab2 redux integration if necessary.
 */
const InstructionsPanel: React.FunctionComponent<InstructionsPanelProps> = ({
  text,
  message,
  imageUrl,
  showNextButton,
  onNextPanel,
  vertical,
  right,
}) => {
  const [showBigImage, setShowBigImage] = useState(false);

  const imageClicked = () => {
    setShowBigImage(!showBigImage);
  };

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles.instructions,
        vertical && moduleStyles.vertical
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
            <img
              src={imageUrl}
              className={classNames(
                moduleStyles.image,
                !vertical && moduleStyles.fixedHeight
              )}
              onClick={() => imageClicked()}
            />
            {showBigImage && (
              <div
                className={classNames(
                  moduleStyles.bigImage,
                  right && moduleStyles.bigImageRight
                )}
              >
                <img src={imageUrl} onClick={() => imageClicked()} />
              </div>
            )}
          </div>
        )}
        {text && (
          <div key={text} id="instructions-text" className={moduleStyles.text}>
            <SafeMarkdown
              markdown={text}
              className={moduleStyles.markdownText}
            />
          </div>
        )}
        {message && (
          <div id="instructions-feedback" className={moduleStyles.feedback}>
            <div
              key={message}
              id="instructions-feedback-message"
              className={moduleStyles.message}
            >
              <SafeMarkdown
                markdown={message}
                className={moduleStyles.markdownText}
              />
              {showNextButton && onNextPanel && (
                <button
                  id="instructions-feedback-button"
                  type="button"
                  onClick={onNextPanel}
                  className={moduleStyles.buttonNext}
                >
                  {commonI18n.continue()}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;

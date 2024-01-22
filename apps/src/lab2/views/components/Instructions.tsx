import React, {useCallback, useContext, useState} from 'react';
import classNames from 'classnames';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
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
import {ThemeContext} from '../ThemeWrapper';
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
   * A callback when the user clicks on something that might show a callout.
   */
  showCallout?: (id: string) => null;
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
  showCallout,
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
  const {hasConditions, message, satisfied} = useSelector(
    (state: {lab: LabState}) => state.lab.validationState
  );

  // If there are no validation conditions, we can show the next button so long as
  // there is another level. If validation is present, also check that conditions are satisfied.
  const showNextButton =
    (!hasConditions || satisfied) && levelIndex + 1 < currentLevelCount;

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
      showNextButton={showNextButton}
      onNextPanel={onNextPanel}
      theme={theme}
      {...{baseUrl, layout, imagePopOutDirection, showCallout}}
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
   * A callback when the user clicks on something that might show a callout.
   */
  showCallout?: (id: string) => null;
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
  layout = 'vertical',
  imagePopOutDirection = 'right',
  theme = 'dark',
  showCallout,
}) => {
  const [showBigImage, setShowBigImage] = useState(false);

  const imageClicked = () => {
    setShowBigImage(!showBigImage);
  };

  const vertical = layout === 'vertical';

  const canShowNextButton = showNextButton && onNextPanel;

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles['instructions-' + theme],
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
              showCallout={showCallout}
            />
          </div>
        )}
        {(message || canShowNextButton) && (
          <div id="instructions-feedback" className={moduleStyles.feedback}>
            <div
              id="instructions-feedback-message"
              className={moduleStyles['message-' + theme]}
            >
              {message && (
                <EnhancedSafeMarkdown
                  markdown={message}
                  className={moduleStyles.markdownText}
                  showCallout={showCallout}
                />
              )}
              {canShowNextButton && (
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

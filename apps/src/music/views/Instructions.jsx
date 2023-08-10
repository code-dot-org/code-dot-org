import PropTypes from 'prop-types';
import React, {useState} from 'react';
import classNames from 'classnames';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import moduleStyles from './instructions.module.scss';
import {useSelector, useDispatch} from 'react-redux';
import commonI18n from '@cdo/locale';
import {navigateToNextLevel} from '@cdo/apps/code-studio/progressRedux';
import {
  levelCount,
  currentLevelIndex,
} from '@cdo/apps/code-studio/progressReduxSelectors';

const Instructions = ({baseUrl, vertical, right}) => {
  // Prefer using long instructions if available, otherwise fall back to level data text.
  const instructionsText = useSelector(
    state =>
      state.lab.levelProperties?.longInstructions ||
      state.lab.levelProperties?.levelData?.text
  );
  const levelIndex = useSelector(currentLevelIndex);
  const currentLevelCount = useSelector(levelCount);
  const validationState = useSelector(state => state.lab.validationState);
  const showNextButton =
    validationState.satisfied && levelIndex + 1 < currentLevelCount;
  const dispatch = useDispatch();

  return (
    <InstructionsPanel
      text={instructionsText}
      message={validationState.message}
      showNextButton={showNextButton}
      onNextPanel={() => dispatch(navigateToNextLevel())}
      vertical={vertical}
      right={right}
    />
  );
};

Instructions.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  vertical: PropTypes.bool,
  right: PropTypes.bool,
};

const InstructionsPanel = ({
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

InstructionsPanel.propTypes = {
  text: PropTypes.string,
  imageUrl: PropTypes.string,
  message: PropTypes.string,
  showNextButton: PropTypes.bool,
  onNextPanel: PropTypes.func,
  vertical: PropTypes.bool,
  right: PropTypes.bool,
};

export default Instructions;

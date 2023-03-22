import PropTypes from 'prop-types';
import React, {useContext, useEffect, useState} from 'react';
import classNames from 'classnames';
import moduleStyles from './instructions.module.scss';
import {AnalyticsContext} from '../context';

/**
 * Renders the Music Lab instructions component.
 */
const Instructions = ({
  progression,
  currentPanel,
  message,
  onNextPanel,
  baseUrl,
  vertical,
  right
}) => {
  const [showBigImage, setShowBigImage] = useState(false);

  const getNextPanel = () => {
    return currentPanel + 1 < progression.steps.length
      ? currentPanel + 1
      : null;
  };

  const imageClicked = () => {
    setShowBigImage(!showBigImage);
  };

  const analyticsReporter = useContext(AnalyticsContext);
  useEffect(() => {
    // Instructions steps are 0-indexed, tracking is 1-based
    analyticsReporter.onInstructionsVisited(currentPanel + 1);
  }, [currentPanel, analyticsReporter]);

  const nextPanel = getNextPanel();

  const progressText = progression
    ? `${currentPanel + 1}/${progression.steps.length}`
    : '';

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles.instructions,
        vertical && moduleStyles.vertical
      )}
    >
      {progression && (
        <InstructionsPanel
          panel={progression.steps[currentPanel]}
          message={message}
          vertical={vertical}
          baseUrl={baseUrl}
          path={progression.path}
          imageClicked={imageClicked}
          right={right}
          showBigImage={showBigImage}
        />
      )}
      <div className={moduleStyles.bottom}>
        <div className={moduleStyles.progressText}>{progressText}</div>
        <div>
          {onNextPanel && (
            <button
              type="button"
              onClick={() => onNextPanel()}
              className={classNames(
                moduleStyles.button,
                moduleStyles.buttonNext,
                nextPanel !== null && moduleStyles.buttonActive
              )}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Instructions.propTypes = {
  progression: PropTypes.object,
  currentPanel: PropTypes.number,
  message: PropTypes.string,
  onNextPanel: PropTypes.func,
  baseUrl: PropTypes.string.isRequired,
  vertical: PropTypes.bool,
  right: PropTypes.bool
};

const InstructionsPanel = ({
  panel,
  message,
  vertical,
  baseUrl,
  path,
  imageClicked,
  right,
  showBigImage
}) => {
  return (
    <div
      className={classNames(
        moduleStyles.item,
        vertical && moduleStyles.itemVertical
      )}
    >
      {panel.title && (
        <div
          className={classNames(
            moduleStyles.itemTitle,
            !vertical && moduleStyles.itemTitleHorizontal
          )}
        >
          {panel.title}
        </div>
      )}
      {panel.imageSrc && (
        <div
          className={classNames(
            moduleStyles.imageContainer,
            !vertical && moduleStyles.horizontal
          )}
        >
          <img
            src={baseUrl + path + '/' + panel.imageSrc}
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
              <img
                src={baseUrl + path + '/' + panel.imageSrc}
                onClick={() => imageClicked()}
              />
            </div>
          )}
        </div>
      )}
      <div
        className={classNames(
          moduleStyles.text,
          vertical && moduleStyles.textVertical
        )}
      >
        {panel.text}
        <div className={moduleStyles.message}>{message}</div>
      </div>
    </div>
  );
};

InstructionsPanel.propTypes = {
  panel: PropTypes.object.isRequired,
  message: PropTypes.string,
  baseUrl: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  imageClicked: PropTypes.func.isRequired,
  showBigImage: PropTypes.bool,
  vertical: PropTypes.bool,
  right: PropTypes.bool
};

export default Instructions;

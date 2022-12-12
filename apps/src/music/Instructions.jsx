import PropTypes from 'prop-types';
import React, {useContext, useEffect, useState} from 'react';
import classNames from 'classnames';
import moduleStyles from './instructions.module.scss';
import {AnalyticsContext} from './context';

const Instructions = ({instructions, baseUrl, vertical, right}) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [showBigImage, setShowBigImage] = useState(false);

  const getPreviousPanel = () => {
    return currentPanel > 0 ? currentPanel - 1 : null;
  };

  const getNextPanel = () => {
    return currentPanel + 1 < instructions?.groups[0].panels.length
      ? currentPanel + 1
      : null;
  };

  const changePanel = nextPanel => {
    const nextPanelIndex = nextPanel ? getNextPanel() : getPreviousPanel();

    if (nextPanelIndex !== null) {
      setCurrentPanel(nextPanelIndex);
      setShowBigImage(false);
    }
  };

  const imageClicked = () => {
    setShowBigImage(!showBigImage);
  };

  const analyticsReporter = useContext(AnalyticsContext);
  useEffect(() => {
    // Instructions panels are 0-indexed, tracking is 1-based
    analyticsReporter.onInstructionsVisited(currentPanel + 1);
  }, [currentPanel, analyticsReporter]);

  const previousPanel = getPreviousPanel();
  const nextPanel = getNextPanel();

  const progressText = instructions
    ? `${currentPanel + 1}/${instructions.groups[0].panels.length}`
    : '';

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles.instructions,
        vertical && moduleStyles.vertical
      )}
    >
      {instructions && (
        <InstructionsPanel
          panel={instructions.groups[0].panels[currentPanel]}
          vertical={vertical}
          baseUrl={baseUrl}
          path={instructions.groups[0].path}
          imageClicked={imageClicked}
          right={right}
          showBigImage={showBigImage}
        />
      )}
      <div className={moduleStyles.bottom}>
        <div className={moduleStyles.progressText}>{progressText}</div>
        <div>
          <button
            type="button"
            onClick={() => changePanel(false)}
            className={classNames(
              moduleStyles.button,
              previousPanel !== null && moduleStyles.buttonActive
            )}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => changePanel(true)}
            className={classNames(
              moduleStyles.button,
              nextPanel !== null && moduleStyles.buttonActive
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

Instructions.propTypes = {
  instructions: PropTypes.object,
  baseUrl: PropTypes.string.isRequired,
  vertical: PropTypes.bool,
  right: PropTypes.bool
};

const InstructionsPanel = ({
  panel,
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
      </div>
    </div>
  );
};

InstructionsPanel.propTypes = {
  panel: PropTypes.object.isRequired,
  baseUrl: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  imageClicked: PropTypes.func.isRequired,
  showBigImage: PropTypes.bool,
  vertical: PropTypes.bool,
  right: PropTypes.bool
};

export default Instructions;

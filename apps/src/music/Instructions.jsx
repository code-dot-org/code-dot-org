import PropTypes from 'prop-types';
import React, {useContext, useEffect, useState} from 'react';
import classNames from 'classnames';
import moduleStyles from './instructions.module.scss';
import {AnalyticsContext} from './context';
import Typist from 'react-typist-component';

const Instructions = ({
  instructions,
  baseUrl,
  vertical,
  right,
  onInstructionsPresenting
}) => {
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
      onInstructionsPresenting(true);
    }
  };

  const imageClicked = () => {
    setShowBigImage(!showBigImage);
  };

  const onShowing = () => {
    onInstructionsPresenting(false);
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
      {instructions?.groups[0].panels.map((panel, index) => {
        return (
          <div
            key={index}
            className={classNames(
              moduleStyles.item,
              index === currentPanel && moduleStyles.visible,
              vertical && moduleStyles.itemVertical
            )}
          >
            {panel.imageSrc && (
              <div
                className={classNames(
                  moduleStyles.imageContainer,
                  !vertical && moduleStyles.horizontal
                )}
              >
                <img
                  src={
                    baseUrl + instructions.groups[0].path + '/' + panel.imageSrc
                  }
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
                      src={
                        baseUrl +
                        instructions.groups[0].path +
                        '/' +
                        panel.imageSrc
                      }
                      onClick={() => imageClicked()}
                    />
                  </div>
                )}
              </div>
            )}
            <Typist
              typingDelay={25}
              onTypingDone={index === currentPanel && onShowing}
              key={currentPanel}
            >
              <div
                className={classNames(
                  moduleStyles.text,
                  vertical && moduleStyles.textVertical
                )}
              >
                {panel.text}
              </div>
            </Typist>
          </div>
        );
      })}
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
  right: PropTypes.bool,
  onInstructionsPresenting: PropTypes.func.isRequired
};

export default Instructions;

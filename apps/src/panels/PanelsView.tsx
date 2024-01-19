// Panels
//
// This is a React client for a panels level.  Note that this is
// only used for levels that use Lab2.

import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {PanelsLevelData} from './types';
import panelsLocale from './locale';
import styles from './panels.module.scss';
import classNames from 'classnames';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

function useWindowSize() {
  const [size, setSize] = useState([
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  ]);
  useLayoutEffect(() => {
    function updateSize() {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      setSize([width, height]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

const PanelsView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const appName = 'panels';

  const levelData = useSelector(
    ({lab}: {lab: LabState}) => lab.levelProperties?.levelData
  );
  const currentAppName = useSelector(
    ({lab}: {lab: LabState}) => lab.levelProperties?.appName
  );

  const [levelPanels, setLevelPanels] = useState<PanelsLevelData | null>(null);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    if (currentAppName === appName && levelData) {
      setLevelPanels(levelData as PanelsLevelData);
    }
  }, [currentAppName, levelData]);

  const handleButtonClick = useCallback(() => {
    if (levelPanels?.panels) {
      if (currentPanel < levelPanels.panels.length - 1) {
        setCurrentPanel(currentPanel + 1);
      } else {
        dispatch(sendSuccessReport(appName));
        dispatch(navigateToNextLevel());
      }
    }
  }, [levelPanels, currentPanel, dispatch]);

  const handleBubbleClick = (index: number) => {
    setCurrentPanel(index);
  };

  // Leave a margin to the left and the right of the panels, to the edges
  // of the screen.
  const horizontalMargin = 40;

  // Leave a vertical margin above and below the panels, to the edges of the
  // screen.
  const verticalMargin = 50;

  // We need room below the panels content for the children passed in.  This area
  // can contain things like a Continue button.
  const childrenAreaHeight = 70;

  // The aspect ratio of the panels.
  const contentAspectRatio = 16 / 9;

  let [targetWidth, targetHeight] = useWindowSize();
  targetWidth -= horizontalMargin * 2;
  targetHeight -= verticalMargin * 2 + childrenAreaHeight;

  let width, height;
  if (targetWidth / targetHeight > contentAspectRatio) {
    height = targetHeight;
    width = contentAspectRatio * height;
  } else {
    width = targetWidth;
    height = width / contentAspectRatio;
  }

  if (!levelPanels?.panels) {
    return <div />;
  }

  return (
    <div
      id="panels-container"
      className={styles.panelsContainer}
      key={currentPanel}
    >
      <div className={styles.panel} style={{width, height}}>
        <div
          className={styles.image}
          style={{
            backgroundImage: `url("${levelPanels.panels[currentPanel].imageUrl}")`,
          }}
        />
        <EnhancedSafeMarkdown
          markdown={levelPanels.panels[currentPanel]?.text}
          className={styles.markdownText}
        />
      </div>
      <div
        className={styles.childrenArea}
        style={{width: width, height: childrenAreaHeight}}
      >
        <button
          id="panels-button"
          type="button"
          onClick={handleButtonClick}
          className={styles.button}
        >
          {currentPanel < levelPanels.panels.length - 1
            ? panelsLocale.next()
            : panelsLocale.continue()}
        </button>
        <div id="panels-bubbles">
          {Array.from(Array(levelPanels.panels.length).keys()).map(index => {
            return (
              <FontAwesome
                key={index}
                className={classNames(
                  'icon',
                  styles.bubble,
                  index === currentPanel
                    ? styles.bubbleCurrent
                    : styles.bubbleNotCurrent
                )}
                title={undefined}
                icon="circle"
                onClick={() => handleBubbleClick(index)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PanelsView;

// Panels
//
// This is a React client for a panels level.  Note that this is
// only used for levels that use Lab2.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useState,
} from 'react';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {PanelsLevelData} from './types';
import styles from './panels.module.scss';
import classNames from 'classnames';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {currentLevelIndex} from '@cdo/apps/code-studio/progressReduxSelectors';
const commonI18n = require('@cdo/locale');

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
  const levelIndex = useSelector(currentLevelIndex);

  const [levelPanels, setLevelPanels] = useState<PanelsLevelData | null>(null);
  const [currentPanel, setCurrentPanel] = useState(0);

  // Go back to the first panel whenever a level switch occurs.
  useEffect(() => {
    setCurrentPanel(0);
  }, [levelIndex]);

  useEffect(() => {
    if (currentAppName === appName && levelData) {
      setLevelPanels(levelData as PanelsLevelData);
    }
  }, [currentAppName, levelData]);

  const handleButtonClick = useCallback(() => {
    if (levelPanels?.panels) {
      const nextUrl = levelPanels.panels[currentPanel].nextUrl;

      if (currentPanel < levelPanels.panels.length - 1) {
        setCurrentPanel(currentPanel + 1);
      } else if (nextUrl) {
        // This is a short-term solution for the Music Lab progression in incubation.  We will not attempt
        // to send a success report for a level that uses this feature.
        window.location.href = nextUrl;
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

  let [targetWidth, targetHeight] = useWindowSize();
  targetWidth -= horizontalMargin * 2;
  targetHeight -= verticalMargin * 2 + childrenAreaHeight;

  const [width, height] = useMemo(() => {
    let width, height;

    // The aspect ratio of the panels.
    const contentAspectRatio = 16 / 9;

    if (targetWidth / targetHeight > contentAspectRatio) {
      height = targetHeight;
      width = contentAspectRatio * height;
    } else {
      width = targetWidth;
      height = width / contentAspectRatio;
    }
    return [width, height];
  }, [targetWidth, targetHeight]);

  if (!levelPanels?.panels) {
    return <div />;
  }

  const showSmallText = height < 300;
  const textLayoutClass =
    levelPanels.panels[currentPanel].layout === 'text-bottom-left'
      ? styles.markdownTextBottomLeft
      : styles.markdownTextTopRight;

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
          className={classNames(
            styles.markdownText,
            showSmallText && styles.markdownTextSmall,
            textLayoutClass
          )}
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
            ? commonI18n.next()
            : commonI18n.continue()}
        </button>
        {levelPanels.panels.length > 1 && (
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
        )}
      </div>
    </div>
  );
};

export default PanelsView;

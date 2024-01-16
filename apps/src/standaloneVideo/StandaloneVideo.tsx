// StandaloneVideo
//
// This is a React client for a standalone_video level.  Note that this is
// only used for levels that use Lab2.  For levels that don't use Lab2,
// they will get an older-style level implemented with a HAML page and some
// non-React JS code.

import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import Video from './Video';
import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {VideoLevelData} from '@cdo/apps/lab2/types';
import standaloneVideoLocale from './locale';
import styles from './video.module.scss';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
const Typist = require('react-typist').default;
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const panelImages = [
  `/blockly/media/music/musiclab_intro_end_0.png`,
  `/blockly/media/music/musiclab_intro_end_1.png`,
  `/blockly/media/music/musiclab_intro_end_2.png`,
];

const StandaloneVideo: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const levelData = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.levelData
  );
  const currentAppName = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.appName
  );

  const [levelVideo, setLevelVideo] = React.useState<VideoLevelData | null>(
    null
  );

  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    if (currentAppName === 'standalone_video' && levelData) {
      setLevelVideo(levelData as VideoLevelData);
    }
  }, [currentAppName, levelData]);

  const nextButtonPressed = () => {
    const appType = 'standalone_video';
    dispatch(sendSuccessReport(appType));
    dispatch(navigateToNextLevel());
  };

  if (levelVideo?.panels) {
    return (
      <div className={styles.panelContainer} key={currentPanel}>
        <div
          className={styles.panel}
          style={{backgroundImage: `url("${panelImages[currentPanel]}")`}}
        >
          <EnhancedSafeMarkdown
            markdown={levelVideo?.panels[currentPanel]?.text}
            className={styles.markdownText}
          />
        </div>
        <button
          id="standalone-video-continue-button"
          type="button"
          onClick={() =>
            currentPanel < levelVideo.panels.length - 1
              ? setCurrentPanel(currentPanel + 1)
              : nextButtonPressed()
          }
          className={styles.panelButton}
        >
          {currentPanel < levelVideo.panels.length - 1
            ? 'Next'
            : standaloneVideoLocale.continue()}
        </button>
        <div className={styles.panelBubbles}>
          {Array.from(Array(levelVideo.panels.length).keys()).map(index => {
            return (
              <FontAwesome
                style={{
                  color: index === currentPanel ? 'white' : 'grey',
                  margin: '0 7px',
                }}
                title={undefined}
                icon="circle"
                className={'icon'}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div id="standalone-video">
      <Video src={levelVideo?.video.src}>
        <button
          id="standalone-video-continue-button"
          type="button"
          onClick={() => nextButtonPressed()}
          className={styles.buttonNext}
        >
          {standaloneVideoLocale.continue()}
        </button>
      </Video>
    </div>
  );
};

export default StandaloneVideo;

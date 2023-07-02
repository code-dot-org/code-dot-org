// StandaloneVideo
//
// This is a React client for a standalone_video level.  Note that this is
// only used for levels that use the LabContainer.  For levels that don't use
// the LabContainer, they will use an older-style level implemented with a
// HAML page and some non-React JS code.

import PropTypes from 'prop-types';
import React from 'react';
import {useSelector} from 'react-redux';
import Video from './Video';
import {navigateToNextLevel} from '@cdo/apps/code-studio/progressRedux';
import standaloneVideoLocale from './locale';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import styles from './video.module.scss';

const StandaloneVideo = () => {
  const dispatch = useAppDispatch();
  const levelVideo = useSelector(state => state.lab.levelData);

  return (
    <div id="standalone-video">
      <Video src={levelVideo?.src}>
        <button
          id="standalone-video-continue-button"
          type="button"
          onClick={() => dispatch(navigateToNextLevel())}
          className={styles.buttonNext}
        >
          {standaloneVideoLocale.continue()}
        </button>
      </Video>
    </div>
  );
};

StandaloneVideo.propTypes = {
  onError: PropTypes.func,
};

export default StandaloneVideo;

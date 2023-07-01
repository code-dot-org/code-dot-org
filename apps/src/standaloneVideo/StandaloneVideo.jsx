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

const StandaloneVideo = () => {
  const levelVideo = useSelector(state => state.lab.levelVideo);

  return <Video src={levelVideo?.src} />;
};

StandaloneVideo.propTypes = {
  onError: PropTypes.func,
};

export default StandaloneVideo;

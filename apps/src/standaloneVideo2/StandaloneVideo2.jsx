// StandaloneVideo2

import PropTypes from 'prop-types';
import React from 'react';
import {useSelector} from 'react-redux';
import Video from './Video';

const StandaloneVideo2 = () => {
  const levelVideo = useSelector(state => state.lab.levelVideo);

  return <Video src={levelVideo?.src} />;
};

StandaloneVideo2.propTypes = {
  onError: PropTypes.func,
};

export default StandaloneVideo2;

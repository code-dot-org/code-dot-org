// StandaloneVideo2

import PropTypes from 'prop-types';
import React from 'react';
import Video from './Video';

const StandaloneVideo2 = () => {
  return <Video />;
};

StandaloneVideo2.propTypes = {
  onError: PropTypes.func,
};

export default StandaloneVideo2;

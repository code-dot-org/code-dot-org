import React from 'react';
import PropTypes from 'prop-types';

export default function ExampleImage({src}) {
  // TODO: use style attr instead of classes?
  return <img className="aniGif example-image" src={src} />;
}

ExampleImage.propTypes = {
  src: PropTypes.string.isRequired
};

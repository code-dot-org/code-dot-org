import React from 'react';
import PropTypes from 'prop-types';

export default function ExampleImage({src}) {
  return <img className="example-image" src={src} />;
}

ExampleImage.propTypes = {
  src: PropTypes.string.isRequired
};

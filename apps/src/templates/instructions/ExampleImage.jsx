import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

export default function ExampleImage({src}) {
  // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
  // Verify or update this alt-text as necessary
  return <img style={styles.img} src={src} alt="" />;
}

ExampleImage.propTypes = {
  src: PropTypes.string.isRequired,
};

const styles = {
  img: {
    // Styles below are taken from .example-image in application.scss.
    // They are reimplemented here to decouple this component from
    // backend styling.
    boxShadow: `0 10px 13px -11px ${color.black}`,
    border: `2px solid ${color.light_gray}`,
    borderRadius: 25,
    boxSizing: 'border-box',
  },
};

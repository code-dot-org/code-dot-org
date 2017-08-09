/* If a dashboard page knows that it's going to have a banner image as part of
 * the page header, then it should include this component at its top so that it
 * can put a text header and subheader over that banner image.
 */

import React from 'react';
import PropTypes from 'prop-types';
import color from "../util/color";

const styles = {
  headerBanner: {
    height: 260
  },
  headerBannerShort: {
    height: 140
  },
  bannerHeading: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginBottom: 10,
    lineHeight: '40px'
  },
  bannerHeadingShort: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginBottom: 10,
    lineHeight: '40px',
    marginTop: -20
  },
  bannerSubHeading: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    lineHeight: '32px',
    marginBottom: 10
  },
  bannerDescription: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    width: 600,
    marginBottom: 20,
  }
};

export default function HeaderBanner({
  short,
  headingText,
  subHeadingText,
  description,
  children,
}) {
  return (
    <div style={short ? styles.headerBannerShort : styles.headerBanner}>
      <div style={short ? styles.bannerHeadingShort : styles.bannerHeading}>
        {headingText || <span>&nbsp;</span>}
      </div>
      <div style={styles.bannerSubHeading}>
        {subHeadingText || <span>&nbsp;</span>}
      </div>
      {description && (
        <div style={styles.bannerDescription}>
          {description}
        </div>
      )}
      {children}
    </div>
  );
}
HeaderBanner.propTypes = {
  headingText: PropTypes.string,
  subHeadingText: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  short: PropTypes.bool
};

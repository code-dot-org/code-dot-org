/* If a dashboard page knows that it's going to have a banner image as part of
 * the page header, then it should include this component at its top so that it
 * can put a text header and subheader over that banner image.
 */

import React from 'react';
import color from "../util/color";

const styles = {
  bannerHeading: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginTop: 40,
    marginBottom: 10,
    lineHeight: '40px'
  },
  bannerSubHeading: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 13,
    marginBottom: 145
  }
};

const HeadingBanner = React.createClass({
  propTypes: {
    headingText: React.PropTypes.string,
    subHeadingText: React.PropTypes.string
  },

  render() {
    return (
      <div>
        <div style={styles.bannerHeading}>
          {this.props.headingText || <span>&nbsp;</span>}
        </div>
        <div style={styles.bannerSubHeading}>
          {this.props.subHeadingText || <span>&nbsp;</span>}
        </div>
      </div>
    );
  }
});

export default HeadingBanner;

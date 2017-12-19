/* If a dashboard page knows that it's going to have a banner image as part of
 * the page header, then it should include this component at its top so that it
 * can put a text header and subheader over that banner image.
 */

import React, {PropTypes} from 'react';
import color from "../util/color";
import {connect} from 'react-redux';

const styles = {
  headerBanner: {
    height: 260,
    maxWidth: '60%',
    marginTop: 25
  },
  headerBannerResponsive: {
    marginBottom: 61,
    maxWidth: '60%',
    marginTop: 25
  },
  headerBannerShort: {
    height: 140,
    maxWidth: '60%',
    marginTop: 25
  },
  headerBannerShortResponsive: {
    marginBottom: 61,
    maxWidth: '60%',
    marginTop: 25
  },
  bannerHeading: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginBottom: 10,
    lineHeight: '40px'
  },
  bannerHeadingResponsive: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginBottom: 10,
    lineHeight: '40px',
    height: 240
  },
  bannerHeadingShort: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginBottom: 10,
    lineHeight: '40px',
    marginTop: -20
  },
  bannerHeadingShortResponsive: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginBottom: 10,
    lineHeight: '40px',
    marginTop: -20,
    height: 120
  },
  bannerSubHeading: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    lineHeight: '21px',
    marginBottom: 10
  },
  bannerSubHeadingResponsive: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.dark_charcoal,
    fontSize: 16,
    lineHeight: '21px',
    marginBottom: 10
  },
  bannerDescription: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    lineHeight: '21px',
    marginBottom: 20,
  },
  bannerDescriptionResponsive: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.dark_charcoal,
    fontSize: 16,
    lineHeight: '21px',
    marginBottom: 20,
  }
};

const HeaderBanner = React.createClass({
  propTypes: {
    headingText: PropTypes.string,
    subHeadingText: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.node,
    short: PropTypes.bool,
    responsiveSize: React.PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
  },

  render() {
    const {short, headingText, subHeadingText, description, responsiveSize} = this.props;

    let headerStyle, headingStyle, subHeadingStyle, descriptionStyle;
    if (responsiveSize === 'xs') {
      headerStyle = short ? styles.headerBannerShortResponsive : styles.headerBannerResponsive;
      headingStyle = short ? styles.bannerHeadingShortResponsive : styles.bannerHeadingResponsive;
      subHeadingStyle = styles.bannerSubHeadingResponsive;
      descriptionStyle = styles.bannerDescriptionResponsive;
    } else {
      headerStyle = short ? styles.headerBannerShort : styles.headerBanner;
      headingStyle = short ? styles.bannerHeadingShort : styles.bannerHeading;
      subHeadingStyle = styles.bannerSubHeading;
      descriptionStyle = styles.bannerDescription;
    }

    return (
      <div style={headerStyle}>
        <div style={headingStyle}>
          {headingText || <span>&nbsp;</span>}
        </div>
        <div style={subHeadingStyle}>
          {subHeadingText || <span>&nbsp;</span>}
        </div>
        {description && (
          <div style={descriptionStyle}>
            {description}
          </div>
        )}
        {this.props.children}
      </div>
    );
  }
});

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(HeaderBanner);

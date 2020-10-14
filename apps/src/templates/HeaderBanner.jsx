/* If a dashboard page knows that it's going to have a banner image as part of
 * the page header, then it should include this component at its top so that it
 * can put a text header and subheader over that banner image.
 */

import PropTypes from 'prop-types';
import React from 'react';
import color from '../util/color';
import {connect} from 'react-redux';
import styleConstants from '@cdo/apps/styleConstants';

const styles = {
  headerBannerContainer: {
    minHeight: 260,
    maxWidth: styleConstants['content-width']
  },
  headerBannerContainerShort: {
    minHeight: 140,
    maxWidth: styleConstants['content-width']
  },
  bannerHeading: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    lineHeight: '40px'
  },
  bannerHeadingShort: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    lineHeight: '40px'
  },
  bannerSubHeading: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    lineHeight: '21px',
    marginTop: 16
  },
  bannerSubHeadingResponsive: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.dark_charcoal,
    fontSize: 16,
    lineHeight: '21px',
    marginTop: 16
  },
  bannerDescription: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    lineHeight: '21px',
    marginTop: 16
  },
  bannerDescriptionResponsive: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.dark_charcoal,
    fontSize: 16,
    lineHeight: '21px',
    marginTop: 16
  }
};

class HeaderBanner extends React.Component {
  static propTypes = {
    headingText: PropTypes.string,
    subHeadingText: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.node,
    short: PropTypes.bool,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    backgroundUrl: PropTypes.string
  };

  render() {
    const {
      short,
      headingText,
      subHeadingText,
      description,
      responsiveSize,
      backgroundUrl
    } = this.props;

    let headerBannerContainerStyle,
      headingStyle,
      subHeadingStyle,
      descriptionStyle;

    const isSmallScreen = responsiveSize === 'xs';
    headerBannerContainerStyle = short
      ? styles.headerBannerContainerShort
      : styles.headerBannerContainer;
    headingStyle = short ? styles.bannerHeadingShort : styles.bannerHeading;
    if (isSmallScreen) {
      subHeadingStyle = styles.bannerSubHeadingResponsive;
      descriptionStyle = styles.bannerDescriptionResponsive;
    } else {
      subHeadingStyle = styles.bannerSubHeading;
      descriptionStyle = styles.bannerDescription;
    }

    const headerBannerStyle = {
      backgroundImage: `url(${backgroundUrl})`
    };

    if (isSmallScreen) {
      return (
        <div>
          <div id={'header-banner'} style={headerBannerStyle}>
            <div
              className={'bannerContentContainer'}
              style={headerBannerContainerStyle}
            >
              <div className={'bannerContent'}>
                <div style={headingStyle}>{headingText}</div>
              </div>
            </div>
          </div>
          <div id={'header-banner-overflow'}>
            <div className={'bannerContent'}>
              {subHeadingText && (
                <div style={subHeadingStyle}>{subHeadingText}</div>
              )}
              {description && <div style={descriptionStyle}>{description}</div>}
              {this.props.children && (
                <div className={'children'}>{this.props.children}</div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div id={'header-banner'} style={headerBannerStyle}>
          <div
            className={'bannerContentContainer'}
            style={headerBannerContainerStyle}
          >
            <div className={'bannerContent'}>
              <div style={headingStyle}>{headingText}</div>
              {subHeadingText && (
                <div style={subHeadingStyle}>{subHeadingText}</div>
              )}
              {description && <div style={descriptionStyle}>{description}</div>}
              {this.props.children && (
                <div className={'children'}>{this.props.children}</div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(HeaderBanner);

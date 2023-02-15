/* If a dashboard page knows that it's going to have a banner image as part of
 * the page header, then it should include this component at its top so that it
 * can put a text header and subheader over that banner image.
 */

import PropTypes from 'prop-types';
import React from 'react';
import color from '../util/color';
import {connect} from 'react-redux';
import styleConstants from '@cdo/apps/styleConstants';

class HeaderBanner extends React.Component {
  static propTypes = {
    headingText: PropTypes.string,
    subHeadingText: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.node,
    short: PropTypes.bool,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    backgroundUrl: PropTypes.string,
    imageUrl: PropTypes.string
  };

  render() {
    const {
      short,
      headingText,
      subHeadingText,
      description,
      responsiveSize,
      backgroundUrl,
      imageUrl
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

    const bannerContentImageStyle = short
      ? styles.bannerContentImageShort
      : styles.bannerContentImage;

    if (isSmallScreen) {
      return (
        <div>
          <div id={'header-banner'} style={headerBannerStyle}>
            <div
              className={'bannerContentContainer'}
              style={headerBannerContainerStyle}
            >
              <div className={'bannerContent'}>
                <h1 style={headingStyle}>{headingText}</h1>
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
              <h1 style={headingStyle}>{headingText}</h1>
              {subHeadingText && (
                <div style={subHeadingStyle}>{subHeadingText}</div>
              )}
              {description && <div style={descriptionStyle}>{description}</div>}
              {this.props.children && (
                <div className={'children'}>{this.props.children}</div>
              )}
            </div>
            {imageUrl && <img style={bannerContentImageStyle} src={imageUrl} />}
          </div>
        </div>
      );
    }
  }
}

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
    fontFamily: '"Barlow Semi Condensed Semibold", sans-serif',
    color: color.white,
    fontSize: 48,
    marginBottom: 0
  },
  bannerHeadingShort: {
    fontFamily: '"Barlow Semi Condensed Semibold", sans-serif',
    color: color.white,
    fontSize: 48,
    marginBottom: 0
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
  },
  bannerContentImage: {
    maxHeight: 260
  },
  bannerContentImageShort: {
    maxHeight: 140
  }
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(HeaderBanner);

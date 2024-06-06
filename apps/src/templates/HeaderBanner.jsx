/* If a dashboard page knows that it's going to have a banner image as part of
 * the page header, then it should include this component at its top so that it
 * can put a text header and subheader over that banner image.
 */

import PropTypes from 'prop-types';
import React from 'react';

import Typography from '@cdo/apps/componentLibrary/typography';

import style from './header-banner.module.scss';

export default class HeaderBanner extends React.Component {
  static propTypes = {
    headingText: PropTypes.string,
    subHeadingText: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.node,
    backgroundUrl: PropTypes.string.isRequired,
    backgroundImageStyling: PropTypes.object,
    imageUrl: PropTypes.string,
    imgStyling: PropTypes.object,
  };

  render() {
    const {
      headingText,
      subHeadingText,
      description,
      children,
      backgroundUrl,
      backgroundImageStyling,
      imageUrl,
      imgStyling,
    } = this.props;

    const backgroundImageStyle = {
      backgroundImage: `url(${backgroundUrl})`,
      ...backgroundImageStyling,
    };

    return (
      <div style={backgroundImageStyle} className={style.banner}>
        <div className={style.contentWrapper}>
          <div className={style.textWrapper}>
            <Typography semanticTag="h1" visualAppearance="heading-xxl">
              {headingText}
            </Typography>
            {subHeadingText && (
              <Typography semanticTag="p" visualAppearance="body-one">
                {subHeadingText}
              </Typography>
            )}
            {description && (
              <Typography semanticTag="p" visualAppearance="body-one">
                {description}
              </Typography>
            )}
            {children}
          </div>
          {imageUrl && (
            <figure>
              <img src={imageUrl} style={imgStyling} alt="" />
            </figure>
          )}
        </div>
      </div>
    );
  }
}

// Use this component if a dashboard page has a header banner with no image

import PropTypes from 'prop-types';
import React from 'react';
import Typography from '@cdo/apps/componentLibrary/typography';
import style from './header-banner-no-image.module.scss';

export default class HeaderBanner extends React.Component {
  static propTypes = {
    headingText: PropTypes.string,
    subHeadingText: PropTypes.string,
    description: PropTypes.string,
    backgroundColor: PropTypes.object,
    children: PropTypes.node,
  };

  render() {
    const {
      headingText,
      subHeadingText,
      description,
      backgroundColor,
      children,
    } = this.props;

    const backgroundStyling = {
      backgroundColor: backgroundColor,
      ...backgroundStyling,
    };

    return (
      <section style={backgroundStyling} className={style.banner}>
        <div className={style.wrapper}>
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
      </section>
    );
  }
}

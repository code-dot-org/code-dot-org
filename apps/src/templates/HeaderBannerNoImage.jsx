// Use this component if a dashboard page has a header banner with no image.
// Adapted from the HeaderBanner component.

import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import style from './header-banner-no-image.module.scss';

export default class HeaderBannerNoImage extends React.Component {
  static propTypes = {
    headingText: PropTypes.string,
    subHeadingText: PropTypes.string,
    description: PropTypes.string,
    backgroundColor: PropTypes.string,
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
          <Typography variant="h1" gutterBottom>
            {headingText}
          </Typography>
          {subHeadingText && (
            <Typography variant="body1" gutterBottom>
              {subHeadingText}
            </Typography>
          )}
          {description && (
            <Typography variant="body1" gutterBottom>
              {description}
            </Typography>
          )}
          {children}
        </div>
      </section>
    );
  }
}

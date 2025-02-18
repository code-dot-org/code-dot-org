// Use this component if a dashboard page has a header banner with no image.
// Adapted from the HeaderBanner component.

import PropTypes from 'prop-types';
import React from 'react';

import {Heading1, BodyOneText} from '@cdo/apps/componentLibrary/typography';

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
          <Heading1>{headingText}</Heading1>
          {subHeadingText && <BodyOneText>{subHeadingText}</BodyOneText>}
          {description && <BodyOneText>{description}</BodyOneText>}
          {children}
        </div>
      </section>
    );
  }
}

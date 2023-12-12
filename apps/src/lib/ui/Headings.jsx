/** @file Reusable heading components for the 2017 dashboard redesign */
import PropTypes from 'prop-types';

import React, {Component} from 'react';
import color from '../../util/color';
import fontConstants from '@cdo/apps/fontConstants';

const baseHeadingStyle = {
  display: 'block',
  ...fontConstants['main-font-semi-bold'],
  margin: '10px 0',
  color: color.dark_charcoal,
};

const headingStyleOverrides = {
  h1: {
    ...fontConstants['main-font-bold'],
    fontSize: 32,
    lineHeight: '48px',
  },
  h2: {
    ...fontConstants['main-font-regular'],
    fontSize: 24,
    lineHeight: '48px',
  },
  h3: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 16,
    lineHeight: '24px',
  },
};

// Abstract base class which can be extended to define individual headings
// Components.
class BaseHeading extends Component {
  // We expect classes that extend this to define a heading tag; specifically,
  // one which is also a key of headingStyleOverrides.
  static HeadingTag = undefined;

  static propTypes = {
    style: PropTypes.object,
  };

  render() {
    const {style, ...miscProps} = this.props;
    return (
      <this.HeadingTag
        {...miscProps}
        style={{
          ...baseHeadingStyle,
          ...headingStyleOverrides[this.HeadingTag],
          ...style,
        }}
      />
    );
  }
}

export class Heading1 extends BaseHeading {
  static HeadingTag = 'h1';
}

export class Heading2 extends BaseHeading {
  static HeadingTag = 'h2';
}

export const h3RebrandingStyleOverride = {
  fontFamily: '"Barlow Semi Condensed Semibold", sans-serif',
  fontSize: '1.75em',
  lineHeight: '1.2',
};

export class Heading3 extends BaseHeading {
  static HeadingTag = 'h3';
  static propTypes = {
    ...BaseHeading.propTypes,
    isRebranded: PropTypes.bool,
  };

  render() {
    const {isRebranded, style, ...miscProps} = this.props;
    const overrideStyle = isRebranded
      ? h3RebrandingStyleOverride
      : headingStyleOverrides[this.HeadingTag];

    return (
      <this.HeadingTag
        {...miscProps}
        style={{
          ...baseHeadingStyle,
          ...overrideStyle,
          ...style,
        }}
      />
    );
  }
}

/**
 * @file Reusable heading components for the 2017 dashboard redesign
 * @deprecated Use DSCO Typography instead
 */
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';

import color from '../util/color';

const baseHeadingStyle = {
  display: 'block',
  ...fontConstants['main-font-semi-bold'],
  margin: '10px 0',
  color: color.dark_charcoal,
};

export const h1Style = {
  ...baseHeadingStyle,
  ...fontConstants['main-font-bold'],
  fontSize: 32,
  lineHeight: '48px',
};

export class Heading1 extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    style: PropTypes.object,
  };

  render() {
    const {children, style, ...restProps} = this.props;
    return (
      <h1 {...restProps} style={{...h1Style, ...style}}>
        {children}
      </h1>
    );
  }
}

export const h2Style = {
  ...baseHeadingStyle,
  ...fontConstants['main-font-regular'],
  fontSize: 24,
  lineHeight: '48px',
};

export class Heading2 extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    style: PropTypes.object,
  };

  render() {
    const {children, style, ...restProps} = this.props;
    return (
      <h2 {...restProps} style={{...h2Style, ...style}}>
        {children}
      </h2>
    );
  }
}

export const h3Style = {
  ...baseHeadingStyle,
  ...fontConstants['main-font-semi-bold'],
  fontSize: 16,
  lineHeight: '24px',
};

export const h3RebrandingStyle = {
  ...baseHeadingStyle,
  fontFamily: '"Barlow Semi Condensed Semibold", sans-serif',
  fontSize: '1.75em',
  lineHeight: '1.2',
};

export class Heading3 extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    style: PropTypes.object,
    isRebranded: PropTypes.bool,
  };

  render() {
    const {children, isRebranded, style, ...restProps} = this.props;
    const headingStyles = {
      ...(isRebranded ? h3RebrandingStyle : h3Style),
      ...style,
    };

    return (
      <h3 {...restProps} style={headingStyles}>
        {children}
      </h3>
    );
  }
}

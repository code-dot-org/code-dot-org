/** @file Reusable heading components for the 2017 dashboard redesign */
import React, {Component, PropTypes} from 'react';
import color from '../../util/color';

const baseHeadingStyle = {
  display: 'block',
  fontFamily: '"Gotham 5r", sans-serif',
  fontWeight: 'normal',
  margin: '10px 0',
  color: color.dark_charcoal,
};

export const h1Style = {
  ...baseHeadingStyle,
  fontFamily: '"Gotham 7r", sans-serif',
  fontSize: 32,
  lineHeight: '48px',
};

export class Heading1 extends Component {
  static propTypes = {
    style: PropTypes.object,
  };
  render() {
    return <h1 {...this.props} style={{...h1Style, ...this.props.style}}/>;
  }
}

export const h2Style = {
  ...baseHeadingStyle,
  fontFamily: '"Gotham 4r", sans-serif',
  fontSize: 24,
  lineHeight: '48px',
};

export class Heading2 extends Component {
  static propTypes = {
    style: PropTypes.object,
  };
  render() {
    return <h2 {...this.props} style={{...h2Style, ...this.props.style}}/>;
  }
}

export const h3Style = {
  ...baseHeadingStyle,
  fontFamily: '"Gotham 5r", sans-serif',
  fontSize: 16,
  lineHeight: '24px',
};

export class Heading3 extends Component {
  static propTypes = {
    style: PropTypes.object,
  };
  render() {
    return <h3 {...this.props} style={{...h3Style, ...this.props.style}}/>;
  }
}

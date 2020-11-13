/**
 * A simple wrapper for the react-dom-confetti Confetti component, which
 * simulates the confetti being tossed up from behind the containing element,
 * and then falling down in front of it.
 *
 * If you don't need or want this functionality, you probably want to use the
 * Confetti component directly.
 */

import Confetti from 'react-dom-confetti';
import React from 'react';
import PropTypes from 'prop-types';

const defaultStyle = {
  position: 'relative',
  left: '50%'
};

export default class BackToFrontConfetti extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    active: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      confettiOnTop: false
    };
  }

  componentDidUpdate() {
    if (this.props.active && !this.state.confettiOnTop) {
      // We want the confetti to shoot up from behind the dialog and fall in
      // front of it. Fake it by changing the z-index from -1 to 1 after 700ms
      window.setTimeout(() => this.setState({confettiOnTop: true}), 700);
    }
  }

  render() {
    const confettiZIndex = this.state.confettiOnTop ? 1 : -1;
    const customStyle = this.props.style || {};
    return (
      <div style={{...defaultStyle, ...customStyle, zIndex: confettiZIndex}}>
        <Confetti active={this.props.active} />
      </div>
    );
  }
}

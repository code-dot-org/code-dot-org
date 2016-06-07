/** @file Component wrapping embedded Piskel editor */
// PISKEL_DEVELOPMENT_MODE is a build flag.  See Gruntfile.js for how to enable it.
/* global PISKEL_DEVELOPMENT_MODE */
import React from 'react';
import {connect} from 'react-redux';
import { METADATA_SHAPE } from '../animationMetadata';

/**
 * @const {string} domain-relative URL to Piskel index.html
 * In special environment builds, append ?debug flag to get Piskel to load its own debug mode.
 */
const PISKEL_PATH = '/blockly/js/piskel/index.html' +
    (PISKEL_DEVELOPMENT_MODE ? '?debug' : '');

/**
 * The PiskelEditor component is a wrapper for the iframe that contains the
 * embedded Piskel image editor, within the animation tab.  It handles rendering
 * (and never re-rendering!) that iframe, and sending state updates to the
 * iframe.
 */
const PiskelEditor = React.createClass({
  propTypes: {
    // Provided manually
    style: React.PropTypes.object,
    // Provided by Redux
    animations: React.PropTypes.arrayOf(React.PropTypes.shape(METADATA_SHAPE)).isRequired,
    selectedAnimation: React.PropTypes.string
  },

  componentWillReceiveProps(newProps) {
    const {animations, selectedAnimation} = newProps;
    if (newProps.selectedAnimation !== this.props.selectedAnimation) {
      this.postMessage({
        type: 'LOAD_IMAGE', // TODO (bbuchanan): Use a (shared?) constant for this.
        animation: animations.find(animation => animation.key === selectedAnimation)
      });
    }
  },

  componentShouldUpdate() {
    return false;
  },

  /**
   * Send a message to Piskel.
   * The message should be an object (much like a Redux action) that the Piskel
   * API can handle.
   * @param {object} message
   */
  postMessage(message) {
    const targetOrigin = '*';
    this.iframe.contentWindow.postMessage(message, targetOrigin);
  },

  render() {
    return <iframe
        ref={c => this.iframe = c}
        style={this.props.style}
        src={PISKEL_PATH}
    />;
  }
});
export default connect(state => ({
  selectedAnimation: state.animationTab.selectedAnimation,
  animations: state.animations
}))(PiskelEditor);

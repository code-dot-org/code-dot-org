/** @file Component wrapping embedded Piskel editor */
// PISKEL_DEVELOPMENT_MODE is a build flag.  See Gruntfile.js for how to enable it.
/* global PISKEL_DEVELOPMENT_MODE */
import React from 'react';
import {connect} from 'react-redux';
import {METADATA_SHAPE} from '../animationMetadata';
import PiskelApi from '@code-dot-org/piskel';

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
    selectedAnimation: React.PropTypes.string,
    channelId: React.PropTypes.string.isRequired
  },

  componentDidMount() {
    /** @private {AnimationKey} reference to animation that is currenly loaded
     *          in the editor. */
    this.loadedAnimation_ = null;

    this.piskel = new PiskelApi(this.iframe);
    this.piskel.onStateSaved(this.onAnimationSaved);
  },

  componentWillUnmount() {
    // TODO: Tear down PiskelApi?
  },

  componentWillReceiveProps(newProps) {
    const {animations, selectedAnimation} = newProps;
    if (selectedAnimation !== this.props.selectedAnimation) {
      var animation = animations.find(animation => animation.key === selectedAnimation);
      this.piskel.loadSpritesheet(animation.sourceUrl, animation.frameSize.x, animation.frameSize.y);
      this.loadedAnimation_ = selectedAnimation;
    }
  },

  // We are hosting an embedded application in an iframe; we should never try
  // to re-render it.
  shouldComponentUpdate() {
    return false;
  },

  onAnimationSaved(message) {
    console.log('onAnimationSaved', message);
  },

  render() {
    return (
      <iframe
        ref={iframe => this.iframe = iframe}
        style={this.props.style}
        src={PISKEL_PATH}
      />
    );
  }
});
export default connect(state => ({
  selectedAnimation: state.animationTab.selectedAnimation,
  animations: state.animations,
  channelId: state.pageConstants.channelId
}))(PiskelEditor);

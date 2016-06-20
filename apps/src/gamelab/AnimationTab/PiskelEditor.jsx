/** @file Component wrapping embedded Piskel editor */
// PISKEL_DEVELOPMENT_MODE is a build flag.  See Gruntfile.js for how to enable it.
/* global PISKEL_DEVELOPMENT_MODE */
import React from 'react';
import {connect} from 'react-redux';
import PiskelApi from '@code-dot-org/piskel';
import {editAnimation} from '../animationListModule';

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
    animationList: React.PropTypes.object.isRequired, // TODO: Shape?
    selectedAnimation: React.PropTypes.string,
    channelId: React.PropTypes.string.isRequired,
    editAnimation: React.PropTypes.func.isRequired
  },

  componentDidMount() {
    /** @private {boolean} Track whether we're mid-load so we don't fire save
     *          events during load. */
    this.isLoadingAnimation_ = false;

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
    const {animationList, selectedAnimation} = newProps;
    if (selectedAnimation !== this.props.selectedAnimation) {
      this.isLoadingAnimation_ = true;
      var animation = animationList.data[selectedAnimation];
      // TODO: Handle selecting animation where dataURI not loaded yet?
      this.piskel.loadSpritesheet(animation.dataURI, animation.frameSize.x,
          animation.frameSize.y, animation.frameRate, () => {
            this.loadedAnimation_ = selectedAnimation;
            this.isLoadingAnimation_ = false;
          });
    }
  },

  // We are hosting an embedded application in an iframe; we should never try
  // to re-render it.
  shouldComponentUpdate() {
    return false;
  },

  onAnimationSaved(message) {
    if (this.isLoadingAnimation_) {
      return;
    }
    console.log('onAnimationSaved', message);
    this.props.editAnimation(this.loadedAnimation_, {
      blob: message.blob,
      dataURI: message.dataURI,
      sourceSize: {x: message.sourceSizeX, y: message.sourceSizeY},
      frameSize: {x: message.frameSizeX, y: message.frameSizeY},
      frameCount: message.frameCount,
      frameRate: message.frameRate
    });
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
  animationList: state.animationList,
  channelId: state.pageConstants.channelId
}), dispatch => ({
  editAnimation: (key, data) => dispatch(editAnimation(key, data))
}))(PiskelEditor);

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

function convertFileToDataURLviaFileReader(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function () {
    var reader  = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.send();
}

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
      convertFileToDataURLviaFileReader(animation.sourceUrl, dataUrl => {
        this.piskel.loadSpritesheet(dataUrl, animation.frameSize.x, animation.frameSize.y);
      });
    }
  },

  componentShouldUpdate() {
    return false;
  },

  onAnimationSaved(message) {
    console.log('onAnimationSaved', message);
      // Update animation preview
      // (Maybe) autosave animation to S3 and save new animation metadata

      //// Instead of download, let's upload to S3.
      //var xhr = pskl.utils.Xhr.xhr_(
      //    '/v3/animations/' + this.channelId_ + '/' + this.loadedAnimation_.key + '.png',
      //    'PUT',
      //    function onSuccess(xhr) {
      //      // TODO: Report success?
      //      onComplete(xhr);
      //    }, function onError(error) {
      //      onComplete(error);
      //    });
      //xhr.setRequestHeader("Content-type", "image/png");
      ////xhr.send(outputCanvas.toDataURL('image/png'));
      //pskl.utils.BlobUtils.canvasToBlob(outputCanvas, function(blob) {
      //  xhr.send(blob);
      //}.bind(this));
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

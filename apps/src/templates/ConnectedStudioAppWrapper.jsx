/** @file Redux-connected version of StudioAppWrapper, used by App Lab. */
'use strict';

var connect = require('react-redux').connect;
var StudioAppWrapper = require('./StudioAppWrapper.jsx');

module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl,
    isEmbedView: state.level.isEmbedView,
    isShareView: state.level.isShareView
  };
})(StudioAppWrapper);

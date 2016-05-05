/** @file Redux-connected version of StudioAppWrapper, used by App Lab. */
'use strict';

var connect = require('react-redux').connect;
var StudioAppWrapper = require('./StudioAppWrapper');

module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
    isEmbedView: state.pageConstants.isEmbedView,
    isShareView: state.pageConstants.isShareView
  };
})(StudioAppWrapper);

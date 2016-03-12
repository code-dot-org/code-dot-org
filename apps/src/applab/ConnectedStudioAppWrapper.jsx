/** @file Redux-connected version of StudioAppWrapper, used by App Lab. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

var connect = require('react-redux').connect;
var StudioAppWrapper = require('../templates/StudioAppWrapper.jsx');

module.exports = connect(function propsFromState(state) {
  return {
    assetUrl: state.level.assetUrl,
    isEmbedView: state.level.isEmbedView,
    isShareView: state.level.isShareView
  };
})(StudioAppWrapper);

/** @file Redux action-creators for Game Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

var _ = require('../lodash');
var animationsApi = require('../clientApi').animations;
var utils = require('../utils');

/** @enum {string} */
var ActionType = module.exports.ActionType = utils.makeEnum(
  'ADD_ANIMATION_AT',
  'DELETE_ANIMATION',
  'SET_ANIMATION_NAME',
  'SET_INITIAL_ANIMATION_METADATA',
  'SET_INITIAL_LEVEL_PROPS',
  'CHANGE_INTERFACE_MODE'
);

/**
 * Change the interface mode between Code Mode and the Animation Tab
 * @param {!GameLabInterfaceMode} interfaceMode
 * @returns {function}
 */
module.exports.changeInterfaceMode = function (interfaceMode) {
  return function (dispatch) {
    $(window).trigger('appModeChanged');
    dispatch({
      type: ActionType.CHANGE_INTERFACE_MODE,
          interfaceMode: interfaceMode
    });
  };
};

/**
 * Push lots of view properties of the level into the store.
 * Should be called during level init.
 * Any properties omitted from the props argument are not set in the state.
 *
 * @param {!Object} props
 * @param {function} [props.assetUrl] - Helper function for retrieving
 *        assets for this particular level type.
 * @param {boolean} [props.isEmbedView] - Whether the level is being embedded
 *        in an iFrame.
 * @param {boolean} [props.isShareView] - Whether we are displaying the level
 *        on a share page.
 *
 * @returns {{type: ActionType, props: Object}}
 */
module.exports.setInitialLevelProps = function (props) {
  return {
    type: ActionType.SET_INITIAL_LEVEL_PROPS,
    props: props
  };
};

/**
 * Push full animation metadata into the store, usually on first load
 * from the sources API.
 * 
 * @param {Object} metadata
 * @returns {{type: ActionType, metadata: Object}}
 */
module.exports.setInitialAnimationMetadata = function (metadata) {
  return {
    type: ActionType.SET_INITIAL_ANIMATION_METADATA,
    metadata: metadata
  }
};

module.exports.addAnimation = function (animationProps) {
  // TODO: Validate animationProps?
  return function(dispatch, getState) {
    dispatch({
      type: ActionType.ADD_ANIMATION_AT,
      index: getState().animations.length,
      animationProps: animationProps
    });
  }
};

module.exports.cloneAnimation = function (animationKey) {
  return function(dispatch, getState) {
    var animations = getState().animations;
    
    // Track down the source animation and its index in the collection
    var sourceIndex = animations.map(function (a) { return a.key; }).indexOf(animationKey);
    if (sourceIndex < 0) {
      throw new Error('Unable to clone animation with key "' + animationKey +
          '": Animation not found');
    }
    var sourceAnimation = animations[sourceIndex];
    var newAnimationKey = utils.createUuid();

    animationsApi.ajax(
        'PUT',
        newAnimationKey + '.png?src=' + animationKey + '.png',
        function success(xhr) {
          var response = JSON.parse(xhr.responseText);
          console.info(response);
          dispatch({
            type: ActionType.ADD_ANIMATION_AT,
            index: sourceIndex + 1,
            animationProps: _.assign({}, sourceAnimation, {
              key: newAnimationKey,
              name: sourceAnimation.name + '_copy', // TODO: better generated names
              version: response.versionId
            })
          });
        },
        function error(xhr) {
          console.error('Error copying object ' + animationKey + ': ' +
              xhr.status + ' ' + xhr.statusText);
          // TODO: Error state for cloning animation.
        });
  };
};

/**
 * Delete the specified animation from the project.
 * @param {string} animationKey
 * @returns {function}
 */
module.exports.deleteAnimation = function (animationKey) {
  return function (dispatch) {
    animationsApi.ajax(
        'DELETE',
        animationKey + '.png',
        function success() {
          dispatch({
            type: ActionType.DELETE_ANIMATION,
            animationKey: animationKey
          });
        },
        function error(xhr) {
          console.error('Error deleting object ' + animationKey + ': ' +
              xhr.status + ' ' + xhr.statusText);
          // TODO: Error state for cloning animation.
        });
  };
};

/**
 * Set the display name of the specified animation.
 * @param {string} animationKey
 * @param {string} name
 * @returns {{type: ActionType, animationKey: string, name: string}}
 */
module.exports.setAnimationName = function (animationKey, name) {
  return {
    type: ActionType.SET_ANIMATION_NAME,
    animationKey: animationKey,
    name: name
  };
};

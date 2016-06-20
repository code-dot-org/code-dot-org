var _ = require('lodash');
var utils = require('../utils');

var SET_PAGE_CONSTANTS = 'pageConstants/SET_PAGE_CONSTANTS';

var ALLOWED_KEYS = utils.makeEnum(
  'assetUrl',
  'channelId',
  'isDesignModeHidden',
  'isEmbedView',
  'isIframeEmbed',
  'isReadOnlyWorkspace',
  'isShareView',
  'isProjectLevel',
  'isSubmittable',
  'isSubmitted',
  'isViewDataButtonHidden',
  'instructionsInTopPane',
  'puzzleNumber',
  'stageTotal',
  'showDebugButtons',
  'showDebugConsole',
  'showDebugWatch',
  'localeDirection',
  'isDroplet',
  'isMinecraft',
  'visualizationHasPadding',
  'hideSource',
  'hideRunButton',
  'playspacePhoneFrame',
  'noVisualization',
  'pinWorkspaceToBottom',
  'smallStaticAvatar',
  'aniGifURL',
  'inputOutputTable'
);

const initialState = {
  assertUrl() {
  }
};

export default function reducer(state = initialState, action) {
  if (action.type === SET_PAGE_CONSTANTS) {
    Object.keys(action.props).forEach(function (key) {
      if (ALLOWED_KEYS[key] === undefined) {
        throw new Error(`Property "${key}" may not be set using the ${action.type} action.`);
      }
      if (state[key] !== initialState[key] && state[key] !== action.props[key]) {
        throw new Error(`Can't change value of key "${key}".`);
      }
    });
    return _.assign({}, state, action.props);
  }

  return state;
}

/**
 * Push lots of page constants into the store.
 * Should be called during level init. Expectation is that these properties
 * never change once set.
 * Any properties omitted from the props argument are not set in the state.
 *
 * @param {!Object} props
 * @param {function} [props.assetUrl] - Helper function for retrieving
 *        assets for this particular level type.
 * @param {boolean} [props.isDesignModeHidden] - Whether the level restricts
 *        use of design mode.
 * @param {boolean} [props.isEmbedView] - Whether the level is being embedded
 *        in an iFrame.
 * @param {boolean} [props.isReadOnlyWorkspace] - Whether the loaded level
 *        should restrict editing the student code.
 * @param {boolean} [props.isShareView] - Whether we are displaying the level
 *        on a share page.
 * @param {boolean} [props.isViewDataButtonHidden] - Whether to hide the view
 *        data button from the playspace header.
 * ...
 * @returns {{type: ActionType, props: Object}}
 */
export function setPageConstants(props) {
  return {
    type: SET_PAGE_CONSTANTS,
    props: props
  };
}

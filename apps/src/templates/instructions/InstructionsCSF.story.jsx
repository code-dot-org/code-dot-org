import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {
  setFeedback,
  setHasAuthoredHints,
  setInstructionsConstants
} from '@cdo/apps/redux/instructions';
import {enqueueHints, showNextHint} from '@cdo/apps/redux/authoredHints';
import isRtl, {setRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import InstructionsCSF from './InstructionsCSF';

/**
 * Initialize a Redux store for displaying instructions, including all required
 * reducers. Can optionally initialize the store to include a variety of
 * optional Top Instructions features, based on the options argument
 *
 * @param {Object} options
 * @param {boolean} options.avatar
 * @param {boolean} options.failureAvatar
 * @param {boolean} options.feedback
 * @param {boolean} options.hints
 * @param {boolean} options.longInstructions
 * @param {boolean} options.rtl
 * @param {boolean} options.subInstructions
 * @param {boolean} options.tts
 */
const createCommonStore = function(options = {}) {
  const store = createStore(combineReducers({...commonReducers, isRtl}));
  const pageConstants = {};
  const instructionsConstants = {};

  // Set required values
  pageConstants.showNextHint = () => {};
  if (!options.disableShortInstructions) {
    instructionsConstants.shortInstructions =
      'some short, plaintext instructions, used to quickly communicate the goals of the level without taking up too much vertical real estate';
  }

  // Set conditional values
  if (options.longInstructions) {
    instructionsConstants.longInstructions =
      'some *markdown enabled* instructions; can take advantage of\n- various\n- markdown\n- rendering options\n\nto provide more in-depth (and vertically more intrusive) instruction';
  }

  document.head.parentElement.dir = options.rtl ? 'rtl' : 'ltr';
  store.dispatch(setRtlFromDOM());

  if (options.hints) {
    store.dispatch(setHasAuthoredHints(true));
    store.dispatch(
      enqueueHints(
        [
          {
            hintId: 'first',
            markdown:
              'this is the first hint. It has **some** _simple_ formatting'
          },
          {
            hintId: 'second',
            markdown:
              'This is the second hint. It has an image.\n\n![](https://images.code.org/cab43107265a683a6216e18faab2353f-image-1452027548372.png)'
          },
          {
            hintId: 'third',
            markdown: 'This is the third hint. It has a Blockly block',
            block: (
              <xml>
                <block type="maze_moveForward" />
              </xml>
            )
          }
        ],
        []
      )
    );

    pageConstants.showNextHint = () => {
      store.dispatch(showNextHint());
    };

    // hints require an avatar to display correctly
    options.avatar = true;
  }

  if (options.avatar) {
    pageConstants.smallStaticAvatar =
      '/blockly/media/skins/bee/small_static_avatar.png';
  }

  if (options.failureAvatar) {
    pageConstants.failureAvatar = '/blockly/media/skins/bee/failure_avatar.png';
  }

  if (options.feedback) {
    store.dispatch(
      setFeedback({
        message:
          'some simple, plaintext feedback, used to indicate that something went wrong'
      })
    );
  }

  if (options.subInstructions) {
    instructionsConstants.shortInstructions =
      '"For some externally-themed skins like Star Wars, the only text that can appear in instructions is text that has been approved to be \'spoken\' by the avatar character"';
    instructionsConstants.shortInstructions2 =
      "And then this will appear below. Used to convey information that should not be perceived as being 'spoken' by the avatar character.";
  }

  store.dispatch(setPageConstants(pageConstants));
  store.dispatch(setInstructionsConstants(instructionsConstants));

  return store;
};

const STORIES = {
  'Minimal Example': {},
  'Right-to-Left': {
    rtl: true
  },
  'Markdown instructions': {
    longInstructions: true
  },
  'Only long instructions, no short': {
    longInstructions: true,
    disableShortInstructions: true
  },
  Avatar: {
    avatar: true
  },
  Feedback: {
    feedback: true
  },
  'Feedback with failure avatar': {
    avatar: true,
    failureAvatar: true,
    feedback: true
  },
  Hints: {
    hints: true
  },
  'Sub-Instructions': {
    subInstructions: true
  },
  'Full-featured example': {
    avatar: true,
    failureAvatar: true,
    feedback: true,
    hints: true,
    longInstructions: true
  },
  'Full-featured Right-to-Left example': {
    avatar: true,
    failureAvatar: true,
    feedback: true,
    hints: true,
    longInstructions: true,
    rtl: true
  }
};

export default storybook => {
  const stories = storybook.storiesOf('InstructionsCSF', module);

  Object.entries(STORIES).forEach(([name, options]) => {
    stories.add(name, () => {
      const store = createCommonStore(options);
      return (
        <Provider store={store}>
          <InstructionsCSF
            handleClickCollapser={() => {}}
            adjustMaxNeededHeight={() => {}}
          />
        </Provider>
      );
    });
  });

  return stories;
};

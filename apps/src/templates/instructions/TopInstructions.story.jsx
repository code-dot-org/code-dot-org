import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {
  setHasAuthoredHints,
  setInstructionsConstants
} from '@cdo/apps/redux/instructions';
import {enqueueHints, showNextHint} from '@cdo/apps/redux/authoredHints';
import isRtl, {setRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import sectionData, {
  setTtsAutoplayEnabled
} from '@cdo/apps/redux/sectionDataRedux';
import TopInstructions from './TopInstructions';

/**
 * Initialize a Redux store for displaying instructions, including all required
 * reducers. Can optionally initialize the store to include a variety of
 * optional Top Instructions features, based on the options argument
 *
 * @param {Object} options
 * @param {boolean} options.rtl
 * @param {boolean} options.tts
 */
const createCommonStore = function(options = {}) {
  const store = createStore(
    combineReducers({...commonReducers, isRtl, sectionData})
  );
  const pageConstants = {};
  const instructionsConstants = {};

  // Things that apply to all courses
  instructionsConstants.longInstructions =
    'some *markdown enabled* instructions; can take advantage of\n- various\n- markdown\n- rendering options\n\nto provide more in-depth (and vertically more intrusive) instruction';

  document.head.parentElement.dir = options.rtl ? 'rtl' : 'ltr';
  store.dispatch(setRtlFromDOM());

  pageConstants.textToSpeechEnabled = true;
  pageConstants.locale = 'en_us';
  // Embed levels just show the instructions area at full height - should be tested elsewhere
  pageConstants.isEmbedView = false;
  pageConstants.noVisualization = false;
  pageConstants.isShareView = false;

  // Grab some arbitrary preexisting audio files for this test; they will not
  // match the displayed text for this test, but that doesn't seem necessary
  // enough to justify generating custom audio just for this storybook
  pageConstants.ttsLongInstructionsUrl =
    'https://tts.code.org/sharon22k/180/100/e91c9a88c669b0aeba648353cc478452/courseC_maze_programming9.mp3';

  if (options.isCSF) {
    instructionsConstants.shortInstructions =
      'some short, plaintext instructions, used to quickly communicate the goals of the level without taking up too much vertical real estate';
    pageConstants.ttsShortInstructionsUrl =
      'https://tts.code.org/sharon22k/180/100/045539bb7fc9812eec4024867ac56d61/courseC_maze_programming8.mp3';

    pageConstants.showNextHint = () => {};
    instructionsConstants.noInstructionsWhenCollapsed = false;
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

    pageConstants.smallStaticAvatar =
      '/blockly/media/skins/bee/small_static_avatar.png';

    pageConstants.failureAvatar = '/blockly/media/skins/bee/failure_avatar.png';
  } else {
    instructionsConstants.noInstructionsWhenCollapsed = true;
    pageConstants.documentationUrl = 'https://studio.code.org/docs/weblab/';
    instructionsConstants.mapReference = '/docs/csd-1718/html_tags/index.html';
    instructionsConstants.levelVideos = [
      {
        autoplay: true,
        download:
          'https://videos.code.org/levelbuilder/weblab_introtohtml-mp4.mp4',
        enable_fallback: true,
        key: 'csd_weblab_intro_2',
        name: 'Intro to Web Lab - Part 2',
        src:
          'https://www.youtube-nocookie.com/embed/Hjl6gbg9kmk/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=Hjl6gbg9kmk&wmode=transparent',
        thumbnail: '/c/video_thumbnails/csd_weblab_intro_2.jpg'
      }
    ];
  }

  store.dispatch(setPageConstants(pageConstants));
  store.dispatch(setInstructionsConstants(instructionsConstants));
  store.dispatch(setTtsAutoplayEnabled(false));

  return store;
};

const STORIES = {
  'CSF Instructions': {
    isCSF: true
  },
  'CSF Instructions Right-to-Left': {
    rtl: true,
    isCSF: true
  },
  'CSD/CSP Instructions': {
    isCSF: false
  },
  'CSD/CSP Instructions Right-to-Left': {
    rtl: true,
    isCSF: false
  }
};

export default storybook => {
  const stories = storybook.storiesOf('TopInstructions', module);

  Object.entries(STORIES).forEach(([name, options]) => {
    stories.add(name, () => {
      const store = createCommonStore(options);
      return (
        <Provider store={store}>
          <TopInstructions />
        </Provider>
      );
    });
  });

  return stories;
};

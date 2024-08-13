import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {BlockTypes} from '../blockly/blockTypes';
import {Triggers} from '../constants';
import {MusicState} from '../redux/musicRedux';

import moduleStyles from './callouts.module.scss';

const arrowImage = require(`@cdo/static/music/music-callout-arrow.png`);

const availableCallouts: {
  [key: string]: {openToolboxCategory?: number; selector: string};
} = {
  'play-sound-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-notes-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-drums-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-tune-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-sounds-together-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_SOUNDS_TOGETHER}"]`,
  },
  'repeat-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.REPEAT_SIMPLE2}"]`,
  },
  'play-sound-block-workspace': {
    selector: `g[data-id="${BlockTypes.WHEN_RUN_SIMPLE2}"] g[data-id="${BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-sounds-together-block-workspace': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.PLAY_SOUNDS_TOGETHER}"] path`,
  },
  'trigger-block-workspace': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.TRIGGERED_AT_SIMPLE2}"]`,
  },
  'repeat-block-field-workspace': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.REPEAT_SIMPLE2}"] > .blocklyEditableText`,
  },
  'when-run-block': {
    selector: `g[data-id="${BlockTypes.WHEN_RUN_SIMPLE2}"] > path`,
  },
  'run-button': {selector: '#run-button'},
  'trigger-button-1': {selector: `#${Triggers[0].id}`},
  'toolbox-first-row': {selector: '.blocklyTreeRow'},
  'toolbox-second-block': {
    openToolboxCategory: 0,
    selector:
      '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable:nth-of-type(3)',
  },
};

/**
 * Renders one of several pre-defined callouts.
 *
 * TODO: This component is a good candidate to be made available
 * for all Lab2 labs.
 */
const Callouts: React.FunctionComponent = () => {
  const callout = useSelector(
    (state: {music: MusicState}) => state.music.currentCallout
  );

  const availableCallout = callout.id
    ? availableCallouts[callout.id]
    : undefined;

  const calloutIndex = callout.index;

  useEffect(() => {
    const toolbox = Blockly.getMainWorkspace()?.getToolbox();
    if (availableCallout?.openToolboxCategory !== undefined) {
      // Open toolbox category if a position is specified.
      // This actually toggles whether a toolbox category is selected.  Ideally, we would only call
      // this if the correct category isn't yet selected, but IToolbox doesn't expose the necessary
      // functionality.
      toolbox?.selectItemByPosition(availableCallout.openToolboxCategory);
    } else {
      toolbox?.clearSelection();
    }
  }, [availableCallout, calloutIndex]);

  if (!availableCallout) {
    return null;
  }

  const element = document.querySelector(availableCallout.selector);
  if (!element) {
    return null;
  }

  const elementRect = element.getBoundingClientRect();
  const elementWidth = elementRect.right - elementRect.left + 1;
  const elementLeft = elementRect.left + elementWidth / 2;
  const elementTop = elementRect.bottom + 4;

  if (elementRect.width === 0) {
    return null;
  }

  return (
    <div
      id="callout"
      key={callout.index}
      style={{left: elementLeft, top: elementTop}}
      className={moduleStyles.callout}
    >
      <div id="callout-arrow" className={moduleStyles.arrow}>
        <img src={arrowImage} alt="" />
      </div>
    </div>
  );
};

export default Callouts;

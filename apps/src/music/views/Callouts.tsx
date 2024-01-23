import React from 'react';
import {useSelector} from 'react-redux';
import {MusicState} from '../redux/musicRedux';
import moduleStyles from './callouts.module.scss';
import {BlockTypes} from '../blockly/blockTypes';
const FontAwesome = require('../../templates/FontAwesome');

const availableCallouts: {
  [key: string]: {selector: string};
} = {
  'play-sound-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2}"]`,
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
  'when-run-block': {
    selector: `g[data-id="${BlockTypes.WHEN_RUN_SIMPLE2}"] > path`,
  },
  'run-button': {selector: '#run-button'},
  'trigger-button-1': {selector: '#trigger-button-1'},
  'toolbox-first-row': {selector: '.blocklyTreeRow'},
  'toolbox-second-block': {
    selector: '.blocklyFlyout .blocklyDraggable:nth-of-type(3)',
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

  if (!callout.id) {
    return null;
  }

  const availableCallout = availableCallouts[callout.id];
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

  return (
    <div
      id="callout"
      key={callout.index}
      style={{left: elementLeft, top: elementTop}}
      className={moduleStyles.callout}
    >
      <div id="callout-arrow" className={moduleStyles.arrow}>
        <FontAwesome icon={'arrow-up'} />
      </div>
    </div>
  );
};

export default Callouts;

import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {BlockTypes} from '../blockly/blockTypes';
import {Triggers} from '../constants';
import {MusicState} from '../redux/musicRedux';

import moduleStyles from './callouts.module.scss';

const arrowImage = require(`@cdo/static/music/music-callout-arrow.png`);

interface AvailableCallout {
  openToolboxCategory?: number;
  selector: string;
}

interface AvailableCallouts {
  [key: string]: AvailableCallout;
}

const availableCallouts: AvailableCallouts = {
  'play-sound-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-notes-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-drums-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2}"]`,
  },
  'play-drums-ai-block': {
    selector: `.blocklyFlyout g[data-id="${BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2}"]`,
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
  'play-drums-ai-block-workspace': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2}"]`,
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
  'flyout-first-block': {
    selector:
      '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable:nth-of-type(1)',
  },
  'toolbox-second-block': {
    openToolboxCategory: 0,
    selector:
      '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable:nth-of-type(3)',
  },
};

interface Target {
  left: number;
  top: number;
}

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

  const [isMoving, setIsMoving] = useState(false);

  const calloutIds = callout?.id?.split('---');

  const validCallouts: AvailableCallout[] | undefined = calloutIds?.map(
    calloutId => availableCallouts[calloutId]
  );

  const targets: Target[] = [];

  validCallouts?.forEach(validCallout => {
    const element = document.querySelector(validCallout.selector);
    const elementRect = element?.getBoundingClientRect();
    if (elementRect && elementRect.width > 0) {
      const elementWidth = elementRect.right - elementRect.left + 1;
      const target: Target = {
        left: elementRect.left + elementWidth / 2,
        top: elementRect.bottom + 4,
      };
      targets.push(target);
    }
  });

  const openToolboxCategory =
    validCallouts && validCallouts[0].openToolboxCategory;

  const calloutIndex = callout.index;

  useEffect(() => {
    const toolbox = Blockly.getMainWorkspace()?.getToolbox();
    if (openToolboxCategory !== undefined) {
      // Open toolbox category if a position is specified.
      // This actually toggles whether a toolbox category is selected.  Ideally, we would only call
      // this if the correct category isn't yet selected, but IToolbox doesn't expose the necessary
      // functionality.
      toolbox?.selectItemByPosition(openToolboxCategory);
    } else {
      toolbox?.clearSelection();
    }

    // For a moving callout, ensure we render in the initial position first,
    // and then render in the destination position a bit later.  This way,
    // the browser will animate the movement between the two positions.
    setIsMoving(false);
    setTimeout(() => {
      setIsMoving(true);
    }, 0);
  }, [openToolboxCategory, calloutIndex]);

  if (targets.length === 1) {
    return (
      <div
        id="callout"
        key={callout.index}
        style={{left: targets[0].left, top: targets[0].top}}
        className={moduleStyles.callout}
      >
        <div id="callout-arrow" className={moduleStyles.arrow}>
          <img src={arrowImage} alt="" />
        </div>
      </div>
    );
  } else if (targets.length === 2) {
    return (
      <div
        id="moving-callout"
        key={callout.index}
        style={{
          left: isMoving ? targets[1].left : targets[0].left,
          top: isMoving ? targets[1].top : targets[0].top,
          transitionDuration: isMoving ? '3s' : '0s',
        }}
        className={moduleStyles.movingCallout}
      >
        <div id="moving-callout-arrow" className={moduleStyles.arrow}>
          <img src={arrowImage} alt="" />
        </div>
      </div>
    );
  } else {
    return <div />;
  }
};

export default Callouts;

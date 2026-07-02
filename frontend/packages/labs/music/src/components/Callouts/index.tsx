import * as Blockly from 'blockly/core';
import classNames from 'classnames';
import {useEffect, useState} from 'react';

import {BlockTypes} from '../../blockly/blockTypes';
import {Triggers} from '../../constants';
import {useAppSelector} from '../../redux/store';

import arrowImage from '../../assets/music-callout-arrow-outline.png';

import moduleStyles from './callouts.module.scss';

type DirectionString = 'up' | 'left' | 'up-inside' | 'up-left';

interface AvailableCallout {
  selector?: string;
  openToolboxCategory?: number;
  direction?: DirectionString;
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
    direction: 'left',
  },
  'play-sounds-together-block-workspace-up-inside': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.PLAY_SOUNDS_TOGETHER}"] path`,
    direction: 'up-inside',
  },
  'play-sounds-together-block-2-workspace': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.PLAY_SOUNDS_TOGETHER}_2"] path`,
    direction: 'left',
  },
  'trigger-block-workspace': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.TRIGGERED_AT_SIMPLE2}"]`,
  },
  'repeat-block-field-workspace': {
    selector: `.blocklyWorkspace g[data-id="${BlockTypes.REPEAT_SIMPLE2}"] > .blocklyEditableField`,
  },
  'when-run-block': {
    selector: `g[data-id="${BlockTypes.WHEN_RUN_SIMPLE2}"] > path`,
  },
  'run-button': {selector: '#run-button'},
  'trigger-button-1': {selector: `#${Triggers[0].id}`},
  'trigger-button-2': {selector: `#${Triggers[1].id}`},
  'trigger-button-3': {selector: `#${Triggers[2].id}`},
  'trigger-button-4': {selector: `#${Triggers[3].id}`},
  'start-over-button': {selector: '#start-over-button'},
  'documentation-button': {selector: '#documentation-button'},
  'toolbox-first-row': {selector: '.blocklyTreeRow'},
  'flyout-first-block': {
    selector: '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable',
  },
  'flyout-second-block': {
    selector:
      '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable ~ .blocklyDraggable',
  },
  'toolbox-second-block': {
    selector:
      '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable ~ .blocklyDraggable',
    openToolboxCategory: 0,
  },
  'flyout-third-block': {
    selector:
      '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable ~ .blocklyDraggable ~ .blocklyDraggable',
  },
  'flyout-fourth-block': {
    selector:
      '.blocklyFlyout:not([style*="display: none;"]) .blocklyDraggable ~ .blocklyDraggable ~ .blocklyDraggable ~ .blocklyDraggable',
  },
};

interface Target {
  left: number;
  top: number;
}

/**
 * Renders one of several pre-defined callouts, positioned over a target element
 * in the UI. Triggered by clicking instruction text (which dispatches
 * `showCallout`). A single target shows a bouncing arrow; two targets animate a
 * "moving" arrow between them to demonstrate a drag gesture.
 *
 * TODO: This component is a good candidate to be made available for all Lab2
 * labs (ported from the legacy `apps/src/music/views/Callouts.tsx`).
 */
const Callouts = () => {
  const callout = useAppSelector(state => state.music.currentCallout);

  const [isMoving, setIsMoving] = useState(false);
  // Reset to the start position whenever a new callout is shown (render-phase
  // adjustment; the effect below then animates toward the destination). Keying
  // off the callout index avoids a setState-in-effect for the reset.
  const [shownIndex, setShownIndex] = useState(callout.index);
  if (callout.index !== shownIndex) {
    setShownIndex(callout.index);
    setIsMoving(false);
  }

  const calloutIds = callout?.id?.split('---');

  const validCallouts: AvailableCallout[] = [];

  calloutIds?.forEach(calloutId => {
    const splitId = calloutId.split(':');
    if (splitId.length === 2) {
      const dataId = splitId[1];
      if (splitId[0] === 'flyout-id') {
        validCallouts.push({
          selector: `.blocklyFlyout g[data-id="${dataId}"] path`,
          direction: 'left',
        });
      } else {
        validCallouts.push({
          selector: `.blocklyWorkspace g[data-id="${dataId}"] path`,
          direction:
            splitId[0] === 'id-left'
              ? 'left'
              : splitId[0] === 'id-up-inside'
                ? 'up-inside'
                : splitId[0] === 'id-up-left'
                  ? 'up-left'
                  : 'up',
        });
      }
    } else if (availableCallouts[calloutId]) {
      validCallouts.push({
        selector: availableCallouts[calloutId].selector,
        direction: availableCallouts[calloutId].direction,
        openToolboxCategory: availableCallouts[calloutId].openToolboxCategory,
      });
    }
  });

  const targets: Target[] = [];
  let calloutClassName;

  validCallouts.forEach(validCallout => {
    const element = validCallout.selector
      ? document.querySelector(validCallout.selector)
      : null;
    const elementRect = element?.getBoundingClientRect();
    if (elementRect && elementRect.width > 0) {
      let target: Target;
      if (validCallout.direction === 'left') {
        const elementHeight = elementRect.bottom - elementRect.top + 1;
        target = {
          left: elementRect.right + 4,
          top: elementRect.top + elementHeight / 2,
        };
        calloutClassName = moduleStyles.calloutLeft;
      } else if (validCallout.direction === 'up-inside') {
        target = {
          left: elementRect.left + 45,
          top: elementRect.top + 37,
        };
        calloutClassName = moduleStyles.calloutUp;
      } else if (validCallout.direction === 'up-left') {
        target = {
          left: elementRect.right + 16,
          top: elementRect.bottom,
        };
        calloutClassName = moduleStyles.calloutUpLeft;
      } else {
        const elementWidth = elementRect.right - elementRect.left + 1;
        target = {
          left: elementRect.left + elementWidth / 2,
          top: elementRect.bottom + 4,
        };
        calloutClassName = moduleStyles.calloutUp;
      }
      targets.push(target);
    }
  });

  const openToolboxCategory =
    validCallouts && validCallouts[0]?.openToolboxCategory;

  const calloutIndex = callout.index;

  useEffect(() => {
    const toolbox = (
      Blockly.getMainWorkspace() as Blockly.WorkspaceSvg | null
    )?.getToolbox();
    if (openToolboxCategory !== undefined) {
      // Open toolbox category if a position is specified. This actually toggles
      // whether a toolbox category is selected. Ideally we would only call this
      // if the correct category isn't yet selected, but IToolbox doesn't expose
      // the necessary functionality.
      toolbox?.selectItemByPosition(openToolboxCategory);
    } else {
      toolbox?.clearSelection();
    }

    // For a moving callout we render at the initial position first (reset in
    // render phase above), then move to the destination a tick later so the
    // browser animates between the two positions.
    const timer = setTimeout(() => {
      setIsMoving(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [openToolboxCategory, calloutIndex]);

  if (targets.length === 1) {
    return (
      <div
        id="callout"
        key={callout.index}
        style={{left: targets[0].left, top: targets[0].top}}
        className={classNames(moduleStyles.callout, calloutClassName)}
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

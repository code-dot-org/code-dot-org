import React from 'react';
import {useSelector} from 'react-redux';
import {MusicState} from '../redux/musicRedux';
import moduleStyles from './callouts.module.scss';
const FontAwesome = require('../../templates/FontAwesome');

const availableCallouts: {
  [key: string]: {selector: string; arrowAngle: number};
} = {
  'play-sound-block': {
    selector: ".blocklyFlyout g[data-id='play-sound-block']",
    arrowAngle: 0,
  },
  'when-run-block': {
    selector: "g[data-id='when-run-block'] > path",
    arrowAngle: 0,
  },
  'run-button': {selector: '#run-button', arrowAngle: 180},
};

/**
 * Renders one of several pre-defined callouts.
 */
const Callouts: React.FunctionComponent = () => {
  const callout = useSelector(
    (state: {music: MusicState}) => state.music.showCallout
  );

  if (callout.id) {
    const availableCallout = availableCallouts[callout.id];
    const element = document.querySelector(availableCallout.selector);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const elementWidth = elementRect.right - elementRect.left + 1;
      const elementLeft = elementRect.left + elementWidth / 2;
      const elementTop = elementRect.bottom + 4;
      return (
        <div
          id="callout"
          key={callout.id + '-' + callout.index}
          style={{left: elementLeft, top: elementTop}}
          className={moduleStyles.callout}
        >
          <div id="callout-arrow" className={moduleStyles.arrow}>
            <FontAwesome icon={'arrow-up'} />
          </div>
        </div>
      );
    }
  }

  return null;
};

export default Callouts;

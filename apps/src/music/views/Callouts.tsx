import React from 'react';
import {useSelector} from 'react-redux';
import {MusicState} from '../redux/musicRedux';
import moduleStyles from './callouts.module.scss';
const FontAwesome = require('../../templates/FontAwesome');

const availableCallouts: {
  [key: string]: {selector: string};
} = {
  'play-sound-block': {
    selector: ".blocklyFlyout g[data-id='play-sound-block']",
  },
  'when-run-block': {
    selector: "g[data-id='when-run-block'] > path",
  },
  'run-button': {selector: '#run-button'},
};

/**
 * Renders one of several pre-defined callouts.
 *
 * TODO: This system is a good candidate to be made available
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

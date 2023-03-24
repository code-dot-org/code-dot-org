import React, {useContext, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {Triggers} from '../constants';
import {AnalyticsContext} from '../context';
import {
  advanceInstructionsPosition,
  toggleBeatPad,
  toggleInstructions,
  toggleTimelinePosition
} from '../redux/musicRedux';

interface KeyHandlerProps {
  togglePlaying: () => void;
  playTrigger: (triggerId: string) => void;
}

/**
 * Utility component for handling key presses in Music Lab that map to
 * specific UI actions.
 */
const KeyHandler: React.FunctionComponent<KeyHandlerProps> = ({
  togglePlaying,
  playTrigger
}) => {
  const analyticsReporter = useContext(AnalyticsContext);
  const dispatch = useDispatch();

  const handleKeyUp = (event: KeyboardEvent) => {
    // Don't handle a keyboard shortcut if the active element is an
    // input field, since the user is probably trying to type something.
    if (
      document.activeElement &&
      document.activeElement.tagName.toLowerCase() === 'input'
    ) {
      return;
    }

    // When assigning new keyboard shortcuts, be aware that the following
    // keys are used for Blockly keyboard navigation: A, D, I, S, T, W, X
    // https://developers.google.com/blockly/guides/configure/web/keyboard-nav
    // Also avoid C and V that may be used in copy/paste shortcuts.
    if (event.key === 'u') {
      reportKeyPress('toggle-timeline-position');
      dispatch(toggleTimelinePosition());
    }
    if (event.key === 'j') {
      reportKeyPress('toggle-instructions');
      dispatch(toggleInstructions());
    }
    if (event.key === 'n') {
      reportKeyPress('advance-instructions-position');
      dispatch(advanceInstructionsPosition());
    }
    if (event.key === 'b') {
      reportKeyPress('toggle-beat-pad');
      dispatch(toggleBeatPad());
    }
    Triggers.map(trigger => {
      if (event.key === trigger.keyboardKey) {
        playTrigger(trigger.id);
      }
    });
    if (event.code === 'Space') {
      togglePlaying();
    }
  };

  const reportKeyPress = (eventName: string, properties?: object) => {
    if (analyticsReporter === null) {
      return;
    }

    analyticsReporter.onKeyPressed(eventName, properties);
  };

  useEffect(() => {
    document.body.addEventListener('keyup', handleKeyUp);
  }, []);

  return null;
};

export default KeyHandler;

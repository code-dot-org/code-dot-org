import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  shiftInstructionsPosition,
  toggleBeatPad,
  toggleInstructions,
  toggleTimelinePosition
} from './musiclabRedux';
import {Triggers} from './constants';

const KeyHandler = ({
  playTrigger,
  togglePlaying,
  // populated by Redux
  toggleTimelinePosition,
  toggleInstructions,
  shiftInstructionsPosition,
  toggleBeatPad
}) => {
  const handleKeyUp = event => {
    // Don't handle a keyboard shortcut if the active element is an
    // input field, since the user is probably trying to type something.
    if (document.activeElement.tagName.toLowerCase() === 'input') {
      return;
    }

    if (event.key === 't') {
      toggleTimelinePosition();
    }
    if (event.key === 'i') {
      toggleInstructions();
    }
    if (event.key === 'n') {
      shiftInstructionsPosition();
    }
    if (event.key === 'b') {
      toggleBeatPad();
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

  useEffect(() => {
    document.body.addEventListener('keyup', handleKeyUp);
  }, []);

  return null;
};

KeyHandler.propTypes = {
  playTrigger: PropTypes.func.isRequired,
  togglePlaying: PropTypes.func.isRequired,
  toggleTimelinePosition: PropTypes.func.isRequired,
  toggleInstructions: PropTypes.func.isRequired,
  shiftInstructionsPosition: PropTypes.func.isRequired,
  toggleBeatPad: PropTypes.func.isRequired
};

export default connect(
  state => ({}),
  dispatch => ({
    toggleTimelinePosition: () => dispatch(toggleTimelinePosition()),
    toggleInstructions: () => dispatch(toggleInstructions()),
    shiftInstructionsPosition: () => dispatch(shiftInstructionsPosition()),
    toggleBeatPad: () => dispatch(toggleBeatPad())
  })
)(KeyHandler);

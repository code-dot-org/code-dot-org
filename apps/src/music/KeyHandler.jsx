import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import {
  shiftInstructionsPosition,
  toggleBeatPad,
  toggleInstructions,
  toggleTimelinePosition
} from './musiclabRedux';
import {Triggers} from './constants';

const KeyHandler = ({playTrigger, setPlaying}) => {
  const dispatch = useDispatch();

  const handleKeyUp = event => {
    // Don't handle a keyboard shortcut if the active element is an
    // input field, since the user is probably trying to type something.
    if (document.activeElement.tagName.toLowerCase() === 'input') {
      return;
    }

    if (event.key === 't') {
      dispatch(toggleTimelinePosition());
    }
    if (event.key === 'i') {
      dispatch(toggleInstructions());
    }
    if (event.key === 'n') {
      dispatch(shiftInstructionsPosition());
    }
    if (event.key === 'b') {
      dispatch(toggleBeatPad());
    }
    Triggers.map(trigger => {
      if (event.key === trigger.keyboardKey) {
        playTrigger(trigger.id);
      }
    });
    if (event.code === 'Space') {
      setPlaying(!this.state.isPlaying);
    }
  };

  useEffect(() => {
    document.body.addEventListener('keyup', handleKeyUp);
  }, []);

  return null;
};

KeyHandler.propTypes = {
  playTrigger: PropTypes.func.isRequired,
  setPlaying: PropTypes.func.isRequired
};

export default KeyHandler;

import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import classNames from 'classnames';
import {
  InstructionsPositions,
  shiftInstructionsPosition,
  toggleBeatPad,
  toggleInstructions,
  toggleTimelinePosition
} from './musiclabRedux';
import moduleStyles from './music.module.scss';
import Instructions from './Instructions';
import SharePlaceholder from './SharePlaceholder';
import TopButtons from './TopButtons';
import Controls from './Controls';
import Timeline from './Timeline';
import {connect} from 'react-redux';
import {Triggers} from './constants';

const StatelessMusicView = ({
  isPlaying,
  setPlaying,
  playTrigger,
  clearCode,
  blocklyDivId,
  allSounds,
  resizeBlockly,
  // populated by Redux
  timelineAtTop,
  showInstructions,
  instructionsPosition,
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
    // Space
    if (event.keyCode === 32) {
      setPlaying(!isPlaying);
    }
  };

  useEffect(resizeBlockly, [
    timelineAtTop,
    showInstructions,
    instructionsPosition,
    resizeBlockly
  ]);

  const renderInstructions = position => {
    if (position === InstructionsPositions.TOP) {
      return (
        <div
          id="instructions-area"
          className={classNames(
            moduleStyles.instructionsArea,
            moduleStyles.instructionsTop
          )}
        >
          <Instructions />
          <div
            id="share-area"
            className={classNames(
              moduleStyles.shareArea,
              moduleStyles.shareTop
            )}
          >
            <SharePlaceholder />
          </div>
        </div>
      );
    }

    return (
      <div
        className={classNames(
          moduleStyles.instructionsArea,
          moduleStyles.instructionsSide,
          position === InstructionsPositions.LEFT
            ? moduleStyles.instructionsLeft
            : moduleStyles.instructionsRight
        )}
      >
        <Instructions
          vertical={true}
          right={position === InstructionsPositions.RIGHT}
        />
      </div>
    );
  };

  const renderTimelineArea = (timelineAtTop, instructionsOnRight) => {
    return (
      <div
        id="timeline-area"
        className={classNames(
          moduleStyles.timelineArea,
          timelineAtTop ? moduleStyles.timelineTop : moduleStyles.timelineBottom
        )}
      >
        <Controls
          isPlaying={isPlaying}
          setPlaying={setPlaying}
          playTrigger={playTrigger}
          top={timelineAtTop}
          instructionsOnRight={instructionsOnRight}
        />
        <Timeline isPlaying={isPlaying} sounds={allSounds} />
      </div>
    );
  };

  return (
    <div
      id="music-lab-container"
      className={moduleStyles.container}
      onKeyUp={handleKeyUp}
      tabIndex={-1}
    >
      {showInstructions &&
        instructionsPosition === InstructionsPositions.TOP &&
        renderInstructions(InstructionsPositions.TOP)}

      {timelineAtTop &&
        renderTimelineArea(
          true,
          instructionsPosition === InstructionsPositions.RIGHT
        )}

      <div className={moduleStyles.middleArea}>
        {showInstructions &&
          instructionsPosition === InstructionsPositions.LEFT &&
          renderInstructions(InstructionsPositions.LEFT)}

        <div id="blockly-area" className={moduleStyles.blocklyArea}>
          <div className={moduleStyles.topButtonsContainer}>
            <TopButtons clearCode={clearCode} />
          </div>
          <div id={blocklyDivId} />
        </div>

        {showInstructions &&
          instructionsPosition === InstructionsPositions.RIGHT &&
          renderInstructions(InstructionsPositions.RIGHT)}
      </div>

      {!timelineAtTop &&
        renderTimelineArea(
          false,
          instructionsPosition === InstructionsPositions.RIGHT
        )}
    </div>
  );
};

StatelessMusicView.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setPlaying: PropTypes.func.isRequired,
  playTrigger: PropTypes.func.isRequired,
  clearCode: PropTypes.func.isRequired,
  blocklyDivId: PropTypes.string.isRequired,
  timelineAtTop: PropTypes.bool.isRequired,
  showInstructions: PropTypes.bool.isRequired,
  instructionsPosition: PropTypes.oneOf(Object.values(InstructionsPositions))
    .isRequired,
  allSounds: PropTypes.array.isRequired,
  resizeBlockly: PropTypes.func.isRequired,
  toggleTimelinePosition: PropTypes.func.isRequired,
  toggleInstructions: PropTypes.func.isRequired,
  shiftInstructionsPosition: PropTypes.func.isRequired,
  toggleBeatPad: PropTypes.func.isRequired
};

export default connect(
  state => ({
    timelineAtTop: state.music.timelineAtTop,
    showInstructions: state.music.showInstructions,
    instructionsPosition: state.music.instructionsPosition
  }),
  dispatch => ({
    toggleTimelinePosition: () => dispatch(toggleTimelinePosition()),
    toggleInstructions: () => dispatch(toggleInstructions()),
    shiftInstructionsPosition: () => dispatch(shiftInstructionsPosition()),
    toggleBeatPad: () => dispatch(toggleBeatPad())
  })
)(StatelessMusicView);

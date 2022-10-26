import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import FontAwesome from '../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';

const Controls = ({
  isPlaying,
  setPlaying,
  playTrigger,
  top,
  startOverClicked,
  toggleInstructions
}) => {
  const [isShowingBeatPad, setBeatPadShowing] = useState(false);
  useEffect(() => {
    if (isPlaying) {
      setBeatPadShowing(true);
    }
  }, [isPlaying]);

  const renderStartOver = () => {
    return (
      <button
        type="button"
        className={moduleStyles.startOverButton}
        onClick={startOverClicked}
      >
        <FontAwesome icon={'refresh'} />
        &nbsp; Start Over
      </button>
    );
  };

  const renderBeatPad = () => {
    return (
      <div
        style={{
          position: 'absolute',
          [top ? 'bottom' : 'top']: -175,
          right: 10
        }}
      >
        <BeatPad
          triggers={Triggers}
          playTrigger={playTrigger}
          onClose={() => {
            setBeatPadShowing(false);
          }}
          isPlaying={isPlaying}
        />
      </div>
    );
  };

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      {isShowingBeatPad && renderBeatPad()}
      <div
        className={classNames(moduleStyles.controlButtons, moduleStyles.side)}
      >
        <FontAwesome
          icon={'info-circle'}
          className={moduleStyles.iconButton}
          onClick={toggleInstructions}
        />
      </div>
      <div
        className={classNames(moduleStyles.controlButtons, moduleStyles.center)}
      >
        <FontAwesome
          icon={isPlaying ? 'stop-circle' : 'play-circle'}
          onClick={() => setPlaying(!isPlaying)}
          className={moduleStyles.iconButton}
        />
      </div>
      {renderStartOver()}
      <div
        className={classNames(moduleStyles.controlButtons, moduleStyles.side)}
      >
        <FontAwesome
          icon={'th'}
          onClick={() => setBeatPadShowing(!isShowingBeatPad)}
          className={moduleStyles.iconButton}
        />
      </div>
    </div>
  );
};

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setPlaying: PropTypes.func.isRequired,
  playTrigger: PropTypes.func.isRequired,
  top: PropTypes.bool.isRequired,
  startOverClicked: PropTypes.func.isRequired,
  toggleInstructions: PropTypes.func.isRequired
};

export default Controls;

import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import FontAwesome from '../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';

const Controls = ({isPlaying, setPlaying, playTrigger, top}) => {
  const [isShowingBeatBad, setBeatPadShowing] = useState(false);
  useEffect(() => {
    if (isPlaying) {
      setBeatPadShowing(true);
    }
  }, [isPlaying]);

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
        />
      </div>
    );
  };

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      {isPlaying && isShowingBeatBad && renderBeatPad()}
      {isPlaying && (
        // Placeholder button area, currently hidden
        <div
          className={classNames(
            moduleStyles.controlButtons,
            moduleStyles.side,
            moduleStyles.hide
          )}
        >
          <FontAwesome
            icon={'th'}
            style={{fontSize: 30}}
            className={moduleStyles.iconButton}
          />
        </div>
      )}
      <div
        className={classNames(moduleStyles.controlButtons, moduleStyles.center)}
      >
        <FontAwesome
          icon={isPlaying ? 'stop-circle' : 'play-circle'}
          style={{fontSize: 30}}
          onClick={() => setPlaying(!isPlaying)}
          className={moduleStyles.iconButton}
        />
      </div>
      {isPlaying && (
        <div
          className={classNames(moduleStyles.controlButtons, moduleStyles.side)}
        >
          <FontAwesome
            icon={'th'}
            style={{fontSize: 30}}
            onClick={() => setBeatPadShowing(!isShowingBeatBad)}
            className={moduleStyles.iconButton}
          />
        </div>
      )}
    </div>
  );
};

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setPlaying: PropTypes.func.isRequired,
  playTrigger: PropTypes.func.isRequired,
  top: PropTypes.bool.isRequired
};

export default Controls;

import PropTypes from 'prop-types';
import React, {useEffect, useContext} from 'react';
import classNames from 'classnames';
import FontAwesome from '../../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';
import {AnalyticsContext} from '../context';
import {useDispatch, useSelector} from 'react-redux';
import {hideBeatPad, showBeatPad} from '../redux/musicRedux';
import commonI18n from '@cdo/locale';

/**
 * Renders the playback controls bar, including the play/pause button, show/hide beat pad button,
 * and show/hide instructions button.
 */
const Controls = ({
  setPlaying,
  playTrigger,
  top,
  instructionsAvailable,
  toggleInstructions,
  instructionsOnRight,
  hasTrigger,
}) => {
  const isPlaying = useSelector(state => state.music.isPlaying);
  const isBeatPadShowing = useSelector(state => state.music.isBeatPadShowing);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isPlaying) {
      dispatch(showBeatPad());
    }
  }, [dispatch, isPlaying]);

  const analyticsReporter = useContext(AnalyticsContext);

  const renderBeatPad = () => {
    return (
      <BeatPad
        triggers={Triggers}
        playTrigger={playTrigger}
        onClose={() => {
          dispatch(hideBeatPad());
          analyticsReporter.onButtonClicked('show-hide-beatpad', {
            showing: false,
          });
        }}
        hasTrigger={hasTrigger}
        isPlaying={isPlaying}
      />
    );
  };

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      <div className={moduleStyles.section}>
        <button
          id="run-button"
          className={classNames(
            moduleStyles.controlButton,
            moduleStyles.controlButtonRun
          )}
          onClick={() => setPlaying(!isPlaying)}
          type="button"
        >
          <FontAwesome
            icon={isPlaying ? 'stop' : 'play'}
            className={moduleStyles.playStopIcon}
          />
          <div className={moduleStyles.text}>
            {isPlaying ? commonI18n.stop() : commonI18n.runProgram()}
          </div>
        </button>
      </div>
      {isBeatPadShowing && renderBeatPad()}
    </div>
  );
};

Controls.propTypes = {
  setPlaying: PropTypes.func.isRequired,
  playTrigger: PropTypes.func.isRequired,
  top: PropTypes.bool.isRequired,
  instructionsAvailable: PropTypes.bool.isRequired,
  toggleInstructions: PropTypes.func.isRequired,
  instructionsOnRight: PropTypes.bool.isRequired,
  hasTrigger: PropTypes.func.isRequired,
};

export default Controls;

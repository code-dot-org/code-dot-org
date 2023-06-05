import PropTypes from 'prop-types';
import React, {useEffect, useContext} from 'react';
import classNames from 'classnames';
import FontAwesome from '../../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';
import {AnalyticsContext} from '../context';
import {useDispatch, useSelector} from 'react-redux';
import {hideBeatPad, showBeatPad, toggleBeatPad} from '../redux/musicRedux';
import commonI18n from '@cdo/locale';

const documentationUrl = '/docs/ide/projectbeats';

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
      <div
        style={{
          position: 'absolute',
          [top ? 'bottom' : 'top']: -175,
          [instructionsOnRight ? 'left' : 'right']: 10,
        }}
      >
        <BeatPad
          triggers={Triggers}
          playTrigger={playTrigger}
          onClose={() => {
            dispatch(hideBeatPad());
            analyticsReporter.onButtonClicked('show-hide-beatpad', {
              showing: false,
            });
          }}
          isPlaying={isPlaying}
        />
      </div>
    );
  };

  const renderIconButton = (icon, onClick, hide) => (
    <button
      className={classNames(
        moduleStyles.controlButton,
        moduleStyles.controlButtonIcon,
        hide && moduleStyles.controlButtonHide
      )}
      onClick={onClick}
      type="button"
    >
      <FontAwesome icon={icon} className={moduleStyles.icon} />
    </button>
  );

  const beatPadIconButton = renderIconButton('th', () => {
    analyticsReporter.onButtonClicked('show-hide-beatpad', {
      showing: !isBeatPadShowing,
    });
    dispatch(toggleBeatPad());
  });

  const infoIconButton = renderIconButton(
    'info-circle',
    toggleInstructions,
    !instructionsAvailable
  );

  const [leftIcon, rightIcon] = instructionsOnRight
    ? [beatPadIconButton, infoIconButton]
    : [infoIconButton, beatPadIconButton];

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      {isBeatPadShowing && renderBeatPad()}
      <div
        className={classNames(moduleStyles.section, moduleStyles.sectionSide)}
      >
        {leftIcon}
      </div>
      <div
        className={classNames(moduleStyles.section, moduleStyles.sectionCenter)}
      >
        <button
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
      <div
        className={classNames(moduleStyles.section, moduleStyles.sectionSide)}
      >
        <a
          href={documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={classNames(
            moduleStyles.controlButton,
            moduleStyles.controlButtonIcon
          )}
          onClick={() => {
            analyticsReporter.onButtonClicked('documentation-link');
          }}
        >
          <FontAwesome
            icon={'question-circle-o'}
            className={classNames(moduleStyles.icon, moduleStyles.feedbackIcon)}
          />
        </a>
      </div>
      {rightIcon}
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
};

export default Controls;

import PropTypes from 'prop-types';
import React, {useState, useEffect, useContext} from 'react';
import classNames from 'classnames';
import FontAwesome from '../../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';
import {AnalyticsContext} from '../context';

/**
 * Renders the playback controls bar, including the play/pause button, show/hide beat pad button,
 * and show/hide instructions button.
 */
const Controls = ({
  isPlaying,
  setPlaying,
  playTrigger,
  top,
  instructionsAvailable,
  toggleInstructions,
  instructionsOnRight,
  isLooping,
  setLooping
}) => {
  const [isShowingBeatPad, setBeatPadShowing] = useState(false);
  useEffect(() => {
    if (isPlaying) {
      setBeatPadShowing(true);
    }
  }, [isPlaying]);

  const analyticsReporter = useContext(AnalyticsContext);

  const renderBeatPad = () => {
    return (
      <div
        style={{
          position: 'absolute',
          [top ? 'bottom' : 'top']: -175,
          [instructionsOnRight ? 'left' : 'right']: 10
        }}
      >
        <BeatPad
          triggers={Triggers}
          playTrigger={playTrigger}
          onClose={() => {
            setBeatPadShowing(false);
            analyticsReporter.onButtonClicked('show-hide-beatpad', {
              showing: false
            });
          }}
          isPlaying={isPlaying}
        />
      </div>
    );
  };

  const renderIconButton = (icon, onClick) => (
    <div className={classNames(moduleStyles.controlButtons, moduleStyles.side)}>
      <FontAwesome
        icon={icon}
        className={moduleStyles.iconButton}
        onClick={onClick}
      />
    </div>
  );

  const beatPadIconSection = renderIconButton('th', () => {
    analyticsReporter.onButtonClicked('show-hide-beatpad', {
      showing: !isShowingBeatPad
    });
    setBeatPadShowing(!isShowingBeatPad);
  });
  const infoIconSection = instructionsAvailable
    ? renderIconButton('info-circle', toggleInstructions)
    : null;

  const [leftIcon, rightIcon] = instructionsOnRight
    ? [beatPadIconSection, infoIconSection]
    : [infoIconSection, beatPadIconSection];

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      {isShowingBeatPad && renderBeatPad()}
      {leftIcon}
      <div
        className={classNames(moduleStyles.controlButtons, moduleStyles.center)}
      >
        <FontAwesome
          icon={isPlaying ? 'stop-circle' : 'play-circle'}
          onClick={() => setPlaying(!isPlaying)}
          className={moduleStyles.iconButton}
          style={{paddingLeft: 140}}
        />
        <div
          style={{
            marginLeft: 12,
            cursor: 'pointer',
            backgroundColor: isLooping ? 'white' : 'initial',
            color: isLooping ? '#424242' : 'white',
            borderRadius: '50%',
            width: 18,
            height: 18,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setLooping(!isLooping)}
        >
          <FontAwesome icon={'repeat'} style={{position: 'absolute'}} />
        </div>
        <div style={{width: 140}}>
          {isLooping && (
            <div>
              <input
                type="number"
                style={{
                  width: 45,
                  borderRadius: 4,
                  marginBottom: 0,
                  marginLeft: 7,
                  marginRight: 7,
                  padding: 2
                }}
              />
              <FontAwesome icon={'arrow-right'} />
              <input
                type="number"
                style={{
                  width: 45,
                  borderRadius: 4,
                  marginBottom: 0,
                  marginLeft: 7,
                  padding: 2
                }}
              />
            </div>
          )}
        </div>
      </div>
      {rightIcon}
    </div>
  );
};

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setPlaying: PropTypes.func.isRequired,
  playTrigger: PropTypes.func.isRequired,
  top: PropTypes.bool.isRequired,
  instructionsAvailable: PropTypes.bool.isRequired,
  toggleInstructions: PropTypes.func.isRequired,
  instructionsOnRight: PropTypes.bool.isRequired,
  isLooping: PropTypes.bool.isRequired,
  setLooping: PropTypes.func.isRequired
};

export default Controls;

import PropTypes from 'prop-types';
import React, {useEffect, useContext} from 'react';
import classNames from 'classnames';
import FontAwesome from '../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';
import {AnalyticsContext} from './context';
import {connect} from 'react-redux';
import {setBeatPadShowing, toggleBeatPad} from './musiclabRedux';

const Controls = ({
  isPlaying,
  setPlaying,
  playTrigger,
  top,
  toggleInstructions,
  instructionsOnRight,
  // populated by Redux
  showBeatPad,
  setBeatPadShowing,
  toggleBeatPad
}) => {
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
      showing: !showBeatPad
    });
    toggleBeatPad();
  });
  const infoIconSection = renderIconButton('info-circle', toggleInstructions);

  const [leftIcon, rightIcon] = instructionsOnRight
    ? [beatPadIconSection, infoIconSection]
    : [infoIconSection, beatPadIconSection];

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      {showBeatPad && renderBeatPad()}
      {leftIcon}
      <div
        className={classNames(moduleStyles.controlButtons, moduleStyles.center)}
      >
        <FontAwesome
          icon={isPlaying ? 'stop-circle' : 'play-circle'}
          onClick={() => setPlaying(!isPlaying)}
          className={moduleStyles.iconButton}
        />
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
  toggleInstructions: PropTypes.func.isRequired,
  instructionsOnRight: PropTypes.bool.isRequired,
  showBeatPad: PropTypes.bool.isRequired,
  setBeatPadShowing: PropTypes.func.isRequired,
  toggleBeatPad: PropTypes.func.isRequired
};

export default connect(
  state => ({
    showBeatPad: state.music.showBeatPad
  }),
  dispatch => ({
    setBeatPadShowing: showing => dispatch(setBeatPadShowing(showing)),
    toggleBeatPad: () => dispatch(toggleBeatPad())
  })
)(Controls);

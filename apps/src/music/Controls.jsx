import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';

export default class Controls extends React.Component {
  static propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    setPlaying: PropTypes.func.isRequired,
    playTrigger: PropTypes.func.isRequired,
    top: PropTypes.bool.isRequired
  };

  renderBeatPad = () => {
    return (
      <div
        style={{
          position: 'absolute',
          [this.props.top ? 'bottom' : 'top']: -175,
          right: 10
        }}
      >
        <BeatPad
          triggers={Triggers}
          playTrigger={this.props.playTrigger}
          onClose={() => {
            console.log('TODO close Beat Pad');
          }}
        />
      </div>
    );
  };

  render() {
    const {isPlaying, setPlaying} = this.props;

    return (
      <div id="controls" className={moduleStyles.controlsContainer}>
        {isPlaying && this.renderBeatPad()}
        <br />
        <div
          className={moduleStyles.playPauseButton}
          onClick={() => setPlaying(!isPlaying)}
        >
          <FontAwesome
            icon={isPlaying ? 'stop-circle' : 'play-circle'}
            style={{fontSize: 30}}
          />
        </div>
      </div>
    );
  }
}

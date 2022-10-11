import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';

export default class Controls extends React.Component {
  static propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    setPlaying: PropTypes.func.isRequired,
    playTrigger: PropTypes.func.isRequired
  };

  renderTriggers = () => {
    const triggerButtons = Triggers.map(trigger => (
      <button
        key={trigger.id}
        type="button"
        onClick={() => this.props.playTrigger(trigger.id)}
        className={moduleStyles.triggerButton}
      >
        {trigger.buttonLabel}
      </button>
    ));

    return (
      <div className={moduleStyles.triggersContainer}>{triggerButtons}</div>
    );
  };

  render() {
    const {isPlaying, setPlaying} = this.props;

    return (
      <div
        id="controls"
        style={{
          width: 100,
          bottom: 10,
          left: 10,
          borderRadius: 4,
          position: 'absolute',
          zIndex: 70
        }}
      >
        {isPlaying && this.renderTriggers()}
        <br />
        <div
          style={{
            textAlign: 'left',
            cursor: 'pointer',
            color: 'white'
          }}
          onClick={() => setPlaying(!isPlaying)}
        >
          <FontAwesome
            icon={isPlaying ? 'stop' : 'play'}
            style={{fontSize: 25}}
          />
        </div>
      </div>
    );
  }
}

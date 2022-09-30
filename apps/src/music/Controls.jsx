import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '../templates/FontAwesome';

export default class Timeline extends React.Component {
  static propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    setPlaying: PropTypes.func.isRequired,
    playTrigger: PropTypes.func.isRequired
  };
  render() {
    const {isPlaying, setPlaying, playTrigger} = this.props;

    return (
      <div
        style={{
          width: 100,
          backgroundColor: '#222',
          bottom: 10,
          left: 10,
          borderRadius: 4,
          position: 'absolute',
          zIndex: 70
        }}
      >
        {isPlaying && (
          <div style={{textAlign: 'left'}}>
            <button
              type="button"
              onClick={() => playTrigger()}
              style={{padding: 2, fontSize: 10, margin: 0}}
            >
              trigger
            </button>
          </div>
        )}
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

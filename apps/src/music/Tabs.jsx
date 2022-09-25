import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '../templates/FontAwesome';

export default class Tabs extends React.Component {
  static propTypes = {
    isDesktop: PropTypes.bool.isRequired,
    currentPanel: PropTypes.string.isRequired,
    choosePanel: PropTypes.func.isRequired,
    isPlaying: PropTypes.bool.isRequired
  };

  render() {
    const {isDesktop, currentPanel, choosePanel, isPlaying} = this.props;

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          backgroundColor: '#222',
          height: 50,
          left: 10,
          right: 10,
          borderRadius: 4,
          marginTop: 10,
          justifyContent: 'space-evenly',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            color: isDesktop || currentPanel === 'groups' ? 'white' : '#777'
          }}
          onClick={() => choosePanel('groups')}
        >
          <FontAwesome icon="book" style={{fontSize: 25}} />
          <div style={{fontSize: 8}}>Groups</div>
        </div>
        <div
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            color: isDesktop || currentPanel === 'code' ? 'white' : '#777'
          }}
          onClick={() => choosePanel('code')}
        >
          <FontAwesome icon="music" style={{fontSize: 25}} />
          <div style={{fontSize: 8}}>Code song</div>
        </div>
        <div
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            color: isDesktop || currentPanel === 'timeline' ? 'white' : '#777'
          }}
          onClick={() => choosePanel('timeline')}
        >
          <FontAwesome
            icon={isPlaying ? 'stop' : 'play'}
            style={{fontSize: 25}}
          />
          <div style={{fontSize: 8}}>
            {isPlaying ? 'Stop song' : 'Play song'}
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            color: isDesktop || currentPanel === 'liveplay' ? 'white' : '#777'
          }}
          onClick={() => choosePanel('liveplay')}
        >
          <FontAwesome icon="th" style={{fontSize: 25}} />
          <div style={{fontSize: 8}}>Live play</div>
        </div>
      </div>
    );
  }
}

/** @file Maker connection status visualization overlay */
import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import color from '../../../../util/color';
import FontAwesome from '../../../../templates/FontAwesome';

/**
 * Overlay for the play space that displays maker status updates
 * when there are connection issues.
 */
export default class MakerStatusOverlay extends Component {
  render() {
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: this.props.vizWidth,
      height: this.props.vizHeight,
      zIndex: 4,
      overflow: 'hidden',
      outline: 'none',
      background: `repeating-linear-gradient(
          45deg,
          rgba(0, 0, 0, 0.1),
          rgba(0, 0, 0, 0.1) 10px,
          rgba(0, 0, 0, 0.2) 10px,
          rgba(0, 0, 0, 0.2) 20px
          )`
    };

    return (
      <div style={style}>
        <BoardNotFound/>
      </div>
    );
  }
}
MakerStatusOverlay.propTypes = {
  vizWidth: PropTypes.number.isRequired,
  vizHeight: PropTypes.number.isRequired,
};

class WaitingToConnect extends Component {
  render() {
    const style = {
      backgroundColor: color.light_gray,
      color: color.white,
      textAlign: 'center',
    };
    return (
      <div style={style}>
        <div style={{padding: '2em'}}>
          <FontAwesome
            icon="cog"
            className="fa-spin fa-3x"
            style={{display: 'block'}}
          />
          <div style={{margin: '1em'}}>
            Waiting for board to connect...
          </div>
        </div>
      </div>
    );
  }
}

class BoardNotFound extends Component {
  render() {
    const style = {
      backgroundColor: color.red,
      color: color.white,
      textAlign: 'center',
    };
    return (
      <div style={style}>
        <div style={{padding: '2em'}}>
          <FontAwesome
            icon="exclamation-triangle"
            className="fa-3x"
            style={{display: 'block'}}
          />
          <div style={{margin: '1em'}}>
            Make sure your board is plugged in.
          </div>
          <OverlayButton text="Try Again"/>
        </div>
      </div>
    );
  }
}

class OverlayButton_ extends Component {
  render() {
    const style = {
      fontSize: 12,
      fontFamily: '"Gotham 4r", sans-serif',
      fontWeight: 'bold',
      borderStyle: 'solid',
      borderWidth: 1,
      orderRadius: 3,
      textDecoration: 'none',
      color: color.white,
      borderColor: color.white,
      backgroundColor: 'transparent',
      ':hover': {
        color: color.red,
        backgroundColor: color.white,
        cursor: 'pointer',
        boxShadow: 'none',
      },
      height: 40,
      paddingLeft: 30,
      paddingRight: 30,
      boxSizing: 'border-box',
      overflow: 'hidden'
    };
    return (
      <button style={style}>
        {this.props.text}
      </button>
    );
  }
}
OverlayButton_.propTypes = {
  text: PropTypes.string.isRequired,
};
const OverlayButton = Radium(OverlayButton_);

/** @file Maker connection status visualization overlay */
import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import color from '../../../../util/color';
import FontAwesome from '../../../../templates/FontAwesome';
import {isConnecting, hasConnectionError} from '../redux';

/**
 * Overlay for the play space that displays maker status updates
 * when there are connection issues.
 */
class MakerStatusOverlay extends Component {
  render() {
    let CurrentOverlay;
    if (this.props.isConnecting) {
      CurrentOverlay = WaitingToConnect;
    } else if (this.props.hasConnectionError) {
      CurrentOverlay = BoardNotFound;
    }

    if (!CurrentOverlay) {
      return null;
    }

    return (
      <CurrentOverlay
        width={this.props.vizWidth}
        height={this.props.vizHeight}
      />
    );
  }
}
MakerStatusOverlay.propTypes = {
  vizWidth: PropTypes.number.isRequired,
  vizHeight: PropTypes.number.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  hasConnectionError: PropTypes.bool.isRequired,
};
export default connect(
  state => ({
    isConnecting: isConnecting(state),
    hasConnectionError: hasConnectionError(state),
  })
)(MakerStatusOverlay);

class WaitingToConnect extends Component {
  render() {
    return (
      <Overlay
        width={this.props.width}
        height={this.props.height}
        icon="cog"
        iconModifiers="fa-spin"
        text="Waiting for board to connect..."
        backgroundColor={color.light_gray}
      />
    );
  }
}
WaitingToConnect.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

class BoardNotFound extends Component {
  render() {
    return (
      <Overlay
        width={this.props.width}
        height={this.props.height}
        icon="exclamation-triangle"
        text="Make sure your board is plugged in."
        backgroundColor={color.red}
        onClick={() => {}}
        buttonText="Try Again"
      />
    );
  }
}
BoardNotFound.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

class Overlay extends Component {
  render() {
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: this.props.width,
      height: this.props.height,
      zIndex: 4,
      overflow: 'hidden',
      outline: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: this.props.backgroundColor,
      color: color.white,
    };
    const padStyle = {
      flex: '1 0 0',
    };
    const bodyStyle = {
      flex: '0 0 0',
      padding: '2em',
      textAlign: 'center',
    };
    return (
      <div style={style}>
        <div style={padStyle}></div>
        <div style={bodyStyle}>
          <FontAwesome
            icon={this.props.icon}
            className={[this.props.iconModifiers || '', "fa-3x"].join(' ')}
            style={{display: 'block'}}
          />
          <div style={{margin: '1em'}}>
            {this.props.text}
          </div>
          {this.props.buttonText &&
            <OverlayButton
              text={this.props.buttonText}
              onClick={this.props.onClick}
            />
          }
        </div>
        <div style={padStyle}></div>
      </div>
    );
  }
}
Overlay.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  iconModifiers: PropTypes.string,
  text: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  buttonText: PropTypes.string,
};


class OverlayButton_ extends Component {
  render() {
    const style = {
      fontSize: 12,
      fontFamily: '"Gotham 4r", sans-serif',
      fontWeight: 'bold',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 3,
      textDecoration: 'none',
      color: color.white,
      borderColor: color.white,
      backgroundColor: 'transparent',
      outline: 'none',
      ':hover': {
        color: color.black,
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

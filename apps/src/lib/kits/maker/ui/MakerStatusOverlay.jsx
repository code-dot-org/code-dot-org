/** @file Maker connection status visualization overlay */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import color from '../../../../util/color';
import FontAwesome from '../../../../templates/FontAwesome';
import {getVisualizationScale} from '../../../../redux/layout';
import {isConnecting, hasConnectionError} from '../redux';
import {singleton as studioApp} from '../../../../StudioApp';
import OverlayButton from './OverlayButton';

const overlayDimensionsPropTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scale: PropTypes.number,
};

/**
 * Overlay for the play space that displays maker status updates
 * when there are connection issues.
 */
export class UnconnectedMakerStatusOverlay extends Component {
  render() {
    const {width, height, scale, isConnecting, hasConnectionError} = this.props;
    const dimensions = {width, height, scale};
    if (isConnecting) {
      return <WaitingToConnect {...dimensions}/>;
    } else if (hasConnectionError) {
      return <BoardNotFound {...dimensions}/>;
    }
    return null;
  }
}
UnconnectedMakerStatusOverlay.propTypes = {
  ...overlayDimensionsPropTypes,
  isConnecting: PropTypes.bool.isRequired,
  hasConnectionError: PropTypes.bool.isRequired,
};
export default connect(
  state => ({
    scale: getVisualizationScale(state),
    isConnecting: isConnecting(state),
    hasConnectionError: hasConnectionError(state),
  })
)(UnconnectedMakerStatusOverlay);

const style = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 4,
    overflow: 'hidden',
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: color.white,
  },
  padding: {
    flex: '1 0 0',
  },
  content: {
    flex: '0 0 0',
    padding: '2em',
    textAlign: 'center',
  },
  icon: {
    display: 'block',
  },
  text: {
    margin: '1em',
  },
};

class Overlay extends Component {
  icon() {
    const classNames = [this.props.iconModifiers || '', "fa-3x"].join(' ');
    return (
      <FontAwesome
        icon={this.props.icon}
        className={classNames}
        style={style.icon}
      />
    );
  }

  text() {
    return (
      <div style={style.text}>
        {this.props.text}
      </div>
    );
  }

  button() {
    return (
      <OverlayButton
        text={this.props.buttonText}
        onClick={this.props.onClick}
      />
    );
  }

  render() {
    let rootStyle = {
      ...style.root,
      width: this.props.width,
      height: this.props.height,
      backgroundColor: this.props.backgroundColor,
    };

    // If scale is undefined we are still letting media queries handle the
    // viz scaling - but if it's set the user has dragged the resize bar, and
    // we need to set scale directly.
    if (typeof this.props.scale === 'number') {
      const transform = `scale(${this.props.scale})`;
      rootStyle.transform = transform;
      rootStyle.msTransform = transform;
      rootStyle.WebkitTransform = transform;
    }
    return (
      <div style={rootStyle}>
        <div style={style.padding}/>
        <div style={style.content}>
          {this.icon()}
          {this.text()}
          {this.props.buttonText && this.button()}
        </div>
        <div style={style.padding}/>
      </div>
    );
  }
}
Overlay.propTypes = {
  ...overlayDimensionsPropTypes,
  icon: PropTypes.string.isRequired,
  iconModifiers: PropTypes.string,
  text: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  buttonText: PropTypes.string,
};

class WaitingToConnect extends Component {
  render() {
    return (
        <Overlay
          {...this.props}
          icon="cog"
          iconModifiers="fa-spin"
          text="Waiting for board to connect..."
          backgroundColor={color.light_gray}
        />
    );
  }
}
WaitingToConnect.propTypes = {
  ...overlayDimensionsPropTypes,
};

class BoardNotFound extends Component {
  render() {
    return (
        <Overlay
          {...this.props}
          icon="exclamation-triangle"
          text="Make sure your board is plugged in."
          backgroundColor={color.red}
          onClick={() => {
              studioApp.resetButtonClick();
              studioApp.runButtonClick();
            }}
          buttonText="Try Again"
        />
    );
  }
}
BoardNotFound.propTypes = WaitingToConnect.propTypes;

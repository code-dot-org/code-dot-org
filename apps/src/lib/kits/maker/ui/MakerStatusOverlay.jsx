/** @file Maker connection status visualization overlay */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import color from '../../../../util/color';
import FontAwesome from '../../../../templates/FontAwesome';
import {getVisualizationScale} from '../../../../redux/layout';
import {isConnecting, hasConnectionError, getConnectionError, useFakeBoardOnNextRun} from '../redux';
import {UnsupportedBrowserError} from '../MakerError';
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
  static propTypes = {
    ...overlayDimensionsPropTypes,
    isConnecting: PropTypes.bool.isRequired,
    isWrongBrowser: PropTypes.bool.isRequired,
    hasConnectionError: PropTypes.bool.isRequired,
    handleTryAgain: PropTypes.func.isRequired,
    handleDisableMaker: PropTypes.func.isRequired,
    useFakeBoardOnNextRun: PropTypes.func.isRequired,
    handleOpenSetupPage: PropTypes.func.isRequired,
  };

  render() {
    const {width, height, scale, isConnecting, isWrongBrowser,
      hasConnectionError, handleTryAgain, handleDisableMaker,
      handleOpenSetupPage} = this.props;
    const dimensions = {width, height, scale};
    if (isConnecting) {
      return <WaitingToConnect {...dimensions}/>;
    } else if (isWrongBrowser) {
      return (
        <UnsupportedBrowser
          {...dimensions}
          handleDisableMaker={handleDisableMaker}
          handleOpenSetupPage={handleOpenSetupPage}
        />
      );
    } else if (hasConnectionError) {
      return (
        <BoardNotFound
          {...dimensions}
          handleTryAgain={handleTryAgain}
          useFakeBoardOnNextRun={this.props.useFakeBoardOnNextRun}
          handleOpenSetupPage={handleOpenSetupPage}
        />
      );
    }
    return null;
  }
}
export default connect(
  state => ({
    scale: getVisualizationScale(state),
    isConnecting: isConnecting(state),
    isWrongBrowser: getConnectionError(state) instanceof UnsupportedBrowserError,
    hasConnectionError: hasConnectionError(state),
    handleOpenSetupPage: () => {
      window.open('/maker/setup', '_blank');
    }
  }), {
    useFakeBoardOnNextRun
  }
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
    color: color.charcoal,
    backgroundColor: color.lighter_gray,
  },
  padding: {
    flex: '1 0 auto',
  },
  content: {
    flex: '0 0 auto',
    padding: '1em',
    textAlign: 'center',
  },
  icon: {
    display: 'block',
  },
  text: {
    margin: '1em',
  }
};

class Overlay extends Component {
  static propTypes = {
    ...overlayDimensionsPropTypes,
    children: PropTypes.any,
  };

  render() {
    let rootStyle = {
      ...style.root,
      width: this.props.width,
      height: this.props.height,
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
          {this.props.children}
        </div>
        <div style={style.padding}/>
      </div>
    );
  }
}

class WaitingToConnect extends Component {
  static propTypes = overlayDimensionsPropTypes;

  render() {
    return (
      <Overlay {...this.props}>
        <Icon icon="cog" spin/>
        <Text>Waiting for board to connect...</Text>
      </Overlay>
    );
  }
}

class UnsupportedBrowser extends Component {
  static propTypes = {
    ...overlayDimensionsPropTypes,
    handleDisableMaker: PropTypes.func.isRequired,
    handleOpenSetupPage: PropTypes.func.isRequired,
  };

  render() {
    const {handleDisableMaker, handleOpenSetupPage} = this.props;
    return (
      <Overlay {...this.props}>
        <Icon icon="exclamation-triangle"/>
        <Text>
          This level requires the<br/>Code.org Maker App
        </Text>
        <UniformWidth>
          <OverlayButton
            primary
            text="Get Code.org Maker App"
            className="setup-instructions"
            onClick={handleOpenSetupPage}
          />
          <OverlayButton
            text="Disable Maker Toolkit"
            className="disable-maker-toolkit"
            onClick={handleDisableMaker}
          />
        </UniformWidth>
      </Overlay>
    );
  }
}

class BoardNotFound extends Component {
  static propTypes = {
    ...overlayDimensionsPropTypes,
    handleTryAgain: PropTypes.func.isRequired,
    useFakeBoardOnNextRun: PropTypes.func.isRequired,
    handleOpenSetupPage: PropTypes.func.isRequired,
  };

  handleRunWithoutBoard = () => {
    this.props.useFakeBoardOnNextRun();
    this.props.handleTryAgain();
  };

  render() {
    return (
      <Overlay {...this.props}>
        <Icon icon="exclamation-triangle"/>
        <Text>Make sure your board is plugged in.</Text>
        <UniformWidth>
          <OverlayButton
            primary
            text="Try Again"
            className="try-again"
            onClick={this.props.handleTryAgain}
          />
          <OverlayButton
            text="Run Without Board"
            className="run-without-board"
            onClick={this.handleRunWithoutBoard}
          />
          <OverlayButton
            text="Setup Instructions"
            className="setup-instructions"
            onClick={this.props.handleOpenSetupPage}
          />
        </UniformWidth>
      </Overlay>
    );
  }
}

/**
 * Wraps a group of buttons in such a way that they will all be as wide
 * as the widest button.
 */
function UniformWidth({children}) {
  return (
      <div
        style={{
          display: 'flex',
          flexDirection:'row',
          justifyContent:'center',
        }}
      >
        <div
          style={{
            display:'flex',
            flexDirection:'column',
          }}
        >
          {children}
        </div>
      </div>
  );
}
UniformWidth.propTypes = {
  children: PropTypes.any,
};

/**
 * Render a line of text in overlay style.
 */
function Text({children}) {
  return <div style={style.text}>{children}</div>;
}
Text.propTypes = {
  children: PropTypes.any,
};

/**
 * Render a font-awesome icon in the overlay style.
 */
function Icon({icon, spin=false}) {
  const classNames = ['fa-5x'];
  if (spin) {
    classNames.push('fa-spin');
  }
  return (
    <FontAwesome
      icon={icon}
      className={classNames.join(' ')}
      style={style.icon}
    />
  );
}
Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  spin: PropTypes.bool,
};

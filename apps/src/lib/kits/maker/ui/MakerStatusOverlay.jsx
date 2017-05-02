/** @file Maker connection status visualization overlay */
import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import color from '../../../../util/color';
import FontAwesome from '../../../../templates/FontAwesome';
import {getVisualizationScale} from '../../../../redux/layout';
import {isConnecting, hasConnectionError} from '../redux';
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
    hasConnectionError: PropTypes.bool.isRequired,
    handleTryAgain: PropTypes.func.isRequired,
    handleDisableMaker: PropTypes.func,
  };

  render() {
    const {width, height, scale, isConnecting, hasConnectionError,
      handleTryAgain, handleDisableMaker} = this.props;
    const dimensions = {width, height, scale};
    if (isConnecting) {
      return <WaitingToConnect {...dimensions}/>;
    } else if (hasConnectionError) {
      return (
        <BoardNotFound
          {...dimensions}
          handleTryAgain={handleTryAgain}
          handleDisableMaker={handleDisableMaker}
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
    flex: '1 0 auto',
  },
  content: {
    flex: '0 0 auto',
    padding: '2em',
    textAlign: 'center',
  },
  footer: {
    flex: '0 0 auto',
    padding: '1em',
    textAlign: 'center',
  },
  icon: {
    display: 'block',
  },
  text: {
    margin: '1em',
  },
  link: {
    display: 'inline-block',
    fontWeight: 'bold',
    color: color.white,
    textDecoration: 'none',
    lineHeight: 1.5,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    ':hover': {
      color: color.black,
      backgroundColor: color.white,
    }
  }
};

class Overlay extends Component {
  static propTypes = {
    ...overlayDimensionsPropTypes,
    backgroundColor: PropTypes.string.isRequired,
    children: PropTypes.any,
    footer: PropTypes.any,
  };

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
          {this.props.children}
        </div>
        <div style={style.padding}/>
        {this.props.footer &&
          <div style={style.footer}>
            {this.props.footer}
          </div>
        }
      </div>
    );
  }
}

class WaitingToConnect extends Component {
  static propTypes = overlayDimensionsPropTypes;

  render() {
    return (
      <Overlay
        {...this.props}
        backgroundColor={color.light_gray}
      >
        <Icon icon="cog" spin/>
        <Text>Waiting for board to connect...</Text>
      </Overlay>
    );
  }
}

class BoardNotFound extends Component {
  static propTypes = {
    ...overlayDimensionsPropTypes,
    handleTryAgain: PropTypes.func.isRequired,
    handleDisableMaker: PropTypes.func,
  };

  renderFooter() {
    const {handleDisableMaker} = this.props;
    return (
      <span>
        <Text><em>Not sure what's going on?</em></Text>
        <Text>
          <Link href="/maker/setup">Get Help</Link>
          {handleDisableMaker && ' or '}
          {handleDisableMaker &&
            <Link onClick={handleDisableMaker}>
              Disable Maker Toolkit
            </Link>
          }
        </Text>
      </span>
    );
  }

  render() {
    return (
      <Overlay
        {...this.props}
        backgroundColor={color.red}
        footer={this.renderFooter()}
      >
        <Icon icon="exclamation-triangle"/>
        <Text>Make sure your board is plugged in.</Text>
        <OverlayButton
          text="Try Again"
          onClick={this.props.handleTryAgain}
        />
      </Overlay>
    );
  }
}

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
  const classNames = ['fa-3x'];
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

const Link = Radium(React.createClass({
  propTypes: {
    href: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.any,
  },

  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
      e.preventDefault();
    }
  },

  render() {
    return (
      <a
        href={this.props.href || '#'}
        target={this.props.href ? '_blank' : undefined}
        onClick={this.onClick}
        style={style.link}
      >
        {this.props.children}
      </a>
    );
  }
}));

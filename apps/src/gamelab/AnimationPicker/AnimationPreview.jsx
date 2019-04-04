/** @file Render a gallery image/spritesheet as an animated preview */
import PropTypes from 'prop-types';
import React from 'react';
import {EMPTY_IMAGE, PlayBehavior} from '../constants';
import * as shapes from '../shapes';
const MARGIN_PX = 2;

/**
 * Render an animated preview of a spritesheet at a given size, scaled with
 * a fixed aspect ratio to fit.
 */
export default class AnimationPreview extends React.Component {
  static propTypes = {
    animationProps: shapes.AnimationProps.isRequired,
    sourceUrl: PropTypes.string, // of spritesheet
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    playBehavior: PropTypes.oneOf([
      PlayBehavior.ALWAYS_PLAY,
      PlayBehavior.NEVER_PLAY
    ])
  };

  state = {
    currentFrame: 0,
    framesPerRow: 1,
    scaledSourceSize: {x: 0, y: 0},
    scaledFrameSize: {x: 0, y: 0},
    extraTopMargin: 0,
    wrappedSourceUrl: ''
  };

  componentWillMount() {
    this.precalculateRenderProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.precalculateRenderProps(nextProps);
    if (nextProps.playBehavior === PlayBehavior.ALWAYS_PLAY && !this.timeout_) {
      this.advanceFrame();
    } else if (
      nextProps.playBehavior !== PlayBehavior.ALWAYS_PLAY &&
      this.timeout_
    ) {
      this.stopAndResetAnimation();
    }
  }

  componentWillUnmount() {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
    }
  }

  onMouseOver = () => this.advanceFrame();

  onMouseOut = () => this.stopAndResetAnimation();

  advanceFrame = () => {
    if (this.props.playBehavior === PlayBehavior.NEVER_PLAY) {
      return;
    }

    const {currentFrame} = this.state;
    const {frameCount} = this.props.animationProps;
    this.setState({
      currentFrame: (currentFrame + 1) % frameCount
    });
    clearTimeout(this.timeout_);
    // 33 maps to a 30 fps frameRate
    this.timeout_ = setTimeout(
      this.advanceFrame,
      33 * this.props.animationProps.frameDelay
    );
  };

  stopAndResetAnimation() {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
      this.timeout_ = undefined;
    }
    this.setState({currentFrame: 0});
  }

  precalculateRenderProps(nextProps) {
    const nextAnimation = nextProps.animationProps;
    const innerWidth = nextProps.width - 2 * MARGIN_PX;
    const innerHeight = nextProps.height - 2 * MARGIN_PX;
    const xScale = innerWidth / nextAnimation.frameSize.x;
    const yScale = innerHeight / nextAnimation.frameSize.y;
    const scale = Math.min(1, Math.min(xScale, yScale));
    const scaledFrameSize = scaleVector2(nextAnimation.frameSize, scale);
    const sourceUrl = nextProps.sourceUrl ? nextProps.sourceUrl : EMPTY_IMAGE;
    const sourceSize = nextAnimation.sourceSize
      ? nextAnimation.sourceSize
      : {x: 1, y: 1};
    this.setState({
      framesPerRow: Math.floor(sourceSize.x / nextAnimation.frameSize.x),
      scaledSourceSize: scaleVector2(sourceSize, scale),
      scaledFrameSize: scaledFrameSize,
      extraTopMargin: Math.ceil((innerHeight - scaledFrameSize.y) / 2),
      wrappedSourceUrl: `url('${sourceUrl}')`
    });
  }

  render() {
    const {
      currentFrame,
      framesPerRow,
      scaledSourceSize,
      scaledFrameSize,
      extraTopMargin,
      wrappedSourceUrl
    } = this.state;

    const row = Math.floor(currentFrame / framesPerRow);
    const column = currentFrame % framesPerRow;
    const xOffset = -scaledFrameSize.x * column;
    const yOffset = -scaledFrameSize.y * row;

    const containerStyle = {
      width: this.props.width,
      height: this.props.height,
      textAlign: 'center'
    };
    const imageStyle = {
      width: scaledFrameSize.x,
      height: scaledFrameSize.y,
      marginTop: MARGIN_PX + extraTopMargin,
      marginLeft: MARGIN_PX,
      marginRight: MARGIN_PX,
      marginBottom: MARGIN_PX,
      backgroundImage: wrappedSourceUrl,
      backgroundRepeat: 'no-repeat',
      backgroundSize: scaledSourceSize.x,
      backgroundPosition: xOffset + 'px ' + yOffset + 'px'
    };

    return (
      <div
        ref="root"
        style={containerStyle}
        onMouseOver={
          this.props.playBehavior !== PlayBehavior.ALWAYS_PLAY
            ? this.onMouseOver
            : null
        }
        onMouseOut={
          this.props.playBehavior !== PlayBehavior.ALWAYS_PLAY
            ? this.onMouseOut
            : null
        }
      >
        <img src={EMPTY_IMAGE} style={imageStyle} />
      </div>
    );
  }
}

function scaleVector2(vector, scale) {
  return {
    x: vector.x * scale,
    y: vector.y * scale
  };
}

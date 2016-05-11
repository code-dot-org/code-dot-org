/** @file Render a gallery image/spritesheet as an animated preview */
import { METADATA_SHAPE } from '../animationMetadata';
const MARGIN_PX = 2;

/**
 * Render an animated preview of a spritesheet at a given size, scaled with
 * a fixed aspect ratio to fit.
 */
const AnimationPreview = React.createClass({
  propTypes: {
    animation: React.PropTypes.shape(METADATA_SHAPE).isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },

  getInitialState: function () {
    return {
      currentFrame: 0,
      framesPerRow: 1,
      scaledSourceWidth: 0,
      scaledFrameWidth: 0,
      scaledFrameHeight: 0,
      extraTopMargin: 0,
      wrappedSourceUrl: ''
    };
  },

  componentWillMount: function () {
    this.precalculateRenderProps(this.props);
  },

  componentWillReceiveProps: function (nextProps) {
    this.precalculateRenderProps(nextProps);
  },

  componentWillUnmount: function () {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
    }
  },

  onMouseOver: function () {
    this.advanceFrame();
  },

  onMouseOut: function () {
    this.stopAndResetAnimation();
  },

  advanceFrame: function () {
    this.setState({
      currentFrame: (this.state.currentFrame + 1) % this.props.animation.frameCount
    });
    clearTimeout(this.timeout_);
    this.timeout_ = setTimeout(this.advanceFrame, 1000 / this.props.animation.frameRate);
  },

  stopAndResetAnimation: function () {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
      this.timeout_ = undefined;
    }
    this.setState({ currentFrame: 0 });
  },

  precalculateRenderProps: function (nextProps) {
    const nextAnimation = nextProps.animation;
    const innerWidth = nextProps.width - 2 * MARGIN_PX;
    const innerHeight = nextProps.height - 2 * MARGIN_PX;
    const xScale = innerWidth / nextAnimation.frameWidth;
    const yScale = innerHeight / nextAnimation.frameHeight;
    const scale = Math.min(1, Math.min(xScale, yScale));
    const scaledFrameHeight = nextAnimation.frameHeight * scale;
    this.setState({
      framesPerRow: Math.floor(nextAnimation.sourceWidth / nextAnimation.frameWidth),
      scaledSourceWidth: nextAnimation.sourceWidth * scale,
      scaledFrameWidth: nextAnimation.frameWidth * scale,
      scaledFrameHeight: scaledFrameHeight,
      extraTopMargin: Math.ceil((innerHeight - scaledFrameHeight) / 2),
      wrappedSourceUrl: `url('${nextAnimation.sourceUrl}')`
    });
  },

  render: function () {
    const { currentFrame, framesPerRow, scaledSourceWidth, scaledFrameWidth,
        scaledFrameHeight, extraTopMargin, wrappedSourceUrl} = this.state;

    const row = Math.floor(currentFrame / framesPerRow);
    const column = currentFrame % framesPerRow;
    const xOffset = -scaledFrameWidth * column;
    const yOffset = -scaledFrameHeight * row;

    const containerStyle = {
      width: this.props.width,
      height: this.props.height
    };
    const imageStyle = {
      width: scaledFrameWidth,
      height: scaledFrameHeight,
      marginTop: MARGIN_PX + extraTopMargin,
      marginLeft: MARGIN_PX,
      marginRight: MARGIN_PX,
      marginBottom: MARGIN_PX,
      backgroundImage: wrappedSourceUrl,
      backgroundRepeat: 'no-repeat',
      backgroundSize: scaledSourceWidth,
      backgroundPosition: xOffset + 'px ' + yOffset + 'px'
    };

    return (
      <div
          ref="root"
          style={containerStyle}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}>
        <img src="/blockly/media/1x1.gif" style={imageStyle} />
      </div>
    );
  }
});
export default AnimationPreview;

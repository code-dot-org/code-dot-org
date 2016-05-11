/** @file Render a gallery image/spritesheet as an animated preview */
import { METADATA_SHAPE } from '../animationMetadata';
var MARGIN_PX = 2;

/**
 * Render an animated preview of a spritesheet at a given size, scaled with
 * a fixed aspect ratio to fit.
 */
var AnimationPreview = React.createClass({
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
    this.setState({ currentFrame: (this.state.currentFrame + 1) % this.props.animation.frameCount });
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
    var framesPerRow = Math.floor(nextProps.animation.sourceWidth / nextProps.animation.frameWidth);
    var innerWidth = nextProps.width - 2 * MARGIN_PX;
    var innerHeight = nextProps.height - 2 * MARGIN_PX;
    var xScale = innerWidth / nextProps.animation.frameWidth;
    var yScale = innerHeight / nextProps.animation.frameHeight;
    var scale = Math.min(1, Math.min(xScale, yScale));
    var scaledFrameHeight = nextProps.animation.frameHeight * scale;
    this.setState({
      framesPerRow: framesPerRow,
      scaledSourceWidth: nextProps.animation.sourceWidth * scale,
      scaledFrameWidth: nextProps.animation.frameWidth * scale,
      scaledFrameHeight: scaledFrameHeight,
      extraTopMargin: Math.ceil((innerHeight - scaledFrameHeight) / 2),
      wrappedSourceUrl: "url('" + nextProps.animation.sourceUrl + "')"
    });
  },

  render: function () {
    var currentFrame = this.state.currentFrame;
    var framesPerRow = this.state.framesPerRow;
    var scaledFrameWidth = this.state.scaledFrameWidth;
    var scaledFrameHeight = this.state.scaledFrameHeight;
    var scaledSourceWidth = this.state.scaledSourceWidth;
    var extraTopMargin = this.state.extraTopMargin;
    var wrappedSourceUrl = this.state.wrappedSourceUrl;

    var row = Math.floor(currentFrame / framesPerRow);
    var column = currentFrame % framesPerRow;
    var xOffset = -scaledFrameWidth * column;
    var yOffset = -scaledFrameHeight * row;

    var containerStyle = {
      width: this.props.width,
      height: this.props.height
    };
    var imageStyle = {
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
        <img src="/blockly/media/1x1.gif" style={imageStyle}/>
      </div>
    );
  }
});
module.exports = AnimationPreview;

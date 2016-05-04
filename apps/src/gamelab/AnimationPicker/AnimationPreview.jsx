/** @file Render a gallery image/spritesheet as an animated preview */

var MARGIN_PX = 2;

/**
 * Render an animated preview of a spritesheet at a given size, scaled with
 * a fixed aspect ratio to fit.
 */
var AnimationPreview = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    sourceUrl: React.PropTypes.string.isRequired,
    sourceWidth: React.PropTypes.number.isRequired,
    sourceHeight: React.PropTypes.number.isRequired,
    frameWidth: React.PropTypes.number.isRequired,
    frameHeight: React.PropTypes.number.isRequired,
    frameCount: React.PropTypes.number.isRequired,
    frameRate: React.PropTypes.number.isRequired
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
    this.setState({ currentFrame: (this.state.currentFrame + 1) % this.props.frameCount });
    clearTimeout(this.timeout_);
    this.timeout_ = setTimeout(this.advanceFrame, 1000 / this.props.frameRate);
  },

  stopAndResetAnimation: function () {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
      this.timeout_ = undefined;
    }
    this.setState({ currentFrame: 0 });
  },

  precalculateRenderProps: function (nextProps) {
    var framesPerRow = Math.floor(nextProps.sourceWidth / nextProps.frameWidth);
    var innerWidth = nextProps.width - 2 * MARGIN_PX;
    var innerHeight = nextProps.height - 2 * MARGIN_PX;
    var xScale = innerWidth / nextProps.frameWidth;
    var yScale = innerHeight / nextProps.frameHeight;
    var scale = Math.min(1, Math.min(xScale, yScale));
    var scaledFrameHeight = nextProps.frameHeight * scale;
    this.setState({
      framesPerRow: framesPerRow,
      scaledSourceWidth: nextProps.sourceWidth * scale,
      scaledFrameWidth: nextProps.frameWidth * scale,
      scaledFrameHeight: scaledFrameHeight,
      extraTopMargin: Math.ceil((innerHeight - scaledFrameHeight) / 2),
      wrappedSourceUrl: "url('" + nextProps.sourceUrl + "')"
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

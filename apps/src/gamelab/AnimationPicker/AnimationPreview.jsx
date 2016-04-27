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
      currentFrame: 0
    };
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
    this.timeout_ = setTimeout(this.advanceFrame, 1000 / this.props.frameRate);
  },

  stopAndResetAnimation: function () {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
      this.timeout_ = undefined;
    }
    this.setState({ currentFrame: 0 });
  },

  render: function () {
    var xScale = (this.props.width - 2 * MARGIN_PX) / this.props.frameWidth;
    var yScale = (this.props.height - 2 * MARGIN_PX) / this.props.frameHeight;
    var scale = Math.min(Math.min(xScale, yScale), 1);
    var framesPerRow = Math.floor(this.props.sourceWidth / this.props.frameWidth);

    var xOffset = -this.props.frameWidth * scale * (this.state.currentFrame % framesPerRow);
    var yOffset = -this.props.frameHeight * scale * Math.floor(this.state.currentFrame / framesPerRow);
    var containerStyle = {
      width: this.props.width,
      height: this.props.height
    };
    var imageStyle = {
      width: this.props.frameWidth * scale - 2,
      height: this.props.frameHeight * scale - 2,
      marginTop: MARGIN_PX + (this.props.height - this.props.frameHeight * scale) / 2,
      marginLeft: MARGIN_PX,
      marginRight: MARGIN_PX,
      marginBottom: MARGIN_PX,
      backgroundImage: "url('" + this.props.sourceUrl + "')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: this.props.sourceWidth * scale,
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

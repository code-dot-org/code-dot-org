/** @file Render a gallery image/spritesheet as an animated preview */

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
      timeout: null
    };
  },

  componentDidMount: function () {
    var advanceFrame = function () {
      this.setState({
        currentFrame: (this.state.currentFrame + 1) % this.props.frameCount,
        timeout: setTimeout(advanceFrame, 1000/this.props.frameRate)
      });
    }.bind(this);
    advanceFrame();
  },

  componentWillUnmount: function () {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
  },

  render: function () {
    var xScale = this.props.width / this.props.frameWidth;
    var yScale = this.props.height / this.props.frameHeight;
    var scale = Math.min(Math.min(xScale, yScale), 1);
    var framesPerRow = Math.floor(this.props.sourceWidth / this.props.frameWidth);

    var xOffset = -this.props.frameWidth * scale * (this.state.currentFrame % framesPerRow);
    var yOffset = -this.props.frameHeight * scale * Math.floor(this.state.currentFrame / framesPerRow);
    var imageStyle = {
      width: this.props.frameWidth * scale,
      height: this.props.frameHeight * scale,
      marginTop: (this.props.height - this.props.frameHeight * scale) / 2,
      backgroundImage: "url('" + this.props.sourceUrl + "')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: this.props.sourceWidth * scale,
      backgroundPosition: xOffset + 'px ' + yOffset + 'px',
    };
    return <img src="/blockly/media/1x1.gif" style={imageStyle}/>;
  }
});
module.exports = AnimationPreview;

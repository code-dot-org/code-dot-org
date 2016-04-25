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
      currentFrame: 0
    };
  },

  componentDidMount: function () {
    this.advanceFrame_ = function () {
      this.setState({ currentFrame: (this.state.currentFrame + 1) % this.props.frameCount });
      this.timeout_ = setTimeout(this.advanceFrame_, 1000/this.props.frameRate);
    }.bind(this);
    this.advanceFrame_();
  },

  componentWillUnmount: function () {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
    }
  },

  onMouseOver: function (event) {
    if (this.timeout_) {
      clearTimeout(this.timeout_);
    }

    document.addEventListener('mousemove', this.onMouseMove);
    this.scrub(event);
  },

  onMouseMove: function (event) {
    this.scrub(event);
  },

  scrub: function (event) {
    var rect = this.refs.root.getBoundingClientRect();
    var progress = Math.min(0.999, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.setState({ currentFrame: Math.floor(progress * this.props.frameCount) });
  },

  onMouseOut: function () {
    document.removeEventListener('mousemove', this.onMouseMove);
    this.advanceFrame_();
  },

  render: function () {
    var xScale = this.props.width / this.props.frameWidth;
    var yScale = this.props.height / this.props.frameHeight;
    var scale = Math.min(Math.min(xScale, yScale), 1);
    var framesPerRow = Math.floor(this.props.sourceWidth / this.props.frameWidth);

    var xOffset = -this.props.frameWidth * scale * (this.state.currentFrame % framesPerRow);
    var yOffset = -this.props.frameHeight * scale * Math.floor(this.state.currentFrame / framesPerRow);
    var containerStyle = {
      width: this.props.width,
      height: this.props.height
    };
    var imageStyle = {
      width: this.props.frameWidth * scale,
      height: this.props.frameHeight * scale,
      marginTop: (this.props.height - this.props.frameHeight * scale) / 2,
      backgroundImage: "url('" + this.props.sourceUrl + "')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: this.props.sourceWidth * scale,
      backgroundPosition: xOffset + 'px ' + yOffset + 'px',
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

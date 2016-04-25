/** @file Render a gallery image/spritesheet as an animated preview */

var AnimationPreview = React.createClass({
  propTypes: {
    sourceUrl: React.PropTypes.string.isRequired,
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
    var xOffset = -this.props.frameWidth * this.state.currentFrame;
    var style = {
      backgroundImage: "url('" + this.props.sourceUrl + "')",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: xOffset + 'px 0px',
      width: this.props.frameWidth,
      height: this.props.frameHeight
    };
    return <img src="/blockly/media/1x1.gif" style={style}/>;
  }
});
module.exports = AnimationPreview;

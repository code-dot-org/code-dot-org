var styles = {
  hidden: {
    display: 'none'
  }
};

var Visualization = React.createClass({
  propTypes: {
    appWidth: React.PropTypes.number.isRequired,
    appHeight: React.PropTypes.number.isRequired,
  },

  render: function () {
    return (
      <div>
        <div id="divApplab" className="appModern" tabIndex="1">
        </div>
        <div id="designModeViz" className="appModern" style={styles.hidden}>
        </div>
        <svg version="1.1"
             baseProfile="full"
             xmlns="http://www.w3.org/2000/svg"
             id="visualizationOverlay"
             width={this.props.appWidth}
             height={this.props.appHeight}
             viewBox={"0 0 " + this.props.appWidth + " " + this.props.appHeight}
             pointer-events="none"></svg>
      </div>
    );
  }
});

module.exports = Visualization;

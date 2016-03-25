var _ = require('lodash');
var color = require('../../color');

var HeightResizer = React.createClass({

  propTypes: {
    style: React.PropTypes.object
  },

  render: function () {
    var style = {
      width: '100%',
      color: color.lighter_gray,
      fontSize: 24,
      textAlign: 'center',
      cursor: 'ns-resize',
      whiteSpace: 'nowrap',
      lineHeight: this.props.style.height + 'px'
    };

    return (
      <div style={this.props.style}>
        <div style={style} className="fa fa-ellipsis-h"/>
      </div>
    );
  }
});

module.exports = HeightResizer;

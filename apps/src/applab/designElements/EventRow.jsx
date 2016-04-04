/* global $ */
var color = require('../../color');
var rowStyle = require('./rowStyle');

var EventRow = module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    desc: React.PropTypes.string.isRequired,
    handleInsert: React.PropTypes.func.isRequired
  },

  render: function() {
    var style = {
      container: $.extend({}, rowStyle.container, rowStyle.maxWidth),
      name: {
        color: color.dark_charcoal,
        fontWeight: 'bold',
        fontSize: 15
      },
      desc: {
        color: color.light_gray,
        fontStyle: 'italic'
      }
    };

    return (
      <div style={style.container}>
        <div style={style.name}>
          {this.props.name}
        </div>
        <div style={style.desc}>
          {this.props.desc}
        </div>
        <div>
          <a onClick={this.props.handleInsert} className='hover-pointer'>Insert and show code</a>
        </div>
      </div>
    );
  }
});

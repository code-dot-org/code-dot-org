/* global $ */
var React = require('react');
var rowStyle = require('./rowStyle');

var EventRow = module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    desc: React.PropTypes.string.isRequired,
    handleInsert: React.PropTypes.func.isRequired
  },

  handleInsert: function() {
    this.props.handleInsert();
  },

  render: function() {
    var style = {
      container: $.extend({}, rowStyle.container, rowStyle.maxWidth),
      name: {
        color: '#4d575f',
        fontWeight: 'bold',
        fontSize: 15
      },
      desc: {
        color: '#949ca2',
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
          <a onClick={this.handleInsert} className='hover-pointer'>Insert and show code</a>
        </div>
      </div>
    );
  }
});
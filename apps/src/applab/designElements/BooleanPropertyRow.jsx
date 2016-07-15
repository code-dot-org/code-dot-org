var React = require('react');
var rowStyle = require('./rowStyle');

var BooleanPropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.bool.isRequired,
    handleChange: React.PropTypes.func,
    desc: React.PropTypes.node,
  },

  getInitialState: function () {
    return {
      isChecked: this.props.initialValue
    };
  },

  handleClick: function () {
    var checked = !this.state.isChecked;
    this.props.handleChange(checked);
    this.setState({isChecked: checked});
  },

  render: function () {
    var classes = 'custom-checkbox fa';
    if (this.state.isChecked) {
      classes += ' fa-check-square-o';
    } else {
      classes += ' fa-square-o';
    }

    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <div
            className={classes}
            style={rowStyle.checkbox}
            onClick={this.handleClick}/>
        </div>
      </div>
    );
  }
});

module.exports = BooleanPropertyRow;

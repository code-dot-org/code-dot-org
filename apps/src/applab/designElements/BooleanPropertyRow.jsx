import React, {PropTypes} from 'react';
import * as rowStyle from './rowStyle';

var BooleanPropertyRow = React.createClass({
  propTypes: {
    initialValue: PropTypes.bool.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
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
            onClick={this.handleClick}
          />
        </div>
      </div>
    );
  }
});

export default BooleanPropertyRow;

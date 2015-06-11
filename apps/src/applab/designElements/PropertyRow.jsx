/* global $ */
var React = require('react');
var rowStyle = require('./rowStyle.jsx');

var LockState = {
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED'
};

var PropertyRow = React.createClass({
  propTypes: {
    desc: React.PropTypes.string.isRequired,
    initialValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    isNumber: React.PropTypes.bool,
    lockState: React.PropTypes.oneOf([LockState.LOCKED, LockState.UNLOCKED, undefined]),
    isMultiLine: React.PropTypes.bool,
    handleChange: React.PropTypes.func,
    handleLockChange: React.PropTypes.func,
    extraRowStyle: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({value: newProps.initialValue});
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
    this.setState({value: value});
  },

  handleClickLock: function () {
    if (this.props.lockState === LockState.LOCKED) {
      this.props.handleLockChange(LockState.UNLOCKED);
    } else if (this.props.lockState === LockState.UNLOCKED) {
      this.props.handleLockChange(LockState.LOCKED);
    }
  },

  render: function() {
    var rowContainerStyle = $.extend({}, rowStyle.container, this.props.extraRowStyle || {});

    var inputElement;
    if (this.props.isMultiLine) {
      inputElement = <textarea
        value={this.state.value}
        onChange={this.handleChangeInternal} />;
    } else {
      inputElement = <input
        type={this.props.isNumber ? 'number' : undefined}
        value={this.state.value}
        onChange={this.handleChangeInternal}
        style={rowStyle.input} />;
    }

    var lockStyle = {
      marginLeft: '5px'
    };

    var lockIcon;
    // state is either locked/unlocked or undefined (no icon)
    if (this.props.lockState) {
      var lockClass = "fa fa-" + (this.props.lockState === LockState.LOCKED ?
        'lock' : 'unlock');
      lockIcon = (<i
        className={lockClass}
        style={lockStyle}
        onClick={this.handleClickLock}/>
      );
    }

    return (
      <div style={rowContainerStyle}>
        <div>{this.props.desc}</div>
        <div>
          {inputElement}
          {lockIcon}
        </div>
      </div>
    );
  }
});
PropertyRow.LockState = LockState;

module.exports = PropertyRow;
